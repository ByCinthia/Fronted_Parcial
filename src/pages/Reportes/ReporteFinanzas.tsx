// src/pages/Reportes/ReporteFinanzas.tsx
import React, { useState } from "react";
import { generarReporteFinanzas } from "./service";
import { ReporteFinanzas } from "./types";

const ReporteFinanzasPage: React.FC = () => {
  const [unidad, setUnidad] = useState<number>(0);
  const [reporte, setReporte] = useState<ReporteFinanzas | null>(null);

  const handleGenerar = async () => {
    const data = await generarReporteFinanzas(unidad);
    setReporte(data);
  };

  return (
    <div className="module-container">
      <h2>Reporte de Finanzas</h2>
      <input
        type="number"
        value={unidad}
        onChange={(e) => setUnidad(Number(e.target.value))}
        placeholder="Unidad ID"
      />
      <button className="btn" onClick={handleGenerar}>Generar</button>

      {reporte && (
        <table className="table" style={{ marginTop: 16 }}>
          <tbody>
            <tr><td>Total Pagos</td><td>{reporte.totalPagos}</td></tr>
            <tr><td>Pagos Confirmados</td><td>{reporte.totalConfirmados}</td></tr>
            <tr><td>Pagos Pendientes</td><td>{reporte.totalPendientes}</td></tr>
            <tr><td>Total Cargos</td><td>{reporte.totalCargos}</td></tr>
            <tr><td>Cargos Pagados</td><td>{reporte.cargosPagados}</td></tr>
            <tr><td>Cargos Pendientes</td><td>{reporte.cargosPendientes}</td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReporteFinanzasPage;
