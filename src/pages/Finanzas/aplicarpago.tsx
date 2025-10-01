// src/pages/Finanzas/AplicarPagoPage.tsx
import React, { useState } from "react";
import { AplicarPago } from "./types";
import { aplicarPago, verAplicacionesPago, confirmarPago } from "./service";
import { QRCodeCanvas } from "qrcode.react";

const FakeCardPayment: React.FC<{ onSuccess: () => Promise<void> }> = ({ onSuccess }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSimular = async () => {
    const normalized = cardNumber.replace(/\s+/g, "");
    if (normalized === "4242424242424242") {
      setStatus("success");
      await onSuccess();
    } else {
      setStatus("error");
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h4>Simular pago (frontend)</h4>
      <input
        type="text"
        placeholder="Número de tarjeta (usar 4242 4242 4242 4242)"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
      />
      <div style={{ marginTop: 8 }}>
        <button className="btn" onClick={handleSimular}>Simular Pago</button>
        {status === "success" && <span style={{ color: "green", marginLeft: 8 }}>Pago simulado OK</span>}
        {status === "error" && <span style={{ color: "red", marginLeft: 8 }}>Pago simulado fallido</span>}
      </div>
    </div>
  );
};

const AplicarPagoPage: React.FC = () => {
  const [form, setForm] = useState<AplicarPago>({ pago: 0, cargo: 0, monto: "" });
  const [aplicaciones, setAplicaciones] = useState<AplicarPago[]>([]);
  const [ultimo, setUltimo] = useState<AplicarPago | null>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

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
    } catch (error) {
      console.error(error);
      alert("Error al aplicar pago");
    }
  };

  const handleBuscarAplicaciones = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    const pagoId = Number((formEl.elements.namedItem("pago") as HTMLInputElement).value);
    try {
      const data = await verAplicacionesPago(pagoId);
      setAplicaciones(data);
    } catch (error) {
      console.error(error);
      alert("Error al obtener aplicaciones");
    }
  };

  const handleConfirmarPago = async (pagoId: number) => {
    setLoadingConfirm(true);
    try {
      await confirmarPago(pagoId);
      const apps = await verAplicacionesPago(pagoId);
      setAplicaciones(apps);
      alert(`Pago ${pagoId} confirmado`);
    } catch (error) {
      console.error(error);
      alert("Error al confirmar pago");
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Aplicar Pago a Cargo</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <label>
           
            <input type="number" name="pago" value={form.pago} onChange={handleChange} min={1} required />
          </label>
          <label>
            
            <input type="number" name="cargo" value={form.cargo} onChange={handleChange} min={1} required />
          </label>
          <label>
          
            <input type="text" name="monto" value={form.monto} onChange={handleChange} placeholder="Ej: 80.00" required />
          </label>
          <button type="submit" className="btn">Aplicar</button>
        </form>

        {ultimo && (
          <div style={{ marginTop: 20 }}>
            <h3>Comprobante QR</h3>
            <QRCodeCanvas value={JSON.stringify(ultimo)} size={200} includeMargin />
            <p style={{ marginTop: 8 }}>
              Pago {ultimo.pago} aplicado a cargo {ultimo.cargo} por ${ultimo.monto}
            </p>

            <FakeCardPayment onSuccess={async () => handleConfirmarPago(ultimo.pago)} />
            {loadingConfirm && <p>Confirmando pago...</p>}
          </div>
        )}
      </div>

      <div className="module-card">
        <h2>Aplicaciones de Pago</h2>
        <form className="module-form" onSubmit={handleBuscarAplicaciones}>
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
