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
      // Reemplazamos el alert por una notificación
      toast.warn('Por favor, completa los campos obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    await onAddReparto({
      destino,
      direccion,
      horarios,
      bultos: parseInt(bultos),
      agregado_por: 'WebApp' // O un identificador de usuario si tuvieras login
    });
    
    // Limpiar formulario
    setDestino('');
    setDireccion('');
    setHorarios('');
    setBultos('');
    setIsSubmitting(false);
  };

  return (
    <div className="form-section">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <input type="text" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Destino" required />
          <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección" required />
          <input type="text" value={horarios} onChange={(e) => setHorarios(e.target.value)} placeholder="Horarios (Ej: 9-18hs)" />
          <input type="number" value={bultos} onChange={(e) => setBultos(e.target.value)} placeholder="Bultos" required min="1" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Agregando...' : 'Agregar Reparto'}
        </button>
      </form>
    </div>
  );
}

export default RepartoForm;
