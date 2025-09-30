// src/pages/Finanzas/aplicarpago.tsx
import React, { useState } from "react";
import { AplicarPago } from "./types";
import { aplicarPago, verAplicacionesPago } from "./service";

const AplicarPagoPage: React.FC = () => {
  const [form, setForm] = useState<AplicarPago>({ pago: 0, cargo: 0, monto: "" });
  const [aplicaciones, setAplicaciones] = useState<AplicarPago[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pago" || name === "cargo" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await aplicarPago(form);
      alert("Pago aplicado correctamente");
    } catch {
      alert("Error al aplicar pago");
    }
  };

  return (
    <div className="module-container">
      {/* Formulario */}
      <div className="module-card">
        <h2>Aplicar Pago a Cargo</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <label>
            Pago ID
            <input type="number" name="pago" value={form.pago} onChange={handleChange} min={1} required />
          </label>
          <label>
            Cargo ID
            <input type="number" name="cargo" value={form.cargo} onChange={handleChange} min={1} required />
          </label>
          <label>
            Monto
            <input type="text" name="monto" value={form.monto} onChange={handleChange} placeholder="Ej: 80.00" required />
          </label>
          <button type="submit" className="btn">Aplicar</button>
        </form>
      </div>

      {/* Ver Aplicaciones */}
      <div className="module-card">
        <h2>Aplicaciones de Pago</h2>
        <form
          className="module-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const pagoId = Number((e.currentTarget.elements.namedItem("pago") as HTMLInputElement).value);
            const data = await verAplicacionesPago(pagoId);
            setAplicaciones(data);
          }}
        >
          <input type="number" name="pago" placeholder="Pago ID" min={1} required />
          <button type="submit" className="btn">Buscar</button>
        </form>
        {aplicaciones.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Pago</th>
                <th>Cargo</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {aplicaciones.map((a, i) => (
                <tr key={i}>
                  <td>{a.pago}</td>
                  <td>{a.cargo}</td>
                  <td>{a.monto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AplicarPagoPage;
