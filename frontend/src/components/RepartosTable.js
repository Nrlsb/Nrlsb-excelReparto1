import React, { useState } from 'react';
import RepartoRow from './RepartoRow';
import ConfirmModal from './ConfirmModal';
import RepartoMap from './RepartoMap'; // 1. Importar el componente del mapa

const RepartosTable = ({ repartos, onEdit, onDelete, onUpdate }) => {
  const [deletingId, setDeletingId] = useState(null);
  // 2. Estado para controlar la visibilidad del mapa
  const [showMap, setShowMap] = useState(false);

  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="overflow-x-auto">
      {/* 3. Botón para abrir el mapa */}
      <div className="my-4">
        <button
          onClick={() => setShowMap(true)}
          disabled={repartos.length < 2}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Optimizar y Ver Ruta en Mapa
        </button>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Cliente</th>
            <th className="py-2 px-4 border-b">Dirección</th>
            <th className="py-2 px-4 border-b">Teléfono</th>
            <th className="py-2 px-4 border-b">Paquete</th>
            <th className="py-2 px-4 border-b">Estado</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {repartos.map((reparto) => (
            <RepartoRow
              key={reparto.id}
              reparto={reparto}
              onEdit={onEdit}
              onDelete={handleDeleteClick}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>

      {deletingId && (
        <ConfirmModal
          message="¿Estás seguro de que deseas eliminar este reparto?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* 4. Modal para mostrar el mapa */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
            <RepartoMap repartos={repartos} onClose={() => setShowMap(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RepartosTable;
