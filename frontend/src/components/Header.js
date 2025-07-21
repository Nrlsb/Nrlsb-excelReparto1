// src/components/Header.js
// --- ARCHIVO MODIFICADO para abrir el modal de cuenta ---
import React from 'react';
import { supabase } from '../supabaseClient';

function Header({ session, onOpenAccountModal }) { // Añadimos la nueva prop
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const username = session?.user?.user_metadata?.username || session?.user?.email;

  return (
    <header className="text-center mb-8 pb-6 border-b border-gray-200 relative">
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent m-0">
        📦 Gestión de Repartos
      </h1>
      <p className="text-gray-500 text-md sm:text-lg mt-2">
        App escalada con React, Node.js y Supabase
      </p>
      {session && (
        <div className="absolute top-0 right-0 flex items-center gap-4">
          {/* El nombre de usuario ahora es un botón para abrir el modal */}
          <button 
            onClick={onOpenAccountModal}
            className="text-sm text-gray-600 hidden sm:inline font-semibold hover:text-purple-600 hover:underline transition-colors"
          >
            {username}
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition-colors"
          >
            Salir
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
