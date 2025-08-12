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
  // Componente interno para las celdas en vista móvil
  const MobileCell = ({ label, children }) => (
    <div className="flex justify-between items-center p-3 border-b border-gray-200">
      <span className="font-semibold text-gray-600">{label}</span>
      <div className="text-right text-gray-800">{children}</div>
    </div>
  );

  if (isEditing) {
    // El modo edición se mantiene simple y se muestra mejor en escritorio
    return (
       <tr className="bg-purple-50 hidden sm:table-row">
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

  const conflictClass = conflictInfo?.hasConflict ? 'bg-red-100' : '';
  const startClass = isStartLocation ? 'bg-green-100' : 'bg-white';
  
  // --- RENDERIZADO COMPLETAMENTE NUEVO PARA MÓVIL ---
  return (
    <>
      {/* --- VISTA MÓVIL (TARJETA) --- */}
      <tr className={`sm:hidden block mb-4 rounded-lg shadow overflow-hidden ${startClass} ${conflictClass}`}>
        <td className="block p-0">
          <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
            <div className="font-bold text-lg text-gray-800">
              {isOptimizedView ? `Parada #${orderNumber}` : `ID: ${reparto.id}`}
            </div>
            <div className="font-bold text-lg">
              {reparto.destino}
            </div>
          </div>
          <div className="p-1">
            <MobileCell label="Dirección">{reparto.direccion}</MobileCell>
            <MobileCell label="Horarios">
              <div>
                {reparto.horarios || '-'}
                {conflictInfo?.hasConflict && (
                  <div className="text-red-600 text-xs font-semibold" title={`Llegada estimada: ${eta}hs`}>
                    ⚠️ {conflictInfo.message}
                  </div>
                )}
              </div>
            </MobileCell>
            <MobileCell label="Bultos">{reparto.bultos}</MobileCell>
            {isOptimizedView && (
              <MobileCell label="Tramo / ETA">
                {reparto.legData ? (
                  <div>
                    <div className="font-semibold">{reparto.legData.duration} ({reparto.legData.distance})</div>
                    <div className="text-blue-600 text-xs">Llegada est: {eta}hs</div>
                  </div>
                ) : (isStartLocation ? 'Punto de partida' : '-')}
              </MobileCell>
            )}
            {isAdmin && <MobileCell label="Agregado por">{reparto.agregado_por}</MobileCell>}
            <div className="p-3 flex justify-end gap-2">
              <button disabled={isStartLocation} className="px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50" onClick={() => toast.info('La edición está disponible en la vista de escritorio.')}>✏️</button>
              <button disabled={isStartLocation} className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50" onClick={() => onDelete(reparto.id)}>🗑️</button>
              {!isStartLocation && (
                <>
                  <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">🗺️</a>
                  <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600">🚗</a>
                </>
              )}
            </div>
          </div>
        </td>
      </tr>

      {/* --- VISTA DE ESCRITORIO (TABLA) --- */}
      <tr className={`hidden sm:table-row hover:bg-gray-50 ${isStartLocation ? 'bg-green-100 font-semibold' : ''} ${conflictClass} transition-colors duration-200`}>
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
          {conflictInfo?.hasConflict && (
            <div className="text-red-600 text-xs font-semibold mt-1" title={`Llegada estimada: ${eta}hs`}>
              ⚠️ {conflictInfo.message}
            </div>
          )}
        </td>
        <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.bultos}</td>
        {isOptimizedView && (
          <td className="p-4 border-b border-gray-200 text-gray-700 text-sm">
            {reparto.legData ? (
              <div>
                <div className="font-semibold">{reparto.legData.duration} <span className="text-gray-500">({reparto.legData.distance})</span></div>
                <div className="text-blue-600 text-xs">Llegada est: {eta}hs</div>
              </div>
            ) : (isStartLocation ? 'Punto de partida' : '-')}
          </td>
        )}
        {isAdmin && <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.agregado_por}</td>}
        <td className="p-4 border-b border-gray-200 text-center">
          <div className="flex justify-center gap-1 flex-wrap">
            <button disabled={isStartLocation} className="px-2 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50" onClick={() => setIsEditing(true)}>✏️</button>
            <button disabled={isStartLocation} className="px-2 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50" onClick={() => onDelete(reparto.id)}>🗑️</button>
            {!isStartLocation && (
              <>
                <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 inline-block">🗺️</a>
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-sm font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600 inline-block">🚗</a>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

export default RepartoRow;
