// src/pages/Seguridad/incidentes.tsx
import React, { useState, useEffect } from "react";
import { Incidente } from "./types";
import { registrarIncidente, listarIncidentes } from "./service";

const IncidentesPage: React.FC = () => {
  const [form, setForm] = useState({
    unidad: 0,
    user: 0,
    titulo: "",
    descripcion: "",
    estado: "abierto",
    evidencia: null as File | null,
    monto_multa: "",
  });
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);

  useEffect(() => {
    listarIncidentes().then(setIncidentes).catch(() => {});
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val =
      type === "number" ? Number(value) :
      type === "file" ? (e.target as HTMLInputElement).files?.[0] ?? null :
      value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("unidad", String(form.unidad));
      fd.append("user", String(form.user));
      fd.append("titulo", form.titulo);
      fd.append("descripcion", form.descripcion);
      fd.append("estado", form.estado);
      if (form.evidencia) fd.append("evidencia", form.evidencia);
      if (form.monto_multa) fd.append("monto_multa", form.monto_multa);

      await registrarIncidente(fd);
      const data = await listarIncidentes();
      setIncidentes(data);

      setForm({
        unidad: 0,
        user: 0,
        titulo: "",
        descripcion: "",
        estado: "abierto",
        evidencia: null,
        monto_multa: "",
      });
    } catch {
      alert("Error al registrar incidente");
    }
  };

  return (
    <div className="module-container">
      {/* Formulario */}
      <div className="module-card">
        <h2>Registrar Incidente</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input
            type="number"
            name="unidad"
            value={form.unidad}
            onChange={handleChange}
            placeholder="Unidad"
            min={1}
            required
          />
          <input
            type="number"
            name="user"
            value={form.user}
            onChange={handleChange}
            placeholder="Usuario"
            min={1}
            required
          />
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Título"
            required
          />
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            required
          />
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="abierto">Abierto</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <input
            type="file"
            name="evidencia"
            accept="image/*"
            onChange={handleChange}
          />
          <input
            type="number"
            name="monto_multa"
            value={form.monto_multa}
            onChange={handleChange}
            placeholder="Monto multa"
            min={0}
          />
          <button type="submit" className="btn">Registrar</button>
        </form>
      </div>

      {/* Listado */}
      <div className="module-card">
        <h2>Incidentes Registrados</h2>
        {incidentes.length === 0 ? (
          <p>No hay incidentes registrados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Usuario</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Multa</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {incidentes.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.unidad}</td>
                  <td>{i.user}</td>
                  <td>{i.titulo}</td>
                  <td>{i.estado}</td>
                  <td>{i.monto_multa ?? "-"}</td>
                  <td>
                    {i.evidencia ? (
                      <a href={i.evidencia} target="_blank" rel="noreferrer">Ver</a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IncidentesPage;
