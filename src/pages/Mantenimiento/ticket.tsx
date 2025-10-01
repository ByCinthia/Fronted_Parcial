// src/pages/Mantenimiento/ticket.tsx
import React, { useState, useEffect } from "react";
import { Ticket, Servicio } from "./types";
import { crearTicket, listarTickets, listarServicios } from "./service";

const TicketPage: React.FC = () => {
  const [form, setForm] = useState<Ticket>({
    unidad: 0,
    servicio: 0,
    titulo: "",
    descripcion: "",
    estado: "abierto",
    programado: "",
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [filtro, setFiltro] = useState({ desde: "", hasta: "" });

  useEffect(() => {
    listarServicios().then(setServicios).catch(() => {});
    listarTickets().then(setTickets).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crearTicket(form);
    const data = await listarTickets();
    setTickets(data);
    setForm({ unidad: 0, servicio: 0, titulo: "", descripcion: "", estado: "abierto", programado: "" });
  };

  const handleFiltrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await listarTickets(filtro);
    setTickets(data);
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Ticket</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input type="number" placeholder="Unidad" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: +e.target.value })} required />
          <select value={form.servicio} onChange={(e) => setForm({ ...form, servicio: +e.target.value })} required>
            <option value={0}>Seleccione Servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
          <input placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
          <input type="datetime-local" value={form.programado} onChange={(e) => setForm({ ...form, programado: e.target.value })} required />
          <button className="btn">Guardar</button>
        </form>
      </div>

      <div className="module-card">
        <h2>Filtrar Tickets por Fecha Programada</h2>
        <form className="module-form" onSubmit={handleFiltrar}>
          <input type="date" value={filtro.desde} onChange={(e) => setFiltro({ ...filtro, desde: e.target.value })} />
          <input type="date" value={filtro.hasta} onChange={(e) => setFiltro({ ...filtro, hasta: e.target.value })} />
          <button className="btn">Filtrar</button>
        </form>
      </div>

      <div className="module-card">
        <h2>Tickets</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Servicio</th>
              <th>Título</th>
              <th>Programado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>{t.unidad}</td>
                <td>{t.servicio}</td>
                <td>{t.titulo}</td>
                <td>{t.programado}</td>
                <td>{t.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketPage;
