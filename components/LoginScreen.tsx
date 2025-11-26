
import React, { useState } from 'react';
import type { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && surname && subject) {
      onLogin({ name, surname, subject });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div className="flex flex-col items-center mb-8">
           <div className="w-32 h-32 rounded-full bg-green-900 flex items-center justify-center mb-6 shadow-2xl border-4 border-yellow-500">
             <span className="text-6xl font-bold text-gray-100">CP</span>
           </div>
           <h2 className="text-2xl font-bold text-center text-gray-100">
             Consulta Procedimientos Policiales
           </h2>
           <p className="text-sm text-gray-400 mt-2 text-center">
             Sistema de Asistencia Táctica en Tiempo Real
           </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none text-white placeholder-gray-500 transition-all"
                placeholder="Ej. Juan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Apellido</label>
              <input
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none text-white placeholder-gray-500 transition-all"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nombre de la Consulta</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none text-white placeholder-gray-500 transition-all"
              placeholder="Ej. Operativo Calle 10 o Caso Hurto"
            />
            <p className="text-xs text-gray-500 mt-1">Identifique esta sesión para el registro estadístico.</p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 rounded-lg font-bold text-lg text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-green-500/50 mt-6 flex items-center justify-center gap-2"
          >
            <span>Iniciar Turno</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
      <footer className="mt-8 text-gray-500 text-xs text-center font-medium tracking-wide">
        @2025 Escuela de Policía Gabriel Gonzales López
      </footer>
    </div>
  );
};
