import React from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import RepartoRow from './RepartoRow';

function RepartosTable({ repartos, loading, onClearRepartos, onUpdateReparto, onDeleteReparto, isAdmin }) {

  const handleExportExcel = () => {
    if (repartos.length === 0) {
      toast.info('No hay repartos para exportar.');
      return;
    }
    // Añadir 'Agregado por' a la exportación si es admin
    const datosParaExportar = repartos.map(r => {
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

  // Ajustar el número de columnas para los mensajes de carga y vacío
  const colSpan = isAdmin ? 7 : 6;

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
              <th className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">ID</th>
              <th className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Destino</th>
              <th className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Dirección</th>
              <th className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Horarios</th>
              <th className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Bultos</th>
              {/* Columna condicional para admin */}
              {isAdmin && <th className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Agregado por</th>}
              <th className="p-4 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider">Acciones</th> 
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colSpan} className="text-center p-10 text-gray-500">Cargando...</td></tr>
            ) : repartos.length > 0 ? (
              repartos.map(reparto => (
                <RepartoRow 
                  key={reparto.id} 
                  reparto={reparto} 
                  onUpdate={onUpdateReparto}
                  onDelete={onDeleteReparto}
                  isAdmin={isAdmin} // Pasar prop a la fila
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
