// src/components/Ruta.js
import React from 'react';
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('./Map'), { ssr: false });
import RepartosTable from './RepartosTable';

// --- NUEVO: Recibir y mostrar la duración total ---
function Ruta({ repartos, polyline, totalDuration, onUpdateReparto, onDeleteReparto, isAdmin }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-700">Visualización de la Ruta</h2>
        {totalDuration && (
          <div className="bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-2 rounded-lg shadow-sm">
            🕒 Tiempo Estimado: <span className="font-bold">{totalDuration}</span>
          </div>
        )}
      </div>
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
