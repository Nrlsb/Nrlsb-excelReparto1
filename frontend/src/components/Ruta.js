// src/components/Ruta.js
import React from 'react';
import Map from './Map';
import RepartosTable from './RepartosTable';

function Ruta({ repartos, polylines, onUpdateReparto, onDeleteReparto, isAdmin }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Visualización de la Ruta</h2>
      <Map repartos={repartos} polylines={polylines} />
      <RepartosTable
        repartos={repartos}
        loading={false}
        onUpdateReparto={onUpdateReparto}
        onDeleteReparto={onDeleteReparto}
        isAdmin={isAdmin}
        isOptimizedView={true}
      />
    </div>
  );
}

export default Ruta;
