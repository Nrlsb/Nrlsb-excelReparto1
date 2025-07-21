// src/components/Account.js
// --- ARCHIVO NUEVO ---
import React, { useState } from 'react';

function Account({ session, onClose, onSave }) {
  const [username, setUsername] = useState(session?.user?.user_metadata?.username || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(username);
    setLoading(false);
  };

  return (
    // Fondo oscuro semi-transparente
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Contenedor del modal */}
      <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-md w-full relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Cuenta</h2>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={session?.user?.email}
              disabled
              className="w-full p-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-base cursor-not-allowed"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border-none rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Account;
