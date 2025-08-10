import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import RepartoRow from './RepartoRow';
import api from '../services/api';

function RepartosTable({ repartos, loading, onClearRepartos, onUpdateReparto, onDeleteReparto, isAdmin, session, onRouteOptimized, onToggleMap, showMap }) {
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const sortedRepartos = useMemo(() => {
    const repartosArray = Array.isArray(repartos) ? repartos : [];
    if (showMap) {
        return repartosArray;
    }
    const sorted = [...repartosArray];
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
  }, [repartos, sortKey, sortOrder, showMap]);

  const handleSort = (key) => {
    if (showMap) {
        toast.info('Desactiva la vista de mapa para ordenar la tabla manualmente.');
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
    const arrow = isSorted && !showMap ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '';
    return (
      <th 
        className="p-4 text-left bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-sm font-bold tracking-wider cursor-pointer hover:bg-gradient-to-l"
        onClick={() => handleSort(columnKey)}
      >
        {children}{arrow}
      </th>
    );
  };

  const handleSimpleExportExcel = () => {
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

  const handleTemplateExport = async () => {
    if (!session) {
        toast.error("Debes iniciar sesión para exportar.");
        return;
    }
    try {
        const response = await api.get('/repartos/export', {
            responseType: 'blob', 
        });

        const disposition = response.headers['content-disposition'];
        let filename = 'repartos.xlsx';
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Exportación con plantilla exitosa.');

    } catch (error) {
        console.error("Error al exportar a Excel con plantilla:", error);
        toast.error(`No se pudo exportar el archivo: ${error.message}`);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no es soportada por tu navegador.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            reject(new Error('No se pudo obtener la ubicación. Asegúrate de dar permiso.'));
          }
        );
      }
    });
  };

  const handleOptimizeRoute = async () => {
    if (repartos.length < 1) {
      toast.info('Necesitas al menos 1 reparto para optimizar la ruta.');
      return;
    }
    setIsOptimizing(true);
    try {
      toast.info('Obteniendo tu ubicación actual...');
      const currentLocation = await getCurrentLocation();
      
      toast.info('Optimizando la ruta desde tu ubicación...');
      const { data } = await api.post('/repartos/optimize', { repartos, currentLocation });
      onRouteOptimized(data);
      toast.success('Ruta optimizada con éxito.');
      setSortKey(null);
    } catch (error) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'No se pudo optimizar la ruta.';
      toast.error(errorMessage, { autoClose: 5000 });
      console.error('Error optimizing route:', error);
    } finally {
      setIsOptimizing(false);
    }
  };


  const colSpan = isAdmin ? 7 : 6;

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap gap-4 mb-5">
        <button 
          className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 disabled:opacity-60"
          onClick={handleOptimizeRoute}
          disabled={isOptimizing || loading}
        >
          {isOptimizing ? 'Optimizando...' : '🗺️ Optimizar Ruta'}
        </button>
        <button 
          className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105"
          onClick={onToggleMap}
        >
          {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
        </button>
        <button 
          className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105" 
          onClick={handleSimpleExportExcel}>
            📊 Exportar a Excel
        </button>
        <button 
          className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:scale-105" 
          onClick={handleTemplateExport}>
            📋 Exportar con Plantilla
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
              sortedRepartos.map((reparto, index) => (
                <RepartoRow 
                  key={reparto.id} 
                  reparto={reparto} 
                  onUpdate={onUpdateReparto}
                  onDelete={onDeleteReparto}
                  isAdmin={isAdmin}
                  orderNumber={showMap ? index + 1 : null}
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
