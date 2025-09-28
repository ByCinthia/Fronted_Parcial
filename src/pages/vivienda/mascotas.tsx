// src/pages/vivienda/mascotas.tsx
import React, { useEffect, useState } from "react";
import type { Mascota, CreateMascotaPayload } from "./types";
import * as svc from "./service";

export default function MascotasPage() {
  const [items, setItems] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulario
  const [openForm, setOpenForm] = useState(false);
  const [fUnidad, setFUnidad] = useState<number | "">("");
  const [fResponsable, setFResponsable] = useState<number | "">("");
  const [fNombre, setFNombre] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fRaza, setFRaza] = useState("");
  const [fActivo, setFActivo] = useState(true);
  const [fDesde, setFDesde] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await svc.fetchMascotas();
        if (mounted) setItems(list);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  /* Crear mascota */
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCreateError(null);

    if (!fNombre.trim()) {
      setCreateError("El nombre es obligatorio.");
      return;
    }
    if (!fUnidad || !fResponsable) {
      setCreateError("Unidad y Responsable son obligatorios.");
      return;
    }
    if (!fTipo.trim()) {
      setCreateError("El tipo (perro, gato, etc.) es obligatorio.");
      return;
    }
    if (!fDesde.trim()) {
      setCreateError("La fecha de inicio es obligatoria.");
      return;
    }

    const payload: CreateMascotaPayload = {
      unidad: Number(fUnidad),
      responsable: Number(fResponsable),
      nombre: fNombre.trim(),
      tipo: fTipo.trim(),
      raza: fRaza.trim() || undefined,
      activo: fActivo,
      desde: fDesde,
    };

    setCreating(true);
    try {
      let created: Mascota;
      if (typeof svc.createMascota === "function") {
        created = await svc.createMascota(payload);
      } else {
        created = { id: Date.now(), ...payload } as Mascota; // fallback mock
      }
      setItems((s) => [created, ...s]);

      // reset form
      setFUnidad("");
      setFResponsable("");
      setFNombre("");
      setFTipo("");
      setFRaza("");
      setFActivo(true);
      setFDesde("");
      setOpenForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Mascotas</h2>
        <button className="btn" onClick={() => setOpenForm((s) => !s)}>
          {openForm ? "Cancelar" : "Registrar mascota"}
        </button>
      </div>

      {openForm && (
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: 12, padding: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <input placeholder="Unidad *" value={fUnidad} onChange={(e) => setFUnidad(Number(e.target.value))} />
            <input placeholder="Responsable *" value={fResponsable} onChange={(e) => setFResponsable(Number(e.target.value))} />
            <input placeholder="Nombre *" value={fNombre} onChange={(e) => setFNombre(e.target.value)} />
            <input placeholder="Tipo (ej. perro)" value={fTipo} onChange={(e) => setFTipo(e.target.value)} />
            <input placeholder="Raza" value={fRaza} onChange={(e) => setFRaza(e.target.value)} />
            <label>
              <input type="checkbox" checked={fActivo} onChange={(e) => setFActivo(e.target.checked)} /> Activo
            </label>
            <input type="date" value={fDesde} onChange={(e) => setFDesde(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button className="btn secondary" type="button" onClick={() => setOpenForm(false)}>Cancelar</button>
            <button className="btn" type="submit" disabled={creating} style={{ marginLeft: 8 }}>
              {creating ? "Registrando..." : "Registrar"}
            </button>
          </div>
          {createError && <div style={{ color: "red", marginTop: 8 }}>{createError}</div>}
        </form>
      )}

      {loading ? (
        <div>Cargando mascotas...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div className="grid" style={{ gap: 8 }}>
          {items.length === 0 && <div className="text-muted">No hay mascotas registradas.</div>}
          {items.map((m) => (
            <div className="card" key={m.id}>
              <strong>{m.nombre}</strong> <span className="badge">{m.tipo}</span>
              <div className="text-muted">
                Raza: {m.raza ?? "-"} · Unidad: {m.unidad} · Responsable: {m.responsable}
              </div>
              <div className="text-muted">
                Activo: {m.activo ? "Sí" : "No"} · Desde: {m.desde}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
