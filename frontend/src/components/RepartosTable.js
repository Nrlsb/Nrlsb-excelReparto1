import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import RepartoRow from './RepartoRow';

function RepartosTable({ repartos, loading, onClearRepartos, onUpdateReparto, onDeleteReparto, isAdmin }) {
  // --- NUEVO: Estados para el ordenamiento ---
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // --- NUEVO: Lógica para ordenar los repartos ---
  const sortedRepartos = useMemo(() => {
    const sorted = [...repartos];
    if (sortKey) {
      sorted.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA < valB) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [repartos, sortKey, sortOrder]);

  // --- NUEVO: Función para manejar el clic en las cabeceras ---
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // --- NUEVO: Componente para las cabeceras de la tabla ---
  const SortableHeader = ({ columnKey, children }) => {
    const isSorted = sortKey === columnKey;
    const arrow = isSorted ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '';
    return (
      <th 
        className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider cursor-pointer hover:bg-gradient-to-l"
        onClick={() => handleSort(columnKey)}
      >
        {children}{arrow}
      </th>
    );
  };

  const handleExportExcel = () => {
    if (sortedRepartos.length === 0) {
      toast.info('No hay repartos para exportar.');
      return;
    }
    const datosParaExportar = sortedRepartos.map(r => {
      const baseData = {
        'ID': r.id,
        'Destino': r.destino,
        'Dirección': r.direccion,
        'Horarios': r.horarios,
        'Bultos': r.bultos,
        'Fecha de Creación': new Date(r.created_at).toLocaleString()
      };
      if (isAdmin) {
        baseData['Agregado por'] = r.agregado_por;
      }
      return baseData;
    });

    const ws = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Repartos");
    XLSX.writeFile(wb, "repartos.xlsx");
  };

  const colSpan = isAdmin ? 8 : 7;

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 mb-5">
        <button 
          className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105" 
          onClick={handleExportExcel}>
            📊 Exportar a Excel
        </button>
        <button 
          className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105" 
          onClick={onClearRepartos}>
            🗑️ Vaciar Todo
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <SortableHeader columnKey="id">ID</SortableHeader>
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
              sortedRepartos.map(reparto => (
                <RepartoRow 
                  key={reparto.id} 
                  reparto={reparto} 
                  onUpdate={onUpdateReparto}
                  onDelete={onDeleteReparto}
                  isAdmin={isAdmin}
                />
              ))
            ) : (
              <tr><td colSpan={colSpan} className="text-center p-10 text-gray-500">No hay repartos cargados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepartosTable;
