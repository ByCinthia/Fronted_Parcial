// src/pages/vivienda/vehiculos.tsx
import React, { useEffect, useState } from "react";
import type { Vehiculo, CreateVehiculoPayload } from "./types";
import * as svc from "./service";


export default function VehiculosPage() {
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form crear
  const [openForm, setOpenForm] = useState(false);
  const [fUnidad, setFUnidad] = useState<number | "">("");
  const [fResponsable, setFResponsable] = useState<number | "">("");
  const [fPlaca, setFPlaca] = useState("");
  const [fMarca, setFMarca] = useState("");
  const [fColor, setFColor] = useState("");
  const [fObservacion, setFObservacion] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // edición
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Vehiculo>>({});
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  // cargar lista
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
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = items.filter((v) => {
    if (!q) return true;
    const target = `${v.placa} ${v.marca ?? ""} ${v.unidad}`.toLowerCase();
    return target.includes(q.toLowerCase());
  });

  /* Crear */
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCreateError(null);

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
        created = { id: Date.now(), ...payload } as Vehiculo;
      }
      setItems((s) => [created, ...s]);
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

  /* Editar */
  function startEdit(v: Vehiculo) {
    setEditId(v.id);
    setEditData({ ...v });
    setUpdateError(null);
  }

  async function handleUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editId) return;

    setUpdating(true);
    setUpdateError(null);
    try {
      let updated: Vehiculo;
      if (typeof svc.updateVehiculo === "function") {
       updated = await svc.updateVehiculo(editId, editData);
           }

      setItems((s) => s.map((x) => (x.id === editId ? updated : x)));
      setEditId(null);
      setEditData({});
    } catch (err) {
      console.error("updateVehiculo error:", err);
      setUpdateError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(false);
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

      {/* crear */}
      {openForm && (
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Placa *" value={fPlaca} onChange={(e) => setFPlaca(e.target.value)} />
            <input placeholder="Unidad *" value={fUnidad} onChange={(e) => setFUnidad(Number(e.target.value) || "")} />
            <input placeholder="Responsable *" value={fResponsable} onChange={(e) => setFResponsable(Number(e.target.value) || "")} />
            <input placeholder="Marca" value={fMarca} onChange={(e) => setFMarca(e.target.value)} />
            <input placeholder="Color" value={fColor} onChange={(e) => setFColor(e.target.value)} />
            <input placeholder="Observación" value={fObservacion} onChange={(e) => setFObservacion(e.target.value)} />
            <button className="btn" type="submit" disabled={creating}>
              {creating ? "Registrando..." : "Registrar"}
            </button>
          </div>
          {createError && <div style={{ color: "red" }}>{createError}</div>}
        </form>
      )}

      {/* tabla */}
      {loading ? (
        <div className="loading">Cargando vehículos...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Unidad</th>
                <th>Responsable</th>
                <th>Marca</th>
                <th>Color</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No se encontraron vehículos.
                  </td>
                </tr>
              ) : (
                filtered.map((v) =>
                  editId === v.id ? (
                    <tr key={v.id}>
                      <td><input value={editData.placa || ""} onChange={(e) => setEditData({ ...editData, placa: e.target.value })} /></td>
                      <td><input value={editData.unidad || ""} onChange={(e) => setEditData({ ...editData, unidad: Number(e.target.value) || 0 })} /></td>
                      <td><input value={editData.responsable || ""} onChange={(e) => setEditData({ ...editData, responsable: Number(e.target.value) || 0 })} /></td>
                      <td><input value={editData.marca || ""} onChange={(e) => setEditData({ ...editData, marca: e.target.value })} /></td>
                      <td><input value={editData.color || ""} onChange={(e) => setEditData({ ...editData, color: e.target.value })} /></td>
                      <td>
                        <button className="btn" onClick={handleUpdate} disabled={updating}>Guardar</button>
                        <button className="btn secondary" onClick={() => setEditId(null)}>Cancelar</button>
                        {updateError && <div style={{ color: "red" }}>{updateError}</div>}
                      </td>
                    </tr>
                  ) : (
                    <tr key={v.id}>
                      <td>{v.placa}</td>
                      <td>{v.unidad}</td>
                      <td>{v.responsable}</td>
                      <td>{v.marca ?? "-"}</td>
                      <td>{v.color ?? "-"}</td>
                      <td>
                        <button className="btn secondary" onClick={() => startEdit(v)}>Editar</button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
          <div className="list-footer">{items.length} vehículo(s) en el sistema.</div>
        </div>
      )}
    </div>
  );
}
