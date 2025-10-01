import React, { useState } from "react";
import { generarReporteUsuarios } from "./service";
import { ReporteUsuarios } from "./types";

const ReporteUsuariosPage: React.FC = () => {
  const [reporte, setReporte] = useState<ReporteUsuarios | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerar = async () => {
    setLoading(true);
    try {
      const data = await generarReporteUsuarios();
      setReporte(data);
    } catch (err) {
      console.error(err);
      alert("Error al generar el reporte de usuarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <h2>Reporte de Usuarios</h2>
      <button className="btn" onClick={handleGenerar} disabled={loading}>
        {loading ? "Generando..." : "Generar"}
      </button>

      {reporte && (
        <table className="table" style={{ marginTop: 16 }}>
          <tbody>
            <tr><td>Total Usuarios</td><td>{reporte.totalUsuarios}</td></tr>
            <tr><td>Usuarios Activos</td><td>{reporte.activos}</td></tr>
            <tr><td>Usuarios Inactivos</td><td>{reporte.inactivos}</td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReporteUsuariosPage;
