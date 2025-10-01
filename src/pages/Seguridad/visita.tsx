import React, { useEffect, useState } from "react";
import { fetchJson } from "../../shared/api"; // usamos fetchJson porque maneja JWT y FormData
import "../../styles/dashboard.css";

type AnyObj = Record<string, unknown>;

/* ---------- Tipos locales (no dependemos de un type desalineado) ---------- */
type VisitaRow = {
  id: number;
  name: string;
  documento: string;
  telefono?: string;
  fecha_inicio?: string;
  dias_permiso?: number;
  is_active?: boolean;
  photo_url?: string | null;
  permitido: boolean; // calculado por el backend
};

type FormState = {
  name: string;
  documento: string;
  telefono: string;
  fecha_inicio: string;   // yyyy-MM-ddTHH:mm (input datetime-local)
  dias_permiso: number;   // días de permiso
  is_active: boolean;
  photo: File | null;     // opcional
};

/* ------------------------ helpers de normalización ------------------------ */
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

function coerceVisita(x: unknown): VisitaRow | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as AnyObj;

  const id = pickNumber(o, ["id", "pk"]);
  const name = pickString(o, ["name", "nombre"]);
  const documento = pickString(o, ["documento"]);
  if (id === null || !name || !documento) return null;

  const telefono = pickString(o, ["telefono", "phone"]);
  const fecha_inicio = pickString(o, ["fecha_inicio", "created_at", "fecha"]);
  const dias_permiso = pickNumber(o, ["dias_permiso"]) ?? undefined;
  const is_active = pickBoolean(o, ["is_active"]);
  const photo_url = ("photo_url" in o && typeof o["photo_url"] !== "undefined")
    ? (o["photo_url"] as string | null)
    : undefined;
  const permitido = pickBoolean(o, ["permitido"]) ?? false;

  return {
    id,
    name,
    documento,
    telefono,
    fecha_inicio,
    dias_permiso,
    is_active,
    photo_url,
    permitido,
  };
}

function normalizeVisitas(data: unknown): VisitaRow[] {
  if (Array.isArray(data)) {
    return data.map(coerceVisita).filter((x): x is VisitaRow => x !== null);
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
    return arr.map(coerceVisita).filter((x): x is VisitaRow => x !== null);
  }
  return [];
}
/* ------------------------------------------------------------------------- */

const VisitaPage: React.FC = () => {
  const [visitas, setVisitas] = useState<VisitaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    documento: "",
    telefono: "",
    fecha_inicio: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    dias_permiso: 1,
    is_active: true,
    photo: null,
  });

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const qs = new URLSearchParams({ page_size: "1000", limit: "1000", ordering: "-id" });
      const raw = await fetchJson<unknown>(`/api/v1/visitas/?${qs.toString()}`);
      const list = normalizeVisitas(raw);
      setVisitas(list);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error cargando visitas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(e.target.value)
        : e.target.value;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setForm((s) => ({ ...s, photo: f }));
  };

  const isValid =
    form.name.trim().length >= 3 &&
    form.documento.trim().length >= 3 &&
    form.dias_permiso >= 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("documento", form.documento.trim());
      if (form.telefono.trim()) fd.append("telefono", form.telefono.trim());
      if (form.photo) fd.append("photo", form.photo);
      // fecha_inicio y dias_permiso son opcionales en backend, pero los mandamos si los eliges:
      if (form.fecha_inicio) fd.append("fecha_inicio", new Date(form.fecha_inicio).toISOString());
      fd.append("dias_permiso", String(form.dias_permiso));
      fd.append("is_active", String(form.is_active));

      // POST directo con fetchJson (FormData => no fuerza JSON)
      await fetchJson<unknown>("/api/v1/visitas/", { method: "POST", body: fd });

      await load();
      setForm({
        name: "",
        documento: "",
        telefono: "",
        fecha_inicio: new Date().toISOString().slice(0, 16),
        dias_permiso: 1,
        is_active: true,
        photo: null,
      });
      setMsg("Visita registrada");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error al registrar visita");
    }
  };

  return (
    <div className="module-container">
      {/* Formulario */}
      <div className="module-card">
        <h2>Registrar Visita</h2>
        <form className="module-form" onSubmit={onSubmit} noValidate>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Nombre completo"
            required
          />
          <input
            type="text"
            name="documento"
            value={form.documento}
            onChange={onChange}
            placeholder="Documento"
            required
          />
          <input
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={onChange}
            placeholder="Teléfono (opcional)"
          />
          <input
            type="datetime-local"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={onChange}
            required
          />
          <input
            type="number"
            name="dias_permiso"
            value={form.dias_permiso}
            onChange={onChange}
            placeholder="Días de permiso"
            min={0}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
            />
            Activo
          </label>
          <label className="form-label">Foto (opcional)</label>
          <input type="file" accept="image/*" onChange={onFile} />

          <button type="submit" className="btn" disabled={!isValid}>
            Registrar
          </button>
        </form>

        {msg && <div style={{ marginBlockStart: 8 }}>{msg}</div>}
      </div>

      {/* Listado */}
      <div className="module-card">
        <h2>Visitas Registradas</h2>
        {loading && visitas.length === 0 ? (
          <p>Cargando...</p>
        ) : visitas.length === 0 ? (
          <p>No hay visitas registradas.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Inicio</th>
                <th>Días</th>
                <th>Activo</th>
                <th>Permitido ahora</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              {visitas.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.documento}</td>
                  <td>{v.telefono ?? "-"}</td>
                  <td>{v.fecha_inicio ?? "-"}</td>
                  <td>{typeof v.dias_permiso === "number" ? v.dias_permiso : "-"}</td>
                  <td>{v.is_active ? "Sí" : "No"}</td>
                  <td>{v.permitido ? "Sí" : "No"}</td>
                  <td>
                    {typeof v.photo_url === "string" ? (
                      <a href={v.photo_url} target="_blank" rel="noreferrer">Ver</a>
                    ) : (
                      "-"
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

export default VisitaPage;
