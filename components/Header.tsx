
import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  activeProcedure?: string | null;
  user?: User | null;
}

export const Header: React.FC<HeaderProps> = ({ activeProcedure, user }) => {
  return (
    <header className="bg-gray-800 shadow-md relative z-10">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
           <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center shadow-md border-2 border-yellow-500 flex-shrink-0">
             <span className="text-lg font-bold text-gray-100">CP</span>
           </div>
           <div className="flex flex-col">
             <h1 className="text-lg md:text-xl font-bold text-gray-100 leading-tight">
               Consulta Procedimientos Policiales
             </h1>
             {user && (
               <div className="flex items-center text-xs text-green-400 font-medium">
                 <span className="mr-1">Oficial:</span>
                 <span className="text-gray-300">{user.name} {user.surname}</span>
               </div>
             )}
           </div>
        </div>
         <div className="flex flex-col items-end">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider hidden md:block">Asistente Táctico</div>
            {user && <div className="text-[10px] text-gray-500 mt-0.5 hidden md:block">Ref: {user.subject}</div>}
         </div>
      </div>
      
      {activeProcedure && (
        <div className="bg-blue-900/40 border-y border-blue-800/50 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center justify-center text-blue-200 text-sm font-medium animate-pulse">
            <span className="mr-2 h-2 w-2 rounded-full bg-blue-400 inline-block"></span>
            Procedimiento Activo: {activeProcedure}
          </div>
        </div>
      )}
    </header>
  );
};
