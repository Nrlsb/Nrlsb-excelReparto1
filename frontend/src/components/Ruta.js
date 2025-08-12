// src/components/Ruta.js
import React from 'react';
import Map from './Map';
import RepartosTable from './RepartosTable';

// --- CORRECCIÓN ---
// La prop aquí debe ser "polyline" (en singular)
function Ruta({ repartos, polyline, onUpdateReparto, onDeleteReparto, isAdmin }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Visualización de la Ruta</h2>
      {/* Y se la pasamos al componente Map con el mismo nombre "polyline" */}
      <Map repartos={repartos} polyline={polyline} />
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
