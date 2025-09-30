// src/pages/Seguridad/visita.tsx
import React, { useState, useEffect } from "react";
import { Visita } from "./types";
import { registrarVisita, listarVisitas } from "./service";

const VisitaPage: React.FC = () => {
  const [form, setForm] = useState<Visita>({
    nombre: "",
    documento: "",
    unidad: 0,
    motivo: "",
    fecha: new Date().toISOString().slice(0, 16), // yyyy-mm-ddThh:mm
    autorizado: true,
  });
  const [visitas, setVisitas] = useState<Visita[]>([]);

  useEffect(() => {
    listarVisitas().then(setVisitas).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(value)
        : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarVisita(form);
      const data = await listarVisitas();
      setVisitas(data);
      setForm({
        nombre: "",
        documento: "",
        unidad: 0,
        motivo: "",
        fecha: new Date().toISOString().slice(0, 16),
        autorizado: true,
      });
    } catch {
      alert("Error al registrar visita");
    }
  };

  return (
    <div className="module-container">
      {/* Formulario */}
      <div className="module-card">
        <h2>Registrar Visita</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre completo"
            required
          />
          <input
            type="text"
            name="documento"
            value={form.documento}
            onChange={handleChange}
            placeholder="Documento"
            required
          />
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
            type="text"
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            placeholder="Motivo"
            required
          />
          <input
            type="datetime-local"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
          />
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              name="autorizado"
              checked={form.autorizado}
              onChange={handleChange}
            />
            Autorizado
          </label>
          <button type="submit" className="btn">Registrar</button>
        </form>
      </div>

      {/* Listado */}
      <div className="module-card">
        <h2>Visitas Registradas</h2>
        {visitas.length === 0 ? (
          <p>No hay visitas registradas.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Unidad</th>
                <th>Motivo</th>
                <th>Fecha</th>
                <th>Autorizado</th>
              </tr>
            </thead>
            <tbody>
              {visitas.map((v, i) => (
                <tr key={i}>
                  <td>{v.nombre}</td>
                  <td>{v.documento}</td>
                  <td>{v.unidad}</td>
                  <td>{v.motivo}</td>
                  <td>{v.fecha}</td>
                  <td>{v.autorizado ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VisitaPage;
