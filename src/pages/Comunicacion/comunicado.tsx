// src/pages/Comunicacion/comunicado.tsx

//Comunicados: crear, listar, ver lecturas, filtrar.
import React, { useState, useEffect } from "react";
import { Comunicado } from "./types";
import { crearComunicado, listarComunicados, verLecturas } from "./service";

const ComunicadoPage: React.FC = () => {
  const [form, setForm] = useState<Comunicado>({
    titulo: "",
    cuerpo: "",
    publicado_at: new Date().toISOString().slice(0, 16),
  });
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [lecturas, setLecturas] = useState<{ user: number; nombre: string; fecha: string }[]>([]);

  useEffect(() => {
    listarComunicados().then(setComunicados).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearComunicado(form);
      const data = await listarComunicados();
      setComunicados(data);
      setForm({ titulo: "", cuerpo: "", publicado_at: new Date().toISOString().slice(0, 16) });
    } catch {
      alert("Error al crear comunicado");
    }
  };

  const handleLecturas = async (id: number) => {
    try {
      const data = await verLecturas(id);
      setLecturas(data);
    } catch {
      alert("Error al cargar lecturas");
    }
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Comunicado</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="titulo"
            placeholder="Título"
            value={form.titulo}
            onChange={handleChange}
            required
          />
          <textarea
            name="cuerpo"
            placeholder="Cuerpo"
            value={form.cuerpo}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="publicado_at"
            value={form.publicado_at}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn">Publicar</button>
        </form>
      </div>

      <div className="module-card">
        <h2>Comunicados</h2>
        {comunicados.length === 0 ? (
          <p>No hay comunicados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Fecha</th>
                <th>Creado por</th>
                <th>Leídos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {comunicados.map((c) => (
                <tr key={c.id}>
                  <td>{c.titulo}</td>
                  <td>{c.publicado_at}</td>
                  <td>{c.creado_por ?? "-"}</td>
                  <td>{c.leidos ?? 0} / {c.total ?? "-"}</td>
                  <td>
                    <button onClick={() => handleLecturas(c.id!)} className="btn ghost">Ver lecturas</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {lecturas.length > 0 && (
        <div className="module-card">
          <h3>Usuarios que leyeron</h3>
          <ul>
            {lecturas.map((l, i) => (
              <li key={i}>{l.nombre} ({l.user}) - {l.fecha}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComunicadoPage;
