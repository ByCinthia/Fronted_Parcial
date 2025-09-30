// src/pages/Seguridad/acceso.tsx
import React, { useState, useEffect, useRef } from "react";
import { Acceso } from "./types";
import { registrarAcceso, listarAccesos, reconocerFacial } from "./service";

const AccesoPage: React.FC = () => {
  const [form, setForm] = useState<Acceso>({
    unidad: 0,
    sentido: "in",
    permitido: true,
  });
  const [accesos, setAccesos] = useState<Acceso[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOn, setVideoOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    listarAccesos().then(setAccesos).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(value)
        : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarAcceso(form);
      const data = await listarAccesos();
      setAccesos(data);
      setForm({ unidad: 0, sentido: "in", permitido: true });
    } catch {
      alert("No se pudo registrar acceso");
    }
  };

  // activar cámara
 const startCamera = async () => {
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = newStream;
      await videoRef.current.play().catch(() => {}); // forzar reproducción
      setStream(newStream);
      setVideoOn(true);
    }
  } catch (err) {
    console.error(err);
    alert("No se pudo acceder a la cámara");
  }
};

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setVideoOn(false);
  };

  // capturar foto y enviar al backend
  const captureAndRecognize = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      const data = await reconocerFacial(dataUrl);
      if (data.match) {
        setForm((prev) => ({ ...prev, unidad: data.unidad ?? 0, permitido: true }));
        alert(`Rostro reconocido. Unidad: ${data.unidad}`);
      } else {
        alert("Rostro no reconocido");
      }
    } catch {
      alert("Error en reconocimiento facial");
    }
  };

  return (
    <div className="module-container">
      {/* Formulario manual */}
      <div className="module-card">
        <h2>Registro de Acceso</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <input
            type="number"
            name="unidad"
            value={form.unidad}
            onChange={handleChange}
            placeholder="ID Unidad"
            min={1}
            required
          />
          <select name="sentido" value={form.sentido} onChange={handleChange}>
            <option value="in">Entrada</option>
            <option value="out">Salida</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              name="permitido"
              checked={form.permitido}
              onChange={handleChange}
            />
            Permitido
          </label>
          <button type="submit" className="btn">Registrar</button>
        </form>
      </div>

      {/* Reconocimiento facial opcional */}
<div className="module-card">
  <h2>Reconocimiento Facial</h2>
  {!videoOn ? (
    <button onClick={startCamera} className="btn">Abrir Cámara</button>
  ) : (
    <div className="facecam-container">
      <video ref={videoRef} autoPlay playsInline muted className="facecam-video" />
      <div className="facecam-actions">
        <button onClick={captureAndRecognize} className="btn">Capturar</button>
        <button onClick={stopCamera} className="btn ghost">Cerrar</button>
      </div>
    </div>
  )}
</div>


      {/* Listado de accesos */}
      <div className="module-card">
        <h2>Accesos Registrados</h2>
        {accesos.length === 0 ? (
          <p>No hay accesos registrados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Sentido</th>
                <th>Permitido</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {accesos.map((a, i) => (
                <tr key={i}>
                  <td>{a.unidad}</td>
                  <td>{a.sentido === "in" ? "Entrada" : "Salida"}</td>
                  <td>{a.permitido ? "Sí" : "No"}</td>
                  <td>{a.fecha ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccesoPage;
