// src/pages/Vivienda/Condominio.tsx
import React, { useEffect, useState } from "react";
import { Condominio, CreateCondominioPayload } from "./types";
import { fetchCondominios, createCondominio } from "./service";
import "../../styles/dashboard.css";

const CondominioPage: React.FC = () => {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [form, setForm] = useState<CreateCondominioPayload>({
    direccion: "",
    name: "",
    tipo: "vertical",
  });
  const [mensaje, setMensaje] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    fetchCondominios()
      .then(setCondominios)
      .catch(() => setMensaje({ type: "error", text: "Error cargando condominios" }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nuevo = await createCondominio(form);
      setCondominios((prev) => [nuevo, ...prev]);
      setForm({ direccion: "", name: "", tipo: "vertical" });
      setMensaje({ type: "success", text: "Condominio creado correctamente" });
    } catch {
      setMensaje({ type: "error", text: "Error al crear condominio" });
    }
  };

  return (
    <div className="module-container">
      {/* Crear Condominio */}
      <div className="module-card">
        <h2>Crear Condominio</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Dirección *</label>
            <input
              className="form-input"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo *</label>
            <select
              className="form-input"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
            >
              <option value="vertical">Vertical (departamentos)</option>
              <option value="horizontal">Horizontal (casas)</option>
            </select>
          </div>
          <button className="btn" type="submit">Crear</button>
        </form>
      </div>

      {/* Listado de Condominios */}
      <div className="module-card">
        <h2>Condominios</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {condominios.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.direccion}</td>
                <td>{c.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mensaje && (
        <div style={{ color: mensaje.type === "error" ? "red" : "green", marginTop: 8 }}>
          {mensaje.text}
        </div>
      )}
    </div>
  );
};

export default CondominioPage;
