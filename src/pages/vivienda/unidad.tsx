// src/pages/vivienda/unidad.tsx
import React, { useEffect, useState } from "react";
import type {
  Unidad,
  CreateUnidadPayload,
  AsignacionResidencia,
  CreateAsignacionResidenciaPayload,
} from "./types";
import * as svc from "./service";

export default function UnidadPage() {
  const [items, setItems] = useState<Unidad[]>([]);
  const [residencias, setResidencias] = useState<AsignacionResidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtros y orden
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"codigo" | "estado" | "asignado">("codigo");

  // form crear unidad
  const [openUnidadForm, setOpenUnidadForm] = useState(false);
  const [fCode, setFCode] = useState("");
  const [fActive, setFActive] = useState(true);
  const [creatingUnidad, setCreatingUnidad] = useState(false);
  const [unidadError, setUnidadError] = useState<string | null>(null);

  // form asignar residencia
  const [openResForm, setOpenResForm] = useState(false);
  const [fUser, setFUser] = useState<number | "">("");
  const [fUnidadId, setFUnidadId] = useState<number | "">("");
  const [fOwner, setFOwner] = useState(false);
  const [fTipoOcup, setFTipoOcup] = useState<"propietario" | "inquilino" | "otro">("propietario");
  const [fStatus, setFStatus] = useState<"activa" | "inactiva">("activa");
  const [fStart, setFStart] = useState("");
  const [creatingRes, setCreatingRes] = useState(false);
  const [resError, setResError] = useState<string | null>(null);

  // cargar datos
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await svc.fetchUnidades();
        if (mounted) setItems(list);

        if (typeof svc.fetchResidencias === "function") {
          const listRes: AsignacionResidencia[] = await svc.fetchResidencias();
          if (mounted) setResidencias(listRes);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
          setItems([]);
          setResidencias([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // crear unidad
  async function handleCreateUnidad(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setUnidadError(null);

    if (!fCode.trim()) {
      setUnidadError("El código es obligatorio.");
      return;
    }

    const payload: CreateUnidadPayload = {
      code: fCode.trim(),
      is_active: fActive,
    };

    setCreatingUnidad(true);
    try {
      const created = await svc.createUnidad(payload);
      setItems((s) => [created, ...s]);
      setFCode("");
      setFActive(true);
      setOpenUnidadForm(false);
    } catch (err) {
      setUnidadError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreatingUnidad(false);
    }
  }

  // asignar residencia
  async function handleCreateRes(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setResError(null);

    if (!fUser || !fUnidadId || !fStart.trim()) {
      setResError("Usuario, unidad y fecha de inicio son obligatorios.");
      return;
    }

    const payload: CreateAsignacionResidenciaPayload = {
      user: Number(fUser),
      unidad: Number(fUnidadId),
      is_owner: fOwner,
      tipo_ocupacion: fTipoOcup,
      status: fStatus,
      start: fStart,
    };

    setCreatingRes(true);
    try {
      const created = await svc.createAsignacionResidencia(payload);
      setResidencias((s) => [created, ...s]);
      setFUser("");
      setFUnidadId("");
      setFOwner(false);
      setFTipoOcup("propietario");
      setFStatus("activa");
      setFStart("");
      setOpenResForm(false);
    } catch (err) {
      setResError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreatingRes(false);
    }
  }

  // procesar datos
  const data = items
    .map((u) => {
      const asignacion = residencias.find((r) => r.unidad === u.id);
      return { ...u, asignacion };
    })
    .filter((u) => u.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (orderBy === "codigo") return a.code.localeCompare(b.code);
      if (orderBy === "estado") return Number(b.is_active) - Number(a.is_active);
      if (orderBy === "asignado") return (b.asignacion ? 1 : 0) - (a.asignacion ? 1 : 0);
      return 0;
    });

  return (
    <div className="module-container">
      <div className="breadcrumbs">Vivienda / Unidades</div>

      {/* crear unidad */}
      <div className="module-card">
        <div className="card-header">
          <h2 className="card-title">Unidades</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Buscar por código"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={orderBy}
              onChange={(e) =>
                setOrderBy(e.target.value as "codigo" | "estado" | "asignado")
              }
            >
              <option value="codigo">Ordenar por Código</option>
              <option value="estado">Ordenar por Estado</option>
              <option value="asignado">Ordenar por Asignado</option>
            </select>
            <button className="btn" onClick={() => setOpenUnidadForm((s) => !s)}>
              {openUnidadForm ? "Cancelar" : "Nueva unidad"}
            </button>
          </div>
        </div>

        {openUnidadForm && (
          <form className="module-form" onSubmit={handleCreateUnidad}>
            <input
              placeholder="Código ej: A-101"
              value={fCode}
              onChange={(e) => setFCode(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={fActive}
                onChange={(e) => setFActive(e.target.checked)}
              />{" "}
              Activa
            </label>
            <button className="btn" type="submit" disabled={creatingUnidad}>
              {creatingUnidad ? "Creando..." : "Registrar"}
            </button>
            {unidadError && <div style={{ color: "red" }}>{unidadError}</div>}
          </form>
        )}

        {/* tabla unidades */}
        {loading ? (
          <div>Cargando unidades...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Estado</th>
                <th>Asignado</th>
                <th>Residente</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    No hay unidades registradas.
                  </td>
                </tr>
              ) : (
                data.map((u) => (
                  <tr key={u.id}>
                    <td>{u.code}</td>
                    <td>{u.is_active ? "Activa" : "Inactiva"}</td>
                    <td>{u.asignacion ? "Sí" : "No"}</td>
                    <td>
                      {u.asignacion
                        ? `${u.asignacion.user} (${u.asignacion.tipo_ocupacion})`
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* asignar residencia */}
      <div className="module-card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Asignar residencia</h2>
          <button className="btn" onClick={() => setOpenResForm((s) => !s)}>
            {openResForm ? "Cancelar" : "Asignar"}
          </button>
        </div>

        {openResForm && (
          <form className="module-form" onSubmit={handleCreateRes}>
            <input
              placeholder="Usuario (id)"
              value={fUser}
              onChange={(e) => setFUser(Number(e.target.value) || "")}
            />
            <input
              placeholder="Unidad (id)"
              value={fUnidadId}
              onChange={(e) => setFUnidadId(Number(e.target.value) || "")}
            />
            <label>
              <input
                type="checkbox"
                checked={fOwner}
                onChange={(e) => setFOwner(e.target.checked)}
              />{" "}
              Es dueño
            </label>
            <select
              value={fTipoOcup}
              onChange={(e) =>
                setFTipoOcup(
                  e.target.value as "propietario" | "inquilino" | "otro"
                )
              }
            >
              <option value="propietario">Propietario</option>
              <option value="inquilino">Inquilino</option>
              <option value="otro">Otro</option>
            </select>
            <select
              value={fStatus}
              onChange={(e) =>
                setFStatus(e.target.value as "activa" | "inactiva")
              }
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </select>
            <input
              type="date"
              value={fStart}
              onChange={(e) => setFStart(e.target.value)}
            />
            <button className="btn" type="submit" disabled={creatingRes}>
              {creatingRes ? "Asignando..." : "Asignar"}
            </button>
            {resError && <div style={{ color: "red" }}>{resError}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
