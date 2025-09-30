// src/pages/Finanzas/pago.tsx
import React, { useState } from "react";
import { CreatePagoPayload, Pago } from "./types";
import { createPago, listarPagos } from "./service";

const PagoPage: React.FC = () => {
  // estado para crear pago
  const [newPago, setNewPago] = useState<CreatePagoPayload>({
    user: 0,
    unidad: 0,
    fecha: "",
    monto_total: "",
    metodo: "efectivo",
    estado: "pendiente",
    referencia: "",
  });

  // estado para listar pagos
  const [pagos, setPagos] = useState<Pago[]>([]);

  const handleCreatePago = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPago(newPago);
      alert("Pago creado correctamente");
      setNewPago({
        user: 0,
        unidad: 0,
        fecha: "",
        monto_total: "",
        metodo: "efectivo",
        estado: "pendiente",
        referencia: "",
      });
    } catch (error) {
      alert("Error al crear el pago");
      console.error(error);
    }
  };

  const handleBuscar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const unidad = Number((form.elements.namedItem("unidad") as HTMLInputElement).value);
    const desde = (form.elements.namedItem("desde") as HTMLInputElement).value;
    const hasta = (form.elements.namedItem("hasta") as HTMLInputElement).value;
    const data = await listarPagos(unidad, desde, hasta);
    setPagos(data);
  };

  return (
    <div className="module-container">
      {/* Crear Pago */}
      <div className="module-card">
        <h2>Crear Pago</h2>
        <form className="module-form" onSubmit={handleCreatePago}>
          <input
            type="number"
            placeholder="Usuario"
            value={newPago.user}
            onChange={(e) => setNewPago({ ...newPago, user: +e.target.value })}
            min={1}
            required
          />
          <input
            type="number"
            placeholder="Unidad"
            value={newPago.unidad}
            onChange={(e) => setNewPago({ ...newPago, unidad: +e.target.value })}
            min={1}
            required
          />
          <input
            type="date"
            placeholder="Fecha"
            value={newPago.fecha}
            onChange={(e) => setNewPago({ ...newPago, fecha: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Monto Total"
            value={newPago.monto_total}
            onChange={(e) => setNewPago({ ...newPago, monto_total: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Referencia"
            value={newPago.referencia}
            onChange={(e) => setNewPago({ ...newPago, referencia: e.target.value })}
            required
          />
          <button type="submit" className="btn">Crear Pago</button>
        </form>
      </div>

      {/* Listar Pagos */}
      <div className="module-card">
        <h2>Pagos por Unidad y Fechas</h2>
        <form className="module-form" onSubmit={handleBuscar}>
          <input type="number" name="unidad" placeholder="Unidad" min={1} required />
          <input type="date" name="desde" />
          <input type="date" name="hasta" />
          <button type="submit" className="btn">Buscar</button>
        </form>

        {pagos.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Unidad</th>
                <th>Fecha</th>
                <th>Monto Total</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.user}</td>
                  <td>{p.unidad}</td>
                  <td>{p.fecha}</td>
                  <td>{p.monto_total}</td>
                  <td>{p.metodo}</td>
                  <td>{p.estado}</td>
                  <td>{p.referencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PagoPage;
