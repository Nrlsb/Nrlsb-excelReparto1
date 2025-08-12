// src/components/RepartoRow.js
import React, { useState } from 'react';

// La lógica de cálculo de tiempo se movió a RepartosTable.js
// Este componente ahora solo recibe y muestra la información.

function RepartoRow({ reparto, onUpdate, onDelete, isAdmin, orderNumber, eta, conflictInfo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReparto, setEditedReparto] = useState({ ...reparto });

  const isStartLocation = reparto.id === 'start_location';
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReparto(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const dataToUpdate = {
        ...editedReparto,
        bultos: parseInt(editedReparto.bultos, 10) || 1
    };
    onUpdate(reparto.id, dataToUpdate);
    setIsEditing(false);
  };
  
  const commonInputClass = "w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400";

  if (isEditing) {
    // El modo edición no necesita grandes cambios
    return (
      <tr className="bg-purple-50">
        <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.id}</td>
        <td className="p-4 border-b border-gray-200"><input type="text" name="destino" value={editedReparto.destino} onChange={handleInputChange} className={commonInputClass} /></td>
        <td className="p-4 border-b border-gray-200"><input type="text" name="direccion" value={editedReparto.direccion} onChange={handleInputChange} className={commonInputClass} /></td>
        <td className="p-4 border-b border-gray-200"><input type="text" name="horarios" value={editedReparto.horarios} onChange={handleInputChange} className={commonInputClass} /></td>
        <td className="p-4 border-b border-gray-200"><input type="number" name="bultos" value={editedReparto.bultos} onChange={handleInputChange} min="1" className={commonInputClass} /></td>
        {orderNumber && <td className="p-4 border-b border-gray-200"></td>}
        {isAdmin && <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.agregado_por}</td>}
        <td className="p-4 border-b border-gray-200 text-center">
          <div className="flex justify-center gap-2">
            <button className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600" onClick={handleSave}>✔</button>
            <button className="px-3 py-1 text-sm font-semibold text-white bg-gray-400 rounded-md hover:bg-gray-500" onClick={() => setIsEditing(false)}>✖</button>
          </div>
        </td>
      </tr>
    );
  }

  // Se añade clase condicional para resaltar conflictos
  const rowClass = conflictInfo?.hasConflict 
    ? 'bg-red-100 hover:bg-red-200' 
    : (isStartLocation ? 'bg-green-100 font-semibold' : 'hover:bg-gray-50');

  return (
    <tr className={`${rowClass} transition-colors duration-200`}>
      <td className="p-4 border-b border-gray-200 text-gray-700 font-medium">
        {orderNumber ? (
            <span className={`rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs ${isStartLocation ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                {orderNumber}
            </span>
        ) : (
            reparto.id
        )}
      </td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.destino}</td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.direccion}</td>
      <td className="p-4 border-b border-gray-200 text-gray-700">
        {reparto.horarios}
        {/* Mensaje de conflicto */}
        {conflictInfo?.hasConflict && (
          <div className="text-red-600 text-xs font-semibold mt-1" title={`Llegada estimada: ${eta}hs`}>
            ⚠️ {conflictInfo.message}
          </div>
        )}
      </td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.bultos}</td>
      {orderNumber && (
        <td className="p-4 border-b border-gray-200 text-gray-700 text-sm">
          {reparto.legData ? (
            <div>
              <div className="font-semibold">{reparto.legData.duration} <span className="text-gray-500">({reparto.legData.distance})</span></div>
              <div className="text-blue-600 text-xs">Llegada est: {eta}hs</div>
            </div>
          ) : (
            isStartLocation ? 'Punto de partida' : '-'
          )}
        </td>
      )}
      {isAdmin && <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.agregado_por}</td>}
      <td className="p-4 border-b border-gray-200 text-center">
        <div className="flex justify-center gap-2">
          <button disabled={isStartLocation} className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setIsEditing(true)}>✏️</button>
          <button disabled={isStartLocation} className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => onDelete(reparto.id)}>🗑️</button>
        </div>
      </td>
    </tr>
  );
}

export default RepartoRow;
