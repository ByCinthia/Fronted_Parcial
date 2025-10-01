// src/pages/Reservas/suministro.tsx
import React, { useState, useEffect } from "react";
import { Suministro, Area } from "./types";
import { crearSuministro, listarSuministros, listarAreas } from "./service";

const SuministroPage: React.FC = () => {
  const [form, setForm] = useState<Suministro>({
    areacomun: 0,
    name: "",
    descripcion: "",
    cantidad_total: 0,
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [suministros, setSuministros] = useState<Suministro[]>([]);

  useEffect(() => {
    listarAreas().then(setAreas).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crearSuministro(form);
    const data = await listarSuministros(form.areacomun);
    setSuministros(data);
    setForm({ areacomun: 0, name: "", descripcion: "", cantidad_total: 0 });
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Suministro</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <select value={form.areacomun} onChange={(e) => setForm({ ...form, areacomun: +e.target.value })} required>
            <option value={0}>Seleccione Área</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <input placeholder="Nombre" value={form.name} 
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Descripción" value={form.descripcion} 
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
          <input type="number" placeholder="Cantidad total" value={form.cantidad_total} 
          onChange={(e) => setForm({ ...form, cantidad_total: +e.target.value })} 
          min = {1}
          required />
          <button className="btn">Guardar</button>
        </form>
      </div>

      <div className="module-card">
        <h2>Suministros</h2>
        <ul>
          {suministros.map((s) => (
            <li key={s.id}>{s.name} - {s.descripcion} (Total: {s.cantidad_total})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SuministroPage;
