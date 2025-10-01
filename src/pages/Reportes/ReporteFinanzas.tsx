// src/pages/Reportes/ReporteFinanzas.tsx
import React, { useState, useEffect } from "react";
import { generarReporteFinanzas, listarUnidades } from "./service";
import { ReporteFinanzas } from "./types";
import { Unidad } from "../Vivienda/types";

const ReporteFinanzasPage: React.FC = () => {
  const [unidad, setUnidad] = useState<number>(0);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [reporte, setReporte] = useState<ReporteFinanzas | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listarUnidades()
      .then(setUnidades)
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.error(error.message);
        }
      });
  }, []);

  const handleGenerar = async () => {
    if (!unidad) return;
    setLoading(true);
    try {
      const data = await generarReporteFinanzas(unidad);
      setReporte(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        alert("Error al generar el reporte de finanzas: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <h2>Reporte de Finanzas</h2>

      <div className="module-form">
        <select
          value={unidad}
          onChange={(e) => setUnidad(Number(e.target.value))}
          required
        >
          <option value={0}>Seleccione una unidad</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              Unidad {u.code} - {u.direccion ?? u.direccion}
            </option>
          ))}
        </select>

        <button className="btn" onClick={handleGenerar} disabled={loading}>
          {loading ? "Generando..." : "Generar"}
        </button>
      </div>

      {reporte && (
        <table className="table" style={{ marginTop: "1rem" }}>
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
