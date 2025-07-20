import React from 'react';
import * as XLSX from 'xlsx';

function RepartosTable({ repartos, loading, onClearRepartos }) {

  const handleExportExcel = () => {
    if (repartos.length === 0) {
      alert('No hay repartos para exportar.');
      return;
    }
    const datosParaExportar = repartos.map(r => ({
      'ID': r.id,
      'Destino': r.destino,
      'Dirección': r.direccion,
      'Horarios': r.horarios,
      'Bultos': r.bultos,
      'Fecha de Creación': new Date(r.created_at).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Repartos");
    XLSX.writeFile(wb, "repartos.xlsx");
  };

  return (
    <div className="table-container">
      <div className="table-actions">
        <button className="btn btn-success" onClick={handleExportExcel}>📊 Exportar a Excel</button>
        <button className="btn btn-danger" onClick={onClearRepartos}>🗑️ Vaciar Todo</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Destino</th>
            <th>Dirección</th>
            <th>Horarios</th>
            <th>Bultos</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="loading-state">Cargando...</td></tr>
          ) : repartos.length > 0 ? (
            repartos.map(reparto => (
              <tr key={reparto.id}>
                <td>{reparto.id}</td>
                <td>{reparto.destino}</td>
                <td>{reparto.direccion}</td>
                <td>{reparto.horarios}</td>
                <td>{reparto.bultos}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" className="empty-state">No hay repartos cargados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RepartosTable;
