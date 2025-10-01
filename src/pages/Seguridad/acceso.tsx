// src/pages/Seguridad/acceso.tsx
import React, { useEffect, useRef, useState } from "react";
import { Acceso } from "./types";
import { registrarAcceso, listarAccesos, reconocerFacial } from "./service";

type AnyObj = Record<string, unknown>;

type AccesoRow = {
  unidad: number;
  sentido: "in" | "out";
  permitido: boolean;
  fecha?: string;
  foto_url?: string;
};

// ---------- helpers sin any ----------
function pickNumber(o: AnyObj, keys: readonly string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}
function pickString(o: AnyObj, keys: readonly string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") return v;
  }
  return undefined;
}
function pickBoolean(o: AnyObj, keys: readonly string[]): boolean | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "boolean") return v;
  }
  return undefined;
}
function coerceUnidadId(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "object" && x !== null) {
    const id = pickNumber(x as AnyObj, ["id", "pk"]);
    return id ?? 0;
  }
  return 0;
}

function coerceAcceso(x: unknown): AccesoRow | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as AnyObj;

  const unidad = coerceUnidadId(o["unidad"]);
  if (unidad <= 0) return null;

  const sentidoRaw = pickString(o, ["sentido", "direction"])?.toLowerCase();
  const permitidoBool = pickBoolean(o, ["permitido", "allowed", "is_allowed"]);

  return {
    unidad,
    sentido: sentidoRaw === "out" ? "out" : "in",
    permitido: permitidoBool === undefined ? true : permitidoBool,
    fecha: pickString(o, ["fecha", "created_at", "timestamp", "date"]) ?? undefined,
    foto_url: pickString(o, ["foto_url", "image_url", "photo_url", "snapshot"]) ?? undefined,
  };
}

function normalizeAccesos(data: unknown): AccesoRow[] {
  if (Array.isArray(data)) {
    return data.map(coerceAcceso).filter((x): x is AccesoRow => x !== null);
  }
  if (typeof data === "object" && data !== null) {
    const o = data as AnyObj;
    const arr: unknown[] =
      Array.isArray(o["results"])
        ? (o["results"] as unknown[])
        : Array.isArray(o["data"])
        ? (o["data"] as unknown[])
        : Array.isArray(o["items"])
        ? (o["items"] as unknown[])
        : [];
    return arr.map(coerceAcceso).filter((x): x is AccesoRow => x !== null);
  }
  return [];
}

type ReconResp = {
  match?: boolean;
  unidad?: number;
  confianza?: number;
  mensaje?: string;
};

function coerceReconResp(x: unknown): ReconResp {
  if (typeof x !== "object" || x === null) return {};
  const o = x as AnyObj;
  const match = typeof o["match"] === "boolean" ? o["match"] : undefined;
  const unidad = pickNumber(o, ["unidad"]) ?? undefined;
  const confianza = typeof o["confianza"] === "number" ? o["confianza"] : undefined;
  const mensaje = pickString(o, ["mensaje", "message"]);
  return { match, unidad, confianza, mensaje };
}

const AccesoPage: React.FC = () => {
  // formulario base
  const [form, setForm] = useState<Acceso>({
    unidad: 0,
    sentido: "in",
    permitido: true,
  });

  // listado normalizado
  const [accesos, setAccesos] = useState<AccesoRow[]>([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // cámara / snapshot
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOn, setVideoOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null); // dataURL JPEG

  // cargar lista al montar
  useEffect(() => {
    (async () => {
      setCargandoLista(true);
      setMsg(null);
      try {
        const raw = (await listarAccesos()) as unknown;
        setAccesos(normalizeAccesos(raw));
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : "Error cargando accesos");
      } finally {
        setCargandoLista(false);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(e.target.value)
        : e.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await registrarAcceso(form);
      const raw = (await listarAccesos()) as unknown;
      setAccesos(normalizeAccesos(raw));
      setForm({ unidad: 0, sentido: "in", permitido: true });
      setSnapshot(null);
      setMsg("Acceso registrado");
    } catch {
      setMsg("No se pudo registrar acceso");
    }
  };

  // Activar cámara (intenta trasera cuando exista)
  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
      setStream(newStream);
      setVideoOn(true);
      setSnapshot(null);
    } catch (e) {
      // usamos la variable en el log para evitar warning y ayudar al debug
      // eslint-disable-next-line no-console
      console.error(e);
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

  // detener cámara al desmontar
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // Capturar foto
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0) {
      alert("La cámara todavía no está lista. Intenta de nuevo en un segundo.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setSnapshot(dataUrl);
  };

  // Capturar + reconocer
  const captureAndRecognize = async () => {
    capturePhoto();
    // da un respiro para que snapshot se setee
    setTimeout(async () => {
      const current = snapshot;
      if (!current && videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setSnapshot(dataUrl);
        await tryRecognize(dataUrl);
      } else if (current) {
        await tryRecognize(current);
      }
    }, 150);
  };

  async function tryRecognize(dataUrl: string) {
    try {
      const raw = (await reconocerFacial(dataUrl)) as unknown;
      const resp = coerceReconResp(raw);
      if (resp.match) {
        setForm((prev) => ({
          ...prev,
          unidad: resp.unidad && resp.unidad > 0 ? resp.unidad : prev.unidad,
          permitido: true,
        }));
        alert(
          `Rostro reconocido${resp.unidad ? ` (Unidad ${resp.unidad})` : ""}${
            resp.confianza ? `, confianza ${(resp.confianza * 100).toFixed(1)}%` : ""
          }`
        );
      } else {
        alert(resp.mensaje ?? "Rostro no reconocido");
      }
    } catch {
      alert("Error en reconocimiento facial");
    }
  }

  return (
    <div className="module-container">
      {/* Formulario manual */}
      <div className="module-card">
        <h2>Registro de Acceso</h2>
        <form className="module-form" onSubmit={handleSubmit} noValidate>
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
          <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

        {msg && <div style={{ marginBlockStart: 8 }}>{msg}</div>}
      </div>

      {/* Reconocimiento facial */}
      <div className="module-card">
        <h2>Reconocimiento Facial</h2>

        {!videoOn ? (
          <button onClick={startCamera} className="btn">Abrir Cámara</button>
        ) : (
          <div className="facecam-container" style={{ display: "grid", gap: 8 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="facecam-video"
              // reemplazo width/maxWidth por inlineSize/maxInlineSize
              style={{ inlineSize: "100%", maxInlineSize: 480, borderRadius: 8 }}
            />
            <div className="facecam-actions" style={{ display: "flex", gap: 8 }}>
              <button onClick={captureAndRecognize} className="btn">Capturar y reconocer</button>
              <button onClick={capturePhoto} className="btn">Solo capturar</button>
              <button onClick={stopCamera} className="btn ghost">Cerrar cámara</button>
            </div>

            {snapshot && (
              <div style={{ marginBlockStart: 8 }}>
                <p style={{ marginBlockEnd: 6 }}>Foto capturada:</p>
                <img
                  src={snapshot}
                  alt="snapshot"
                  // reemplazo maxWidth por maxInlineSize
                  style={{ maxInlineSize: 240, borderRadius: 8, display: "block" }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Listado */}
      <div className="module-card">
        <h2>Accesos Registrados</h2>
        {cargandoLista && accesos.length === 0 ? (
          <p>Cargando...</p>
        ) : accesos.length === 0 ? (
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
                <tr key={`${a.unidad}-${a.fecha ?? ""}-${i}`}>
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
