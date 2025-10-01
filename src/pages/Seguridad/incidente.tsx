import React, { useEffect, useState } from "react";
import { fetchJson } from "../../shared/api";
import "../../styles/dashboard.css";

type AnyObj = Record<string, unknown>;

type IncidenteRow = {
  id: number;
  unidad: number;
  user: number | null;
  titulo: string;
  descripcion?: string;
  estado: "abierto" | "cerrado" | string;
  evidencia_url?: string | null;
  is_active?: boolean;
};

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

function coerceIncidente(x: unknown): IncidenteRow | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as AnyObj;

  const id = pickNumber(o, ["id", "pk"]);
  const unidad = pickNumber(o, ["unidad"]);
  const titulo = pickString(o, ["titulo", "title"]);
  if (id === null || unidad === null || !titulo) return null;

  const user =
    typeof o["user"] === "number"
      ? (o["user"] as number)
      : pickNumber((o["user"] as AnyObj) ?? {}, ["id", "pk"]);

  const descripcion = pickString(o, ["descripcion", "description"]);
  const estado = pickString(o, ["estado", "status"]) ?? "abierto";
  const evidencia_url =
    ("evidencia_url" in o && typeof o["evidencia_url"] !== "undefined")
      ? (o["evidencia_url"] as string | null)
      : undefined;
  const is_active = pickBoolean(o, ["is_active"]);

  return { id, unidad, user: user ?? null, titulo, descripcion, estado, evidencia_url, is_active };
}

function normalizeIncidentes(data: unknown): IncidenteRow[] {
  if (Array.isArray(data)) return data.map(coerceIncidente).filter((x): x is IncidenteRow => x !== null);
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
    return arr.map(coerceIncidente).filter((x): x is IncidenteRow => x !== null);
  }
  return [];
}

const IncidentesPage: React.FC = () => {
  const [form, setForm] = useState({
    unidad: 0,
    user: 0,
    titulo: "",
    descripcion: "",
    estado: "abierto",
    evidencia: null as File | null,
    monto_multa: "",
  });
  const [incidentes, setIncidentes] = useState<IncidenteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const raw = await fetchJson<unknown>("/api/v1/incidentes/");
      setIncidentes(normalizeIncidentes(raw));
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error cargando incidentes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;
    const val =
      type === "number" ? Number(e.target.value) :
      type === "file" ? (e.target as HTMLInputElement).files?.[0] ?? null :
      e.target.value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("unidad", String(form.unidad));
      fd.append("user", String(form.user));
      fd.append("titulo", form.titulo);
      fd.append("descripcion", form.descripcion);
      fd.append("estado", form.estado);
      if (form.evidencia) fd.append("evidencia", form.evidencia);
      if (form.monto_multa) fd.append("monto_multa", form.monto_multa);

      // POST directo con fetchJson (respeta FormData)
      await fetchJson<unknown>("/api/v1/incidentes/", { method: "POST", body: fd });

      await load();
      setForm({
        unidad: 0,
        user: 0,
        titulo: "",
        descripcion: "",
        estado: "abierto",
        evidencia: null,
        monto_multa: "",
      });
      setMsg("Incidente registrado");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error al registrar incidente");
    }
  };

  const isValid =
    form.unidad > 0 && form.user > 0 && form.titulo.trim().length >= 3 && form.descripcion.trim().length >= 3;

  return (
    <div className="module-container">
      {/* Formulario */}
      <div className="module-card">
        <h2>Registrar Incidente</h2>
        <form className="module-form" onSubmit={onSubmit} noValidate>
          <input
            type="number"
            name="unidad"
            value={form.unidad}
            onChange={handleChange}
            placeholder="Unidad"
            min={1}
            required
          />
          <input
            type="number"
            name="user"
            value={form.user}
            onChange={handleChange}
            placeholder="Usuario"
            min={1}
            required
          />
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Título"
            required
          />
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            required
          />
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="abierto">Abierto</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <input type="file" name="evidencia" accept="image/*" onChange={handleChange} />
          <input
            type="number"
            name="monto_multa"
            value={form.monto_multa}
            onChange={handleChange}
            placeholder="Monto multa"
            min={0}
            step="0.01"
          />
          <button type="submit" className="btn" disabled={!isValid}>Registrar</button>
        </form>
        {msg && <div style={{ marginBlockStart: 8 }}>{msg}</div>}
      </div>

      {/* Listado */}
      <div className="module-card">
        <h2>Incidentes Registrados</h2>
        {loading && incidentes.length === 0 ? (
          <p>Cargando...</p>
        ) : incidentes.length === 0 ? (
          <p>No hay incidentes registrados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Usuario</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {incidentes.map((i) => (
                <tr key={i.id}>
                  <td>{i.unidad}</td>
                  <td>{i.user ?? "-"}</td>
                  <td>{i.titulo}</td>
                  <td>{i.estado}</td>
                  <td>
                    {typeof i.evidencia_url === "string" ? (
                      <a href={i.evidencia_url} target="_blank" rel="noreferrer">Ver</a>
                    ) : "-"}
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

export default IncidentesPage;
