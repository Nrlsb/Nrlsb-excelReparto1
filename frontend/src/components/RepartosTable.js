// src/components/RepartosTable.js
import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import RepartoRow from './RepartoRow';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Parsea una duración en texto (ej. "15 mins") a segundos
const parseDurationToSeconds = (durationText) => {
  if (!durationText) return 0;
  let seconds = 0;
  const hourMatches = durationText.match(/(\d+)\s*h/);
  const minMatches = durationText.match(/(\d+)\s*min/);
  if (hourMatches) seconds += parseInt(hourMatches[1], 10) * 3600;
  if (minMatches) seconds += parseInt(minMatches[1], 10) * 60;
  return seconds;
};

// Parsea el texto del horario a objetos dayjs
const parseHorarios = (horarios) => {
  if (!horarios) return null;
  // Soporta "9-18", "9:30-18:00", "14 a 18"
  const matches = horarios.match(/(\d{1,2}(?::\d{2})?)\s*(?:-|a)\s*(\d{1,2}(?::\d{2})?)/);
  if (!matches) return null;

  const [, start, end] = matches;
  const startTime = dayjs(start, 'H:mm');
  const endTime = dayjs(end, 'H:mm');

  if (!startTime.isValid() || !endTime.isValid()) return null;
  return { startTime, endTime };
};


function RepartosTable({ repartos, loading, onUpdateReparto, onDeleteReparto, isAdmin, isOptimizedView = false }) {
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const routeAnalysis = useMemo(() => {
    if (!isOptimizedView || !repartos || repartos.length === 0) {
      return { etas: {}, conflicts: {} };
    }

    const etas = {};
    const conflicts = {};
    let cumulativeTime = dayjs(); // La ruta comienza "ahora"

    repartos.forEach((reparto, index) => {
      if (index === 0) { // Punto de partida
        etas[reparto.id] = cumulativeTime.format('HH:mm');
        return;
      }

      const prevReparto = repartos[index - 1];
      const legDurationSeconds = parseDurationToSeconds(prevReparto.legData?.duration);
      
      const stopDurationSeconds = 10 * 60; 
      cumulativeTime = cumulativeTime.add(legDurationSeconds + stopDurationSeconds, 'second');
      
      etas[reparto.id] = cumulativeTime.format('HH:mm');

      const timeWindow = parseHorarios(reparto.horarios);
      if (timeWindow) {
        const { startTime, endTime } = timeWindow;
        if (cumulativeTime.isBefore(startTime)) {
          conflicts[reparto.id] = { hasConflict: true, message: `Llegada temprana (antes de las ${startTime.format('HH:mm')})` };
          cumulativeTime = startTime;
        } else if (cumulativeTime.isAfter(endTime)) {
          conflicts[reparto.id] = { hasConflict: true, message: `Llegada tardía (después de las ${endTime.format('HH:mm')})` };
        }
      }
    });

    return { etas, conflicts };
  }, [repartos, isOptimizedView]);


  const sortedRepartos = useMemo(() => {
    const repartosArray = Array.isArray(repartos) ? repartos : [];
    if (isOptimizedView) return repartosArray;

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

  const colSpan = isAdmin 
    ? (isOptimizedView ? 8 : 7) 
    : (isOptimizedView ? 7 : 6);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        {/* --- MODIFICADO: Ocultamos la cabecera en móviles --- */}
        <thead className="hidden sm:table-header-group">
          <tr>
            <SortableHeader columnKey="id">{isOptimizedView ? 'Orden' : 'ID'}</SortableHeader>
            <SortableHeader columnKey="destino">Destino</SortableHeader>
            <SortableHeader columnKey="direccion">Dirección</SortableHeader>
            <SortableHeader columnKey="horarios">Horarios</SortableHeader>
            <SortableHeader columnKey="bultos">Bultos</SortableHeader>
            {isOptimizedView && <th className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Tramo / ETA</th>}
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
                eta={routeAnalysis.etas[reparto.id]}
                conflictInfo={routeAnalysis.conflicts[reparto.id]}
                isOptimizedView={isOptimizedView}
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
