// src/pages/vivienda/vehiculos.tsx
import React, { useEffect, useState } from "react";
import type { Vehiculo, CreateVehiculoPayload } from "./types";
import * as svc from "./service";
import "./vivienda.css";

export default function VehiculosPage(){
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form nuevo vehículo (coincide con CreateVehiculoPayload)
  const [openForm, setOpenForm] = useState(false);
  const [fUnidad, setFUnidad] = useState<number | "">("");
  const [fResponsable, setFResponsable] = useState<number | "">("");
  const [fPlaca, setFPlaca] = useState("");
  const [fMarca, setFMarca] = useState("");
  const [fColor, setFColor] = useState("");
  const [fObservacion, setFObservacion] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [q, setQ] = useState(""); // búsqueda simple por placa/marca/unidad

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await svc.fetchVehiculos();
        if (!mounted) return;
        setItems(list);
      } catch (err) {
 
        console.error("fetchVehiculos error:", err);
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = items.filter((v) => {
    if (!q) return true;
    const target = `${v.placa} ${v.marca ?? ""} ${v.unidad}`.toLowerCase();
    return target.includes(q.toLowerCase());
  });

  /* Crear vehículo */
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCreateError(null);

    // validaciones básicas
    if (!fPlaca.trim()) {
      setCreateError("La placa es obligatoria.");
      return;
    }
    if (fUnidad === "" || Number.isNaN(Number(fUnidad))) {
      setCreateError("La unidad es obligatoria (número).");
      return;
    }
    if (fResponsable === "" || Number.isNaN(Number(fResponsable))) {
      setCreateError("El responsable es obligatorio (id numérico).");
      return;
    }

    const payload: CreateVehiculoPayload = {
      unidad: Number(fUnidad),
      responsable: Number(fResponsable),
      placa: fPlaca.trim(),
      marca: fMarca.trim() || undefined,
      color: fColor.trim() || undefined,
      observacion: fObservacion.trim() || undefined,
    };

    setCreating(true);
    try {
      let created: Vehiculo;
      if (typeof svc.createVehiculo === "function") {
        created = await svc.createVehiculo(payload);
      } else {
        // fallback local (dev)
        created = {
          id: Date.now(),
          ...payload,
        } as Vehiculo;
      }

      setItems((s) => [created, ...s]);
      // limpiar form
      setFUnidad("");
      setFResponsable("");
      setFPlaca("");
      setFMarca("");
      setFColor("");
      setFObservacion("");
      setOpenForm(false);
    } catch (err) {

      console.error("createVehiculo error:", err);
      setCreateError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="vivienda-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div className="breadcrumbs">Vivienda / Vehículos</div>
          <h2>Vehículos</h2>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="search-input"
            placeholder="Buscar por placa, marca o unidad"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" type="button" onClick={() => setOpenForm((s) => !s)}>
            {openForm ? "Cancelar" : "Nuevo vehículo"}
          </button>
        </div>
      </div>

      {openForm && (
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              placeholder="Placa *"
              value={fPlaca}
              onChange={(e) => setFPlaca(e.target.value)}
              style={{ minWidth: 160 }}
            />

            <input
              placeholder="Unidad (número) *"
              value={fUnidad}
              onChange={(e) => {
                const v = e.target.value;
                setFUnidad(v === "" ? "" : Number(v));
              }}
              style={{ width: 120 }}
            />

            <input
              placeholder="Responsable (id) *"
              value={fResponsable}
              onChange={(e) => {
                const v = e.target.value;
                setFResponsable(v === "" ? "" : Number(v));
              }}
              style={{ width: 140 }}
            />

            <input placeholder="Marca" value={fMarca} onChange={(e) => setFMarca(e.target.value)} />
            <input placeholder="Color" value={fColor} onChange={(e) => setFColor(e.target.value)} />
            <input placeholder="Observación" value={fObservacion} onChange={(e) => setFObservacion(e.target.value)} />

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn secondary" type="button" onClick={() => setOpenForm(false)}>
                Cancelar
              </button>
              <button className="btn" type="submit" disabled={creating}>
                {creating ? "Registrando..." : "Registrar"}
              </button>
            </div>
          </div>

          {createError && <div style={{ color: "red", marginTop: 8 }}>{createError}</div>}
        </form>
      )}

      {loading ? (
        <div className="loading">Cargando vehículos...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div className="card">
          <table className="table" role="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Placa</th>
                <th style={{ textAlign: "left", padding: 8 }}>Unidad</th>
                <th style={{ textAlign: "left", padding: 8 }}>Responsable</th>
                <th style={{ textAlign: "left", padding: 8 }}>Marca</th>
                <th style={{ textAlign: "left", padding: 8 }}>Color</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                    No se encontraron vehículos.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: 8 }}>{v.placa}</td>
                    <td style={{ padding: 8 }}>{v.unidad}</td>
                    <td style={{ padding: 8 }}>{v.responsable}</td>
                    <td style={{ padding: 8 }}>{v.marca ?? "-"}</td>
                    <td style={{ padding: 8 }}>{v.color ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="list-footer" style={{ marginTop: 12 }}>
            {items.length} vehículo(s) en el sistema.
          </div>
        </div>
      )}
    </div>
  );
}
