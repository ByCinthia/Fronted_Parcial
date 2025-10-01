// src/pages/Finanzas/PagoPage.tsx
import React, { useState, useEffect } from "react";
import { CreatePagoPayload, Pago } from "./types";
import { createPago, listarPagos, confirmarPago, marcarPagoFallido } from "./service";

const PagoPage: React.FC = () => {
  const [newPago, setNewPago] = useState<CreatePagoPayload>({
    user: 0,
    fecha: "",
    metodo: "efectivo",
    observacion: "",
  });
  const [pagos, setPagos] = useState<Pago[]>([]);

  useEffect(() => {
    listarPagos().then(setPagos).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPago(newPago);
      const lista = await listarPagos();
      setPagos(lista);
      setNewPago({ user: 0, fecha: "", metodo: "efectivo", observacion: "" });
    } catch (err) {
      alert("Error al crear pago");
      console.error(err);
    }
  };

  const handleConfirmar = async (id: number) => {
    await confirmarPago(id);
    const lista = await listarPagos();
    setPagos(lista);
  };

  const handleFallido = async (id: number) => {
    await marcarPagoFallido(id);
    const lista = await listarPagos();
    setPagos(lista);
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Pago</h2>
        <form className="module-form" onSubmit={handleCreate}>
          <input type="number" placeholder="Usuario" value={newPago.user}
            onChange={(e) => setNewPago({ ...newPago, user: +e.target.value })} required />
          <input type="date" value={newPago.fecha}
            onChange={(e) => setNewPago({ ...newPago, fecha: e.target.value })} required />
          <select value={newPago.metodo}
            onChange={(e) => setNewPago({ ...newPago, metodo: e.target.value as CreatePagoPayload["metodo"] })}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
          <textarea placeholder="Observación" value={newPago.observacion}
            onChange={(e) => setNewPago({ ...newPago, observacion: e.target.value })} />
          <button className="btn">Crear</button>
        </form>
      </div>

      <div className="module-card">
        <h2>Listado de Pagos</h2>
        {pagos.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Usuario</th><th>Fecha</th><th>Monto Total</th>
                <th>Método</th><th>Estado</th><th>Observación</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.user}</td>
                  <td>{p.fecha}</td>
                  <td>{p.monto_total}</td>
                  <td>{p.metodo}</td>
                  <td>{p.estado}</td>
                  <td>{p.observacion ?? "-"}</td>
                  <td>
                    {p.estado === "pendiente" && (
                      <>
                        <button className="btn" onClick={() => handleConfirmar(p.id)}>Confirmar</button>
                        <button className="btn secondary" onClick={() => handleFallido(p.id)}>Fallido</button>
                      </>
                    )}
                  </td>
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
