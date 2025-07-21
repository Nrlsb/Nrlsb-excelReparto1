import React, { useState } from 'react';

function RepartoRow({ reparto, onUpdate, onDelete, isAdmin }) { // Recibir isAdmin
  const [isEditing, setIsEditing] = useState(false);
  const [editedReparto, setEditedReparto] = useState({ ...reparto });

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
    return (
      <tr className="bg-purple-50">
        <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.id}</td>
        <td className="p-4 border-b border-gray-200"><input type="text" name="destino" value={editedReparto.destino} onChange={handleInputChange} className={commonInputClass} /></td>
        <td className="p-4 border-b border-gray-200"><input type="text" name="direccion" value={editedReparto.direccion} onChange={handleInputChange} className={commonInputClass} /></td>
        <td className="p-4 border-b border-gray-200"><input type="text" name="horarios" value={editedReparto.horarios} onChange={handleInputChange} className={commonInputClass} /></td>
        <td className="p-4 border-b border-gray-200"><input type="number" name="bultos" value={editedReparto.bultos} onChange={handleInputChange} min="1" className={commonInputClass} /></td>
        {/* Mostrar el nombre del creador (no editable) */}
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

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="p-4 border-b border-gray-200 text-gray-700 font-medium">{reparto.id}</td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.destino}</td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.direccion}</td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.horarios}</td>
      <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.bultos}</td>
      {/* Celda condicional para admin */}
      {isAdmin && <td className="p-4 border-b border-gray-200 text-gray-700">{reparto.agregado_por}</td>}
      <td className="p-4 border-b border-gray-200 text-center">
        <div className="flex justify-center gap-2">
          <button className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600" onClick={() => setIsEditing(true)}>✏️</button>
          <button className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600" onClick={() => onDelete(reparto.id)}>🗑️</button>
        </div>
      </td>
    </tr>
  );
}

export default RepartoRow;
