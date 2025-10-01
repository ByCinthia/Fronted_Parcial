// src/pages/Reservas/reserva.tsx
import React, { useState, useEffect } from "react";
import { Reserva, Area } from "./types";
import {
  crearReserva,
  listarReservas,
  listarAreas,
  confirmarReserva,
  cancelarReserva,
} from "./service";

const ReservaPage: React.FC = () => {
  const [form, setForm] = useState<Reserva>({
    unidad: 0,
    area: 0,
    start: "",
    end: "",
    notas: "",
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  useEffect(() => {
    listarAreas().then(setAreas).catch(() => {});
    listarReservas().then(setReservas).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crearReserva(form);
    const data = await listarReservas();
    setReservas(data);
    setForm({ unidad: 0, area: 0, start: "", end: "", notas: "" });
  };

  const handleConfirmar = async (id: number) => {
    await confirmarReserva(id);
    const data = await listarReservas();
    setReservas(data);
  };

  const handleCancelar = async (id: number) => {
    await cancelarReserva(id);
    const data = await listarReservas();
    setReservas(data);
  };

  return (
    <div className="module-container">
      {/* Crear Reserva */}
      <div className="module-card">
        <h2>Crear Reserva</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Unidad"
            value={form.unidad}
            onChange={(e) => setForm({ ...form, unidad: +e.target.value })}
            required
          />
          <select
            value={form.area}
            onChange={(e) => setForm({ ...form, area: +e.target.value })}
            required
          >
            <option value={0}>Seleccione Área</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            required
          />
          <input
            placeholder="Notas"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />
          <button className="btn">Reservar</button>
        </form>
      </div>

      {/* Listado de Reservas */}
      <div className="module-card">
        <h2>Reservas</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Área</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id}>
                <td>{r.unidad}</td>
                <td>{r.area}</td>
                <td>{r.start}</td>
                <td>{r.end}</td>
                <td>{r.estado ?? "pendiente"}</td>
                <td>
                  <button
                    onClick={() => handleConfirmar(r.id!)}
                    className="btn"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleCancelar(r.id!)}
                    className="btn ghost"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservaPage;
