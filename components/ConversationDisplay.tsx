
import React, { useEffect, useRef } from 'react';
import type { Transcript } from '../types';

interface ConversationDisplayProps {
  transcripts: Transcript[];
}

export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ transcripts }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);
  
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const ModelIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V4m0 16v-2M8 8l2-2m-2 10l2-2m6-6l-2-2m2 10l-2 2" />
    </svg>
  );


  return (
    <div className="space-y-6">
      {transcripts.map((item, index) => (
        <div key={index} className={`flex items-start gap-3 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          {item.speaker === 'model' && <div className="flex-shrink-0"><ModelIcon /></div>}
          
          <div className={`max-w-xl p-4 rounded-xl shadow-md ${item.speaker === 'user' ? 'bg-blue-900/50 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
            <p className="text-base">{item.text}</p>
          </div>

          {item.speaker === 'user' && <div className="flex-shrink-0"><UserIcon /></div>}
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
