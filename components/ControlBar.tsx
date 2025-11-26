
import React from 'react';

interface ControlBarProps {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  onToggleConnection: () => void;
}

const MicrophoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm-1 3a4 4 0 00-4 4v1a1 1 0 001 1h10a1 1 0 001-1v-1a4 4 0 00-4-4V7zM14 11v1a2 2 0 11-4 0v-1a2 2 0 114 0z" clipRule="evenodd" />
  </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v6H9z" />
    </svg>
);


export const ControlBar: React.FC<ControlBarProps> = ({ status, onToggleConnection }) => {
  
  const getButtonContent = () => {
    switch (status) {
      case 'idle':
        return { icon: <MicrophoneIcon />, text: 'Iniciar Asistente', color: 'bg-green-600 hover:bg-green-700', disabled: false };
      case 'connecting':
        return { icon: <div className="h-8 w-8 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>, text: 'Conectando...', color: 'bg-yellow-600', disabled: true };
      case 'connected':
        return { icon: <StopIcon />, text: 'Detener Asistente', color: 'bg-red-600 hover:bg-red-700', disabled: false };
      case 'error':
         return { icon: <MicrophoneIcon />, text: 'Reintentar Conexión', color: 'bg-blue-600 hover:bg-blue-700', disabled: false };
      default:
        return { icon: <MicrophoneIcon />, text: 'Iniciar', color: 'bg-gray-600', disabled: true };
    }
  };

  const { icon, text, color, disabled } = getButtonContent();

  return (
    <footer className="bg-gray-800/80 backdrop-blur-sm p-4 sticky bottom-0 border-t border-gray-700">
      <div className="flex flex-col items-center justify-center space-y-2">
        <button
          onClick={onToggleConnection}
          disabled={disabled}
          className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-full text-white font-semibold transition-all duration-200 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white ${color} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {icon}
          <span className="text-lg">{text}</span>
        </button>
        <p className="text-xs text-gray-400 capitalize">
          Estado: {status === 'connected' ? 'Conectado y Escuchando' : status}
        </p>
      </div>
    </footer>
  );
};
