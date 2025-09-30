// src/pages/Comunicacion/notificacion.tsx

//Notificaciones: mandar avisos directos guardia → residente.
import React, { useState } from "react";
import { Notificacion } from "./types";
import { crearNotificacion } from "./service";

const NotificacionPage: React.FC = () => {
  const [form, setForm] = useState<Notificacion>({
    user: 0,
    tipo: "evento",
    comunicado: null,
    titulo: "",
    cuerpo: "",
    publicado_at: new Date().toISOString().slice(0, 16),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearNotificacion(form);
      alert("Notificación enviada");
      setForm({ user: 0, tipo: "evento", comunicado: null, titulo: "", cuerpo: "", publicado_at: new Date().toISOString().slice(0, 16) });
    } catch {
      alert("Error al enviar notificación");
    }
  };

  return (
    <div className="module-card">
      <h2>Enviar Notificación Directa</h2>
      <form className="module-form" onSubmit={handleSubmit}>
        <input
          type="number"
          name="user"
          value={form.user}
          onChange={handleChange}
          placeholder="ID Usuario destinatario"
          required
        />
        <select name="tipo" value={form.tipo} onChange={handleChange}>
          <option value="evento">Evento</option>
          <option value="alerta">Alerta</option>
        </select>
        <input
          type="text"
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          placeholder="Título"
          required
        />
        <textarea
          name="cuerpo"
          value={form.cuerpo}
          onChange={handleChange}
          placeholder="Cuerpo"
          required
        />
        <input
          type="datetime-local"
          name="publicado_at"
          value={form.publicado_at}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn">Enviar</button>
      </form>
    </div>
  );
};

export default NotificacionPage;
