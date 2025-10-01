// src/pages/Reservas/area.tsx
import React, { useState, useEffect } from "react";
import { Area } from "./types";
import { crearArea, listarAreas } from "./service";

const AreaPage: React.FC = () => {
  const [form, setForm] = useState<Area>({
    name: "",
    descripcion: "",
    deposit_amount: "",
    is_active: true,
  });
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    listarAreas().then(setAreas).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crearArea(form);
    const data = await listarAreas();
    setAreas(data);
    setForm({ name: "", descripcion: "", deposit_amount: "", is_active: true });
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Área Común</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
          <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
          <input name="deposit_amount" placeholder="Depósito" value={form.deposit_amount} onChange={handleChange} required />
          <label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Activa
          </label>
          <button className="btn">Guardar</button>
        </form>
      </div>

      <div className="module-card">
        <h2>Áreas Comunes</h2>
        <ul>
          {areas.map((a) => (
            <li key={a.id}>{a.name} - {a.descripcion} ({a.is_active ? "Activa" : "Inactiva"})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AreaPage;
