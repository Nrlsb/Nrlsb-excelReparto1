// src/components/RepartoRow.js
import React, { useState } from 'react';

function RepartoRow({ reparto, onUpdate, onDelete, isAdmin, orderNumber, eta, conflictInfo, isOptimizedView }) {
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

  const fullAddress = `${reparto.direccion}, Esperanza, Santa Fe, Argentina`;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(fullAddress)}`;

  // --- MODIFICACIÓN CLAVE PARA RESPONSIVE ---
  // Estilos para las celdas y los labels en móvil
  const cellClass = "block sm:table-cell p-4 sm:border-b border-gray-200 text-gray-700 text-left sm:text-left relative";
  const labelClass = "sm:hidden font-bold mr-2 absolute top-4 left-4";


  if (isEditing) {
    // El modo edición se mantiene simple y se muestra mejor en escritorio
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

  const conflictClass = conflictInfo?.hasConflict ? 'bg-red-100 hover:bg-red-200' : '';
  const startClass = isStartLocation ? 'bg-green-100 font-semibold' : 'hover:bg-gray-50';
  const mobileCardClass = 'block mb-4 border rounded-lg overflow-hidden sm:table-row sm:mb-0 sm:border-none sm:rounded-none';

  return (
    <tr className={`${mobileCardClass} ${conflictClass} ${startClass} transition-colors duration-200`}>
      <td className={`${cellClass} sm:font-medium`}>
        <span className={labelClass}>{isOptimizedView ? 'Orden' : 'ID'}</span>
        <div className="sm:w-auto w-full text-right">
            {orderNumber ? (
                <span className={`rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs ml-auto sm:ml-0 ${isStartLocation ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {orderNumber}
                </span>
            ) : (
                reparto.id
            )}
        </div>
      </td>
      <td className={cellClass}><span className={labelClass}>Destino</span><span className="block text-right sm:text-left">{reparto.destino}</span></td>
      <td className={cellClass}><span className={labelClass}>Dirección</span><span className="block text-right sm:text-left">{reparto.direccion}</span></td>
      <td className={cellClass}>
        <span className={labelClass}>Horarios</span>
        <div className="text-right sm:text-left">
          {reparto.horarios}
          {conflictInfo?.hasConflict && (
            <div className="text-red-600 text-xs font-semibold mt-1" title={`Llegada estimada: ${eta}hs`}>
              ⚠️ {conflictInfo.message}
            </div>
          )}
        </div>
      </td>
      <td className={cellClass}><span className={labelClass}>Bultos</span><span className="block text-right sm:text-left">{reparto.bultos}</span></td>
      {isOptimizedView && (
        <td className={`${cellClass} text-sm`}>
          <span className={labelClass}>Tramo/ETA</span>
          <div className="text-right sm:text-left">
            {reparto.legData ? (
              <div>
                <div className="font-semibold">{reparto.legData.duration} <span className="text-gray-500">({reparto.legData.distance})</span></div>
                <div className="text-blue-600 text-xs">Llegada est: {eta}hs</div>
              </div>
            ) : (
              isStartLocation ? 'Punto de partida' : '-'
            )}
          </div>
        </td>
      )}
      {isAdmin && <td className={cellClass}><span className={labelClass}>Agregado por</span><span className="block text-right sm:text-left">{reparto.agregado_por}</span></td>}
      <td className={`${cellClass} sm:text-center`}>
        <span className={labelClass}>Acciones</span>
        <div className="flex justify-end sm:justify-center gap-1 flex-wrap">
          <button disabled={isStartLocation} className="px-2 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setIsEditing(true)}>✏️</button>
          <button disabled={isStartLocation} className="px-2 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => onDelete(reparto.id)}>🗑️</button>
          {!isStartLocation && (
            <>
              <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 inline-block">🗺️</a>
              <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-sm font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600 inline-block">🚗</a>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default RepartoRow;
