import React, { useState } from "react";
import { Evidencia, EvidenciaPlaca } from "./types";
import { listarEvidenciasPorIncidente, crearEvidenciaPlaca } from "./service";

const EvidenciasPage: React.FC = () => {
  const [incidenteId, setIncidenteId] = useState<number>(0);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);

  const [formPlaca, setFormPlaca] = useState({
    acceso: 0,
    modo: "automático",
    archivo: null as File | null,
  });
  const [evidenciasPlaca, setEvidenciasPlaca] = useState<EvidenciaPlaca[]>([]);

  // Buscar evidencias por incidente
  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenteId) return;
    try {
      const data = await listarEvidenciasPorIncidente(incidenteId);
      setEvidencias(data);
    } catch {
      alert("No se pudieron obtener las evidencias");
    }
  };

  // Crear evidencia placa
  const handleChangePlaca = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "file" ? (e.target as HTMLInputElement).files?.[0] ?? null : value;
    setFormPlaca((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmitPlaca = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("acceso", String(formPlaca.acceso));
      fd.append("modo", formPlaca.modo);
      if (formPlaca.archivo) fd.append("evidencia", formPlaca.archivo);

      const nueva = await crearEvidenciaPlaca(fd);
      setEvidenciasPlaca((prev) => [...prev, nueva]);
    } catch {
      alert("Error al registrar evidencia de placa");
    }
  };

  return (
    <div className="module-container">
      {/* Buscar evidencias por incidente */}
      <div className="module-card">
        <h2>Acceso a Evidencias de Incidente</h2>
        <form className="module-form" onSubmit={handleBuscar}>
          <input
            type="number"
            placeholder="ID Incidente"
            value={incidenteId}
            onChange={(e) => setIncidenteId(Number(e.target.value))}
            min={1}
            required
          />
          <button type="submit" className="btn">Buscar</button>
        </form>
        {evidencias.length > 0 && (
          <table className="table mt-8">
            <thead>
              <tr>
                <th>Incidente</th>
                <th>Tipo</th>
                <th>Archivo</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {evidencias.map((ev, i) => (
                <tr key={i}>
                  <td>{ev.incidente}</td>
                  <td>{ev.tipo}</td>
                  <td><a href={ev.url} target="_blank" rel="noreferrer">Ver</a></td>
                  <td>{ev.fecha ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Crear evidencia de placa */}
      <div className="module-card">
        <h2>Registrar Evidencia de Placa</h2>
        <form className="module-form" onSubmit={handleSubmitPlaca}>
          <input
            type="number"
            name="acceso"
            value={formPlaca.acceso}
            onChange={handleChangePlaca}
            placeholder="ID Acceso"
            min={1}
            required
          />
          <select name="modo" value={formPlaca.modo} onChange={handleChangePlaca}>
            <option value="automático">Automático</option>
            <option value="manual">Manual</option>
          </select>
          <input type="file" name="archivo" accept="image/*" onChange={handleChangePlaca} required />
          <button type="submit" className="btn">Registrar</button>
        </form>

        {evidenciasPlaca.length > 0 && (
          <table className="table mt-8">
            <thead>
              <tr>
                <th>Acceso</th>
                <th>Modo</th>
                <th>Archivo</th>
                <th>Placa Detectada</th>
              </tr>
            </thead>
            <tbody>
              {evidenciasPlaca.map((ev, i) => (
                <tr key={i}>
                  <td>{ev.acceso}</td>
                  <td>{ev.modo}</td>
                  <td><a href={ev.url} target="_blank" rel="noreferrer">Ver</a></td>
                  <td>{ev.placa_detectada ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EvidenciasPage;
