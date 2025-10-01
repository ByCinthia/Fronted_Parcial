import React, { useCallback, useEffect, useState } from "react";
import { Condominio, CreateCondominioPayload} from "./types";
import { createCondominio } from "./service";
import { fetchJson } from "../../shared/api";
import "../../styles/dashboard.css";

type Flash = { type: "error" | "success"; text: string };
type AnyObj = Record<string, unknown>;
const CACHE_KEY = "condominios_cache_v1";

/* -------------------- cache helpers (tipado estricto) -------------------- */
function readCache<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
function writeCache<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // sin-op
  }
}
function mergeById<T extends { id: number }>(a: T[], b: T[]): T[] {
  const map = new Map<number, T>();
  for (const x of [...a, ...b]) map.set(x.id, x);
  return Array.from(map.values());
}
/* ------------------------------------------------------------------------ */

/* --------- normalizador robusto (sin any) para respuestas del API -------- */
function toVH(value: string): "vertical" | "horizontal" {
  const v = value.toLowerCase();
  if (v === "vertical" || v === "departamento") return "vertical";
  if (v === "horizontal" || v === "casa") return "horizontal";
  return "vertical";
}
function pickString(o: AnyObj, keys: readonly string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return null;
}
function pickNumber(o: AnyObj, keys: readonly string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}
function coerceCondominio(x: unknown): Condominio | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as AnyObj;
  const id = pickNumber(o, ["id", "pk"]);
  if (id === null) return null;
  const name = pickString(o, ["name", "nombre", "title"]) ?? `Condominio ${id}`;
  const direccion = pickString(o, ["direccion", "address", "dir", "ubicacion"]) ?? "";
  const rawTipo = pickString(o, ["tipo", "tipo_display", "type", "kind"]) ?? "vertical";
  return { id, name, direccion, tipo: toVH(rawTipo) };
}
function normalizeCondominios(data: unknown): Condominio[] {
  if (Array.isArray(data)) {
    return data.map(coerceCondominio).filter((x): x is Condominio => x !== null);
  }
  if (typeof data === "object" && data !== null) {
    const o = data as AnyObj;
    const candidates: unknown[] =
      Array.isArray(o["results"])
        ? (o["results"] as unknown[])
        : Array.isArray(o["data"])
        ? (o["data"] as unknown[])
        : Array.isArray(o["items"])
        ? (o["items"] as unknown[])
        : [];
    if (candidates.length) {
      return candidates.map(coerceCondominio).filter((x): x is Condominio => x !== null);
    }
  }
  return [];
}
/* ------------------------------------------------------------------------ */

const CondominioPage: React.FC = () => {
  const [condominios, setCondominios] = useState<Condominio[]>(() => readCache<Condominio>(CACHE_KEY));
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);

  const [search, setSearch] = useState<string>("");
  const [ordering, setOrdering] = useState<string>("-id");
  const [showAll, setShowAll] = useState<boolean>(true);

  const load = useCallback(async () => {
    setLoading(true);
    setFlash(null);
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("search", search.trim());
      if (ordering) qs.set("ordering", ordering);
      if (showAll) { qs.set("page_size", "1000"); qs.set("limit", "1000"); }
      const endpoint = `/api/v1/condominios/${qs.toString() ? `?${qs}` : ""}`;

      const raw = await fetchJson<unknown>(endpoint);
      const fromServer = normalizeCondominios(raw);

      if (fromServer.length > 0) {
        const merged = mergeById(condominios, fromServer);
        setCondominios(merged);
        writeCache(CACHE_KEY, merged);
      } else {
        // fallback: conserva lo que ya tenías en pantalla/cache
        if (condominios.length === 0) {
          setFlash({ type: "error", text: "No se encontraron condominios en el servidor." });
        } else {
          setFlash({ type: "error", text: "El servidor devolvió vacío; mostrando datos locales." });
        }
      }
    } catch (e: unknown) {
      // error de red/401/403 -> mantener caché
      if (condominios.length === 0) {
        setFlash({ type: "error", text: e instanceof Error ? e.message : "Error cargando" });
      } else {
        setFlash({ type: "error", text: "No se pudo sincronizar; mostrando datos locales." });
      }
    } finally {
      setLoading(false);
    }
  }, [search, ordering, showAll, condominios]);

  useEffect(() => { void load(); }, [load]);

  const [form, setForm] = useState<CreateCondominioPayload>({
    direccion: "",
    name: "",
    tipo: "vertical",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };
  const isValid =
    form.direccion.trim().length >= 3 &&
    form.name.trim().length >= 3 &&
    (form.tipo === "vertical" || form.tipo === "horizontal");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || creating) return;
    setCreating(true);
    setFlash(null);
    try {
      const nuevo = await createCondominio({
        direccion: form.direccion.trim(),
        name: form.name.trim(),
        tipo: form.tipo,
      });
      // pinta al instante + guarda en caché
      const merged = mergeById([nuevo], condominios);
      setCondominios(merged);
      writeCache(CACHE_KEY, merged);

      // sincroniza en segundo plano
      void load();

      setForm({ direccion: "", name: "", tipo: "vertical" });
      setFlash({ type: "success", text: "Condominio creado" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al crear";
      setFlash({ type: "error", text: msg });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="module-container">
      {/* Listado + filtros */}
      <div className="module-card">
        <div className="module-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h2>Condominios</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="form-input" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="form-input" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
              <option value="-id">Nuevos primero</option>
              <option value="id">Antiguos primero</option>
              <option value="name">Nombre (A-Z)</option>
              <option value="-name">Nombre (Z-A)</option>
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Mostrar todo
            </label>
            <button className="btn" onClick={() => void load()} disabled={loading}>
              {loading ? "Cargando..." : "Recargar"}
            </button>
          </div>
        </div>

        {condominios.length === 0 ? (
          <p>No hay registros.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th>Dirección</th><th>Tipo</th></tr>
            </thead>
            <tbody>
              {condominios.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.direccion}</td>
                  <td style={{ textTransform: "capitalize" }}>{c.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {flash && (
          <div style={{ color: flash.type === "error" ? "#c62828" : "#1b5e20", marginBlockStart: 8, fontWeight: 600 }}>
            {flash.text}
          </div>
        )}
      </div>

      {/* Crear */}
      <div className="module-card">
        <h2>Crear Condominio</h2>
        <form className="module-form" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Dirección *</label>
            <input className="form-input" name="direccion" value={form.direccion} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-input" name="name" value={form.name} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo *</label>
            <select className="form-input" name="tipo" value={form.tipo} onChange={onChange}>
              <option value="vertical">Vertical (departamentos)</option>
              <option value="horizontal">Horizontal (casas)</option>
            </select>
          </div>
          <button className="btn" type="submit" disabled={!isValid || creating}>
            {creating ? "Creando..." : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CondominioPage;
