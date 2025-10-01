// src/pages/Finanzas/AplicarPagoPage.tsx
import React, { useState } from "react";
import { AplicarPago } from "./types";
import { aplicarPago, verAplicacionesPago } from "./service";
import { QRCodeCanvas } from "qrcode.react";

const AplicarPagoPage: React.FC = () => {
  const [form, setForm] = useState<AplicarPago>({ pago: 0, cargo: 0, monto: "" });
  const [aplicaciones, setAplicaciones] = useState<AplicarPago[]>([]);
  const [ultimo, setUltimo] = useState<AplicarPago | null>(null);

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
      const result = await aplicarPago(form);
      setUltimo(result);
      alert("Pago aplicado correctamente");
    } catch {
      alert("Error al aplicar pago");
    }
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Aplicar Pago a Cargo</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input type="number" name="pago" placeholder="Pago ID"
            value={form.pago} onChange={handleChange} min={1} required />
          <input type="number" name="cargo" placeholder="Cargo ID"
            value={form.cargo} onChange={handleChange} min={1} required />
          <input type="text" name="monto" placeholder="Ej: 100.00"
            value={form.monto} onChange={handleChange} required />
          <button className="btn">Aplicar</button>
        </form>

        {ultimo && (
          <div style={{ marginTop: 20 }}>
            <h3>QR del Comprobante</h3>
            <QRCodeCanvas value={JSON.stringify(ultimo)} size={200} includeMargin />
            <p>Pago {ultimo.pago} aplicado a cargo {ultimo.cargo} por ${ultimo.monto}</p>
          </div>
        )}
      </div>

      <div className="module-card">
        <h2>Ver Aplicaciones de Pago</h2>
        <form className="module-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const pagoId = Number(
              (e.currentTarget.elements.namedItem("pago") as HTMLInputElement).value
            );
            const data = await verAplicacionesPago(pagoId);
            setAplicaciones(data);
          }}
        >
          <input type="number" name="pago" placeholder="Pago ID" min={1} required />
          <button className="btn">Buscar</button>
        </form>

        {aplicaciones.length > 0 && (
          <table className="table">
            <thead>
              <tr><th>Pago</th><th>Cargo</th><th>Monto</th></tr>
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
