// src/components/Ruta.js --- NUEVO ARCHIVO
import React from 'react';
import Map from './Map';
import RepartosTable from './RepartosTable';

function Ruta({ repartos, polyline, onUpdateReparto, onDeleteReparto, isAdmin }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Visualización de la Ruta</h2>
      <Map repartos={repartos} polyline={polyline} />
      <RepartosTable
        repartos={repartos}
        loading={false}
        onUpdateReparto={onUpdateReparto}
        onDeleteReparto={onDeleteReparto}
        isAdmin={isAdmin}
        isOptimizedView={true} // Prop para indicar que es la vista de ruta
      />
    </div>
  );
}

export default Ruta;
