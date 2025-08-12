// src/components/LocationModal.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';

function LocationModal({ isOpen, onClose, onOptimize, isOptimizing }) {
  const [manualAddress, setManualAddress] = useState('');
  // --- NUEVO: Estado para el modelo de tráfico ---
  const [trafficModel, setTrafficModel] = useState('best_guess');

  if (!isOpen) {
    return null;
  }

  const handleUseCurrentLocation = () => {
    // --- MODIFICADO: Se pasa el modelo de tráfico ---
    onOptimize(null, trafficModel);
  };

  const handleUseManualAddress = () => {
    if (manualAddress.trim() === '') {
      toast.warn('Por favor, ingresa una dirección.');
      return;
    }
    // --- MODIFICADO: Se pasa la dirección y el modelo de tráfico ---
    onOptimize(manualAddress, trafficModel);
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
        {/* --- MODIFICADO: Título actualizado --- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Punto de Partida y Opciones</h2>
        
        {/* --- NUEVO: Selector para el modelo de tráfico --- */}
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trafficModel">
              Modelo de Tráfico
            </label>
            <select
              id="trafficModel"
              value={trafficModel}
              onChange={(e) => setTrafficModel(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              <option value="best_guess">Mejor estimación (recomendado)</option>
              <option value="pessimistic">Pesimista</option>
              <option value="optimistic">Optimista</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">"Mejor estimación" utiliza datos históricos y en tiempo real para una predicción más precisa.</p>
        </div>

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
