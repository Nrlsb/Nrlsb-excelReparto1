import React, { useState } from 'react';
import { toast } from 'react-toastify';

function RepartoForm({ onAddReparto }) {
  const [destino, setDestino] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horarios, setHorarios] = useState('');
  const [bultos, setBultos] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destino || !direccion || !bultos) {
      toast.warn('Por favor, completa los campos obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAddReparto({
        destino,
        direccion,
        horarios,
        bultos: parseInt(bultos),
        agregado_por: 'WebApp'
      });
      
      // Limpiar formulario
      setDestino('');
      setDireccion('');
      setHorarios('');
      setBultos('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <input 
            type="text" 
            value={destino} 
            onChange={(e) => setDestino(e.target.value)} 
            placeholder="Destino" 
            required 
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
          <input 
            type="text" 
            value={direccion} 
            onChange={(e) => setDireccion(e.target.value)} 
            placeholder="Dirección" 
            required 
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
          <input 
            type="text" 
            value={horarios} 
            onChange={(e) => setHorarios(e.target.value)} 
            placeholder="Horarios (Ej: 9-18hs)" 
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
          <input 
            type="number" 
            value={bultos} 
            onChange={(e) => setBultos(e.target.value)} 
            placeholder="Bultos" 
            required 
            min="1" 
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <button 
          type="submit" 
          className="w-full p-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100" 
          disabled={isSubmitting}>
          {isSubmitting ? 'Agregando...' : 'Agregar Reparto'}
        </button>
      </form>
    </div>
  );
}

export default RepartoForm;
