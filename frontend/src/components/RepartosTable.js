// src/components/RepartosTable.js --- ARCHIVO MODIFICADO
import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import RepartoRow from './RepartoRow';

function RepartosTable({ repartos, loading, onUpdateReparto, onDeleteReparto, isAdmin, isOptimizedView = false }) {
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedRepartos = useMemo(() => {
    const repartosArray = Array.isArray(repartos) ? repartos : [];
    
    // Si es la vista optimizada, no aplicamos ordenamiento manual.
    if (isOptimizedView) {
        return repartosArray;
    }

    const sorted = [...repartosArray];
    if (sortKey) {
      sorted.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [repartos, sortKey, sortOrder, isOptimizedView]);

  const handleSort = (key) => {
    if (isOptimizedView) {
        toast.info('El orden de la ruta ya está optimizado.');
        return;
    }
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortableHeader = ({ columnKey, children }) => {
    const isSorted = sortKey === columnKey;
    const arrow = isSorted && !isOptimizedView ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '';
    return (
      <th 
        className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider cursor-pointer hover:bg-gradient-to-l"
        onClick={() => handleSort(columnKey)}
      >
        {children}{arrow}
      </th>
    );
  };

  const colSpan = isAdmin ? 7 : 6;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <SortableHeader columnKey="id">{isOptimizedView ? 'Orden' : 'ID'}</SortableHeader>
            <SortableHeader columnKey="destino">Destino</SortableHeader>
            <SortableHeader columnKey="direccion">Dirección</SortableHeader>
            <SortableHeader columnKey="horarios">Horarios</SortableHeader>
            <SortableHeader columnKey="bultos">Bultos</SortableHeader>
            {isAdmin && <SortableHeader columnKey="agregado_por">Agregado por</SortableHeader>}
            <th className="p-4 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Acciones</th> 
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={colSpan} className="text-center p-10 text-gray-500">Cargando...</td></tr>
          ) : sortedRepartos.length > 0 ? (
            sortedRepartos.map((reparto, index) => (
              <RepartoRow 
                key={reparto.id || `start-${index}`} 
                reparto={reparto} 
                onUpdate={onUpdateReparto}
                onDelete={onDeleteReparto}
                isAdmin={isAdmin}
                orderNumber={isOptimizedView ? index + 1 : null}
              />
            ))
          ) : (
            <tr><td colSpan={colSpan} className="text-center p-10 text-gray-500">No hay repartos cargados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RepartosTable;
