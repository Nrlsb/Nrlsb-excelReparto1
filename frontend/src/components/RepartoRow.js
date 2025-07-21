import React, { useState } from 'react';

function RepartoRow({ reparto, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReparto, setEditedReparto] = useState({ ...reparto });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReparto(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Convierte bultos a número antes de guardar
    const dataToUpdate = {
        ...editedReparto,
        bultos: parseInt(editedReparto.bultos, 10)
    };
    onUpdate(reparto.id, dataToUpdate);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="editing-row">
        <td>{reparto.id}</td>
        <td><input type="text" name="destino" value={editedReparto.destino} onChange={handleInputChange} /></td>
        <td><input type="text" name="direccion" value={editedReparto.direccion} onChange={handleInputChange} /></td>
        <td><input type="text" name="horarios" value={editedReparto.horarios} onChange={handleInputChange} /></td>
        <td><input type="number" name="bultos" value={editedReparto.bultos} onChange={handleInputChange} min="1" /></td>
        <td className="actions-cell">
          <button className="btn btn-success btn-small" onClick={handleSave}>✔</button>
          <button className="btn btn-secondary btn-small" onClick={() => setIsEditing(false)}>✖</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{reparto.id}</td>
      <td>{reparto.destino}</td>
      <td>{reparto.direccion}</td>
      <td>{reparto.horarios}</td>
      <td>{reparto.bultos}</td>
      <td className="actions-cell">
        <button className="btn btn-edit btn-small" onClick={() => setIsEditing(true)}>✏️</button>
        <button className="btn btn-danger btn-small" onClick={() => onDelete(reparto.id)}>🗑️</button>
      </td>
    </tr>
  );
}

export default RepartoRow;
