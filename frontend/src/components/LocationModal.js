// src/components/LocationModal.js
import React, { useState } from 'react';

function LocationModal({ isOpen, onClose, onOptimize, isOptimizing }) {
  const [manualAddress, setManualAddress] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleUseCurrentLocation = () => {
    onOptimize(); // No se pasan argumentos para usar la geolocalización
  };

  const handleUseManualAddress = () => {
    if (manualAddress.trim() === '') {
      alert('Por favor, ingresa una dirección.'); // Se puede reemplazar con un toast
      return;
    }
    onOptimize(manualAddress);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-md w-full relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Punto de Partida</h2>
        
        <div className="space-y-4">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isOptimizing}
            className="w-full p-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 disabled:opacity-60"
          >
            {isOptimizing ? 'Obteniendo...' : '📍 Usar mi ubicación actual'}
          </button>

          <div className="text-center text-gray-500">o</div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manualAddress">
              Ingresar dirección de partida manualmente
            </label>
            <input
              id="manualAddress"
              type="text"
              placeholder="Ej: San Martín 1234, Esperanza"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <button
            onClick={handleUseManualAddress}
            disabled={isOptimizing || !manualAddress}
            className="w-full p-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 disabled:opacity-60"
          >
            {isOptimizing ? 'Optimizando...' : 'Optimizar desde esta dirección'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationModal;
