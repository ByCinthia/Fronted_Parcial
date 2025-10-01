import React, { useEffect, useMemo, useState } from "react";
import { Unidad, CreateUnidadPayload, Condominio } from "./types";
import { createUnidad } from "./service";
import { fetchJson } from "../../shared/api";
import "../../styles/dashboard.css";

type AnyObj = Record<string, unknown>;
const CONDOS_CACHE = "condominios_cache_v1";
const UNITS_CACHE = "unidades_cache_v1";

/* -------------------- cache helpers -------------------- */
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
  try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* no-op */ }
}
function mergeById<T extends { id: number }>(a: T[], b: T[]): T[] {
  const m = new Map<number, T>();
  for (const x of [...a, ...b]) m.set(x.id, x);
  return Array.from(m.values());
}
/* ------------------------------------------------------ */

/* ---- normalizador de condominios (mismo que en Condominio.tsx) ---- */
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
/* ------------------------------------------------------------------- */

/* --------------------- normalizador de unidades --------------------- */
function coerceUnidad(x: unknown): Unidad | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as AnyObj;

  const id = typeof o["id"] === "number" ? o["id"] : null;
  if (id === null) return null;

  // condominio puede ser id numérico o un objeto
  let condominio: number = 0;
  const condRaw = o["condominio"];
  if (typeof condRaw === "number") condominio = condRaw;
  else if (typeof condRaw === "object" && condRaw !== null) {
    const cid = (condRaw as AnyObj)["id"];
    if (typeof cid === "number") condominio = cid;
  }

  const direccion = typeof o["direccion"] === "string" ? o["direccion"] : "";
  const code = typeof o["code"] === "string" ? o["code"] : "";
  const user = typeof o["user"] === "number" ? o["user"] : null;
  const piso = typeof o["piso"] === "number" ? o["piso"] : null;
  const manzano = typeof o["manzano"] === "string" ? o["manzano"] : null;

  return { id, condominio, direccion, code, user, piso, manzano };
}
function normalizeUnidades(data: unknown): Unidad[] {
  if (Array.isArray(data)) return data.map(coerceUnidad).filter((x): x is Unidad => x !== null);
  if (typeof data === "object" && data !== null) {
    const o = data as AnyObj;
    const arr: unknown[] = Array.isArray(o["results"])
      ? (o["results"] as unknown[])
      : Array.isArray(o["data"])
      ? (o["data"] as unknown[])
      : Array.isArray(o["items"])
      ? (o["items"] as unknown[])
      : [];
    return arr.map(coerceUnidad).filter((x): x is Unidad => x !== null);
  }
  return [];
}
/* ------------------------------------------------------------------- */

const UnidadPage: React.FC = () => {
  const [unidades, setUnidades] = useState<Unidad[]>(() => readCache<Unidad>(UNITS_CACHE));
  const [condominios, setCondominios] = useState<Condominio[]>(() => readCache<Condominio>(CONDOS_CACHE));

  const [form, setForm] = useState<CreateUnidadPayload>({
    condominio: 0, direccion: "", code: "", user: null, piso: null, manzano: null,
  });
  const [flash, setFlash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function loadCondominiosForSelect(): Promise<Condominio[]> {
    const qs = new URLSearchParams({ page_size: "1000", limit: "1000", ordering: "-id" });
    const raw = await fetchJson<unknown>(`/api/v1/condominios/?${qs.toString()}`);
    return normalizeCondominios(raw);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setFlash(null);
      try {
        const [uniRaw, conds] = await Promise.all([
          fetchJson<unknown>("/api/v1/unidades/"),
          loadCondominiosForSelect(),
        ]);
        const uni = normalizeUnidades(uniRaw);

        // merge con cache para no “perder” datos si el server devuelve vacío
        const mergedUnits = uni.length > 0 ? mergeById(unidades, uni) : unidades;
        const mergedConds = conds.length > 0 ? mergeById(condominios, conds) : condominios;

        setUnidades(mergedUnits);
        setCondominios(mergedConds);
        writeCache(UNITS_CACHE, mergedUnits);
        writeCache(CONDOS_CACHE, mergedConds);

        if (mergedConds.length > 0 && form.condominio === 0) {
          setForm((f) => ({ ...f, condominio: mergedConds[0].id }));
        }
      } catch (e: unknown) {
        setFlash(e instanceof Error ? e.message : "Error cargando");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const condSelected = useMemo(
    () => condominios.find((c) => c.id === Number(form.condominio)) ?? null,
    [condominios, form.condominio]
  );
  const isVertical = condSelected?.tipo === "vertical";

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: name === "condominio" ? Number(value) : value }));
  };

  const isValid =
    Number(form.condominio) > 0 &&
    form.direccion.trim().length >= 3 &&
    form.code.trim().length >= 1;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || creating) return;
    setCreating(true);
    setFlash(null);
    try {
      const payload: CreateUnidadPayload = {
        condominio: Number(form.condominio),
        direccion: form.direccion.trim(),
        code: form.code.trim(),
        user: form.user ?? null,
        piso: isVertical ? (form.piso !== null ? Number(form.piso) || null : null) : null,
        manzano: !isVertical ? (form.manzano ? String(form.manzano) : null) : null,
      };
      const nueva = await createUnidad(payload);
      const merged = mergeById([nueva], unidades);
      setUnidades(merged);
      writeCache(UNITS_CACHE, merged);
      setForm({
        condominio: condominios[0]?.id ?? 0, direccion: "", code: "", user: null, piso: null, manzano: null,
      });
      setFlash("Unidad creada");
    } catch (e: unknown) {
      setFlash(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  };

  // para mostrar nombre del condominio en la tabla
  const condNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of condominios) m.set(c.id, c.name);
    return m;
  }, [condominios]);

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Unidad</h2>
        <form className="module-form" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Condominio *</label>
            <select className="form-input" name="condominio" value={form.condominio} onChange={onChange}>
              <option value={0}>-- Selecciona --</option>
              {condominios.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tipo})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dirección *</label>
            <input className="form-input" name="direccion" value={form.direccion} onChange={onChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Código *</label>
            <input className="form-input" name="code" value={form.code} onChange={onChange} />
          </div>

          {isVertical ? (
            <div className="form-group">
              <label className="form-label">Piso</label>
              <input className="form-input" name="piso" type="number" value={form.piso ?? ""} onChange={onChange} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Manzano</label>
              <input className="form-input" name="manzano" value={form.manzano ?? ""} onChange={onChange} />
            </div>
          )}

          <button className="btn" type="submit" disabled={!isValid || creating}>
            {creating ? "Creando..." : "Crear"}
          </button>
        </form>
        {flash && <div style={{ marginBlockStart: 8 }}>{flash}</div>}
      </div>

      <div className="module-card">
        <h2>Unidades</h2>
        {loading && unidades.length === 0 ? (
          <p>Cargando...</p>
        ) : unidades.length === 0 ? (
          <p>No hay registros.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Condominio</th><th>Código</th><th>Dirección</th><th>Piso</th><th>Manzano</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u) => (
                <tr key={u.id}>
                  <td>{condNameById.get(u.condominio) ?? u.condominio}</td>
                  <td>{u.code}</td>
                  <td>{u.direccion}</td>
                  <td>{u.piso ?? "-"}</td>
                  <td>{u.manzano ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UnidadPage;
