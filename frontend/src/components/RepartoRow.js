// src/components/RepartoRow.js
import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// --- NUEVO: Función para analizar horarios y verificar conflictos ---
const checkTimeConflict = (reparto, orderNumber) => {
  if (!reparto.horarios || !reparto.legData || orderNumber <= 1) {
    return { hasConflict: false, message: '' };
  }

  // Intenta parsear rangos como "9-18", "9:30-18:00", "14 a 18"
  const matches = reparto.horarios.match(/(\d{1,2}(?::\d{2})?)\s*(?:-|a)\s*(\d{1,2}(?::\d{2})?)/);
  if (!matches) return { hasConflict: false, message: '' };

  const [, start, end] = matches;
  
  // Usamos dayjs para manejar los tiempos
  const startTime = dayjs(start, 'H:mm');
  const endTime = dayjs(end, 'H:mm');

  if (!startTime.isValid() || !endTime.isValid()) {
    return { hasConflict: false, message: '' };
  }

  // Simulación simple del tiempo de llegada
  // Asumimos que la ruta empieza ahora y sumamos la duración de los tramos anteriores.
  // Esto es una aproximación y podría mejorarse.
  const arrivalTime = dayjs(); // Simula que la ruta empieza ahora
  
  // Aquí necesitaríamos los datos de tramos anteriores, lo cual es complejo.
  // Por ahora, vamos a hacer una comprobación más simple:
  // Si el horario es solo por la mañana o por la tarde.
  const now = dayjs();
  const isMorningWindow = endTime.hour() <= 13;
  const isAfternoonWindow = startTime.hour() >= 13;
  
  const isMorningNow = now.hour() < 13;
  const isAfternoonNow = now.hour() >= 13;

  if (isMorningWindow && isAfternoonNow) {
    return { hasConflict: true, message: 'Posiblemente tarde (ventana de mañana).' };
  }
  
  if (isAfternoonWindow && isMorningNow) {
     return { hasConflict: true, message: 'Posiblemente temprano (ventana de tarde).' };
  }

  return { hasConflict: false, message: '' };
};


function RepartoRow({ reparto, onUpdate, onDelete, isAdmin, orderNumber }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReparto, setEditedReparto] = useState({ ...reparto });

  const isStartLocation = reparto.id === 'start_location';
  
  // --- NUEVO: Memoizamos la comprobación de conflicto ---
  const timeConflict = useMemo(() => checkTimeConflict(reparto, orderNumber), [reparto, orderNumber]);

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
    // ... (el modo edición no necesita cambios)
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

  // --- MODIFICADO: Se añade clase condicional para resaltar conflictos ---
  const rowClass = timeConflict.hasConflict 
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
        {/* --- NUEVO: Mensaje de conflicto --- */}
        {timeConflict.hasConflict && (
          <div className="text-red-600 text-xs font-semibold mt-1">
            ⚠️ {timeConflict.message}
          </div>
        )}
      </td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.bultos}</td>
      {orderNumber && (
        <td className="p-4 border-b border-gray-200 text-gray-700 text-sm">
          {reparto.legData ? (
            <div>
              <span className="font-semibold">{reparto.legData.duration}</span>
              <span className="text-gray-500"> ({reparto.legData.distance})</span>
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
