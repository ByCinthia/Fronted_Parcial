// src/pages/Mantenimiento/servicio.tsx
import React, { useState, useEffect } from "react";
import { Servicio } from "./types";
import { crearServicio, listarServicios } from "./service";

const ServicioPage: React.FC = () => {
  const [form, setForm] = useState<Servicio>({ name: "", descripcion: "", is_active: true });
  const [servicios, setServicios] = useState<Servicio[]>([]);

  useEffect(() => {
    listarServicios().then(setServicios).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crearServicio(form);
    const data = await listarServicios();
    setServicios(data);
    setForm({ name: "", descripcion: "", is_active: true });
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Servicio</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
          <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
          <label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Activo
          </label>
          <button className="btn">Guardar</button>
        </form>
      </div>

      <div className="module-card">
        <h2>Servicios Registrados</h2>
        <ul>
          {servicios.map((s) => (
            <li key={s.id}>{s.name} - {s.descripcion} ({s.is_active ? "Activo" : "Inactivo"})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServicioPage;
