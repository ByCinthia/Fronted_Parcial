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
    <div className="module-container">
      <div className="breadcrumbs">Vivienda / Mascotas</div>
      <div className="module-card">
        <div className="card-header">
          <h2 className="card-title">Mascotas</h2>
          <button className="btn" onClick={() => setOpenForm((s) => !s)}>
            {openForm ? "Cancelar" : "Registrar mascota"}
          </button>
        </div>

        {openForm && (
          <form className="module-form" onSubmit={handleCreate}>
            <input placeholder="Unidad *" value={fUnidad} onChange={(e) => setFUnidad(Number(e.target.value) || "")} />
            <input placeholder="Responsable *" value={fResponsable} onChange={(e) => setFResponsable(Number(e.target.value) || "")} />
            <input placeholder="Nombre *" value={fNombre} onChange={(e) => setFNombre(e.target.value)} />
            <input placeholder="Tipo (ej. perro)" value={fTipo} onChange={(e) => setFTipo(e.target.value)} />
            <input placeholder="Raza" value={fRaza} onChange={(e) => setFRaza(e.target.value)} />
            <label>
              <input type="checkbox" checked={fActivo} onChange={(e) => setFActivo(e.target.checked)} /> Activo
            </label>
            <input type="date" value={fDesde} onChange={(e) => setFDesde(e.target.value)} />

            <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 12 }}>
              <button className="btn ghost" type="button" onClick={() => setOpenForm(false)}>Cancelar</button>
              <button className="btn" type="submit" disabled={creating}>
                {creating ? "Registrando..." : "Registrar"}
              </button>
            </div>
            {createError && <div style={{ color: "red", marginTop: 8 }}>{createError}</div>}
          </form>
        )}
      </div>

      {loading ? (
        <div>Cargando mascotas...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div className="grid cols-2">
          {items.length === 0 && <div className="text-muted">No hay mascotas registradas.</div>}
          {items.map((m) => (
            <div className="module-card" key={m.id}>
              <h3>{m.nombre} <span className="badge">{m.tipo}</span></h3>
              <div className="text-muted">Raza: {m.raza ?? "-"} · Unidad: {m.unidad} · Responsable: {m.responsable}</div>
              <div className="text-muted">Activo: {m.activo ? "Sí" : "No"} · Desde: {m.desde}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
