import React from 'react';

function Header() {
  return (
    <header className="text-center mb-8 pb-6 border-b border-gray-200">
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent m-0">
        📦 Gestión de Repartos
      </h1>
      <p className="text-gray-500 text-md sm:text-lg mt-2">
        App escalada con React, Node.js y Supabase
      </p>
    </header>
  );
}

export default Header;
