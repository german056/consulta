
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { SYSTEM_INSTRUCTION, PROCEDURE_TOOL } from './constants';
import { decode, encode, decodeAudioData } from './services/audioUtils';
import { Header } from './components/Header';
import { ConversationDisplay } from './components/ConversationDisplay';
import { ControlBar } from './components/ControlBar';
import { LoginScreen } from './components/LoginScreen';
import type { Transcript, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [activeProcedure, setActiveProcedure] = useState<string | null>(null);
  
  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const cleanup = useCallback(() => {
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    sessionRef.current?.close();
    sessionRef.current = null;
    setActiveProcedure(null);
  }, []);

  const handleToggleConnection = useCallback(async () => {
    if (status === 'connected') {
      setStatus('idle');
      setTranscripts([]);
      cleanup();
      return;
    }

    setStatus('connecting');
    setTranscripts([{ speaker: 'model', text: 'Iniciando asistente... Por favor, espere.' }]);
    setActiveProcedure(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Personalize system instruction with user context
      const personalizedInstruction = `${SYSTEM_INSTRUCTION}
      
      NOTA DE CONTEXTO OPERATIVO:
      El funcionario actual es: ${user?.name} ${user?.surname}.
      El asunto o referencia de la consulta es: "${user?.subject}".
      Diríjase al funcionario de manera formal y profesional, utilizando su apellido cuando sea apropiado.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: personalizedInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: [PROCEDURE_TOOL] }],
        },
        callbacks: {
          onopen: () => {
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
              mediaStreamRef.current = stream;
              const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = scriptProcessor;

              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob: Blob = {
                  data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current!.destination);
              setStatus('connected');
              setTranscripts([{ speaker: 'model', text: `¡Atento, Oficial ${user?.surname}! Soy su Asistente Táctico. ¿En qué procedimiento del caso "${user?.subject}" requiere apoyo?` }]);
            }).catch(err => {
               console.error('Error getting user media:', err);
               setStatus('error');
               setTranscripts(prev => [...prev, { speaker: 'model', text: 'Error: No se pudo acceder al micrófono. Por favor, verifique los permisos.' }]);
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              const functionResponses = message.toolCall.functionCalls.map(fc => {
                if (fc.name === 'setActiveProcedure') {
                  const args = fc.args as any;
                  setActiveProcedure(args.procedureName);
                  return {
                    id: fc.id,
                    name: fc.name,
                    response: { result: `Procedure "${args.procedureName}" activated in UI.` }
                  };
                }
                return {
                  id: fc.id,
                  name: fc.name,
                  response: { result: 'Function not found' }
                };
              });

              sessionPromise.then((session) => {
                session.sendToolResponse({ functionResponses });
              });
            }

            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentInputTranscriptionRef.current += text;
              setTranscripts(prev => {
                const last = prev[prev.length - 1];
                if (last?.speaker === 'user') {
                  return [...prev.slice(0, -1), { speaker: 'user', text: currentInputTranscriptionRef.current }];
                }
                return [...prev, { speaker: 'user', text: currentInputTranscriptionRef.current }];
              });
            }

            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                currentOutputTranscriptionRef.current += text;
                 setTranscripts(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.speaker === 'model') {
                        return [...prev.slice(0, -1), { speaker: 'model', text: currentOutputTranscriptionRef.current }];
                    }
                    return [...prev, { speaker: 'model', text: currentOutputTranscriptionRef.current }];
                });
            }

            if (message.serverContent?.turnComplete) {
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                
                source.onended = () => {
                  audioSourcesRef.current.delete(source);
                };
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus('error');
            setTranscripts(prev => [...prev, { speaker: 'model', text: 'Se ha producido un error en la conexión. Por favor, intente de nuevo.' }]);
            cleanup();
          },
          onclose: () => {
            cleanup();
            if(status !== 'idle') {
              setStatus('idle');
            }
          },
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('error');
      setTranscripts(prev => [...prev, { speaker: 'model', text: 'Error al conectar con el servicio. Verifique su API Key y la conexión a internet.' }]);
      cleanup();
    }
  }, [status, cleanup, user]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header activeProcedure={activeProcedure} user={user} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ConversationDisplay transcripts={transcripts} />
      </main>
      <ControlBar status={status} onToggleConnection={handleToggleConnection} />
    </div>
  );
};

export default App;
