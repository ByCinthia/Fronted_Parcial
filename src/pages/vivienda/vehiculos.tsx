// src/pages/vivienda/vehiculos.tsx
import React, { useEffect, useState } from "react";
import type { Vehiculo } from "./types";
import * as svc from "./service";
import "./vivienda.css";

export default function VehiculosPage() {
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterTipo, setFilterTipo] = useState<"ALL" | "RESIDENTE" | "VISITANTE" | "SERVICIO">("ALL");
  const [q, setQ] = useState("");

  // form nuevo vehículo
  const [openForm, setOpenForm] = useState(false);
  const [fPlaca, setFPlaca] = useState("");
  const [fTipo, setFTipo] = useState<"RESIDENTE" | "VISITANTE" | "SERVICIO">("RESIDENTE");
  const [fVivienda, setFVivienda] = useState("");
  const [fMarca, setFMarca] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await svc.fetchVehiculos(); // Promise<Pagination<Vehiculo>> or Vehiculo[]
        const list: Vehiculo[] = Array.isArray((data as unknown) as Vehiculo[])
          ? ((data as unknown) as Vehiculo[])
          : (data?.results ?? []);

        if (!mounted) return;
        setItems(list);
      } catch (err) {
        // eslint-disable-next-line no-console
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
    if (filterTipo !== "ALL" && v.tipo !== filterTipo) return false;
    if (q && !(`${v.placa} ${v.marca ?? ""} ${v.vivienda_code ?? ""}`.toLowerCase().includes(q.toLowerCase())))
      return false;
    return true;
  });

  /* Crear vehículo */
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCreateError(null);

    if (!fPlaca.trim()) {
      setCreateError("La placa es obligatoria.");
      return;
    }
    if (!fVivienda.trim()) {
      setCreateError("El código de vivienda es obligatorio.");
      return;
    }

    setCreating(true);
    try {
      const payload: Partial<Vehiculo> = {
        placa: fPlaca.trim(),
        tipo: fTipo,
        vivienda_code: fVivienda.trim(),
        marca: fMarca.trim() || undefined,
      };

      // si tu service.createVehiculo existe lo usamos, si no emulamos
      let created: Vehiculo;
      if (typeof svc.createVehiculo === "function") {
        created = await svc.createVehiculo(payload);
      } else {
        created = {
          id: Date.now(),
          placa: payload.placa!,
          tipo: payload.tipo!,
          vivienda_code: payload.vivienda_code!,
          marca: payload.marca,
        } as Vehiculo;
      }

      setItems((s) => [created, ...s]);
      setFPlaca("");
      setFTipo("RESIDENTE");
      setFVivienda("");
      setFMarca("");
      setOpenForm(false);
    } catch (err) {
      // eslint-disable-next-line no-console
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
            placeholder="Buscar por placa, marca o vivienda"
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          />

          <select
            value={filterTipo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilterTipo(e.target.value as "ALL" | "RESIDENTE" | "VISITANTE" | "SERVICIO")
            }
            aria-label="Filtrar por tipo"
          >
            <option value="ALL">Todos</option>
            <option value="RESIDENTE">Residente</option>
            <option value="VISITANTE">Visitante</option>
            <option value="SERVICIO">Servicio</option>
          </select>

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFPlaca(e.target.value)}
              style={{ minWidth: 160 }}
            />

            {/* aquí casteamos desde el evento del select sin usar `any` */}
            <select
              value={fTipo}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFTipo(e.target.value as "RESIDENTE" | "VISITANTE" | "SERVICIO")
              }
            >
              <option value="RESIDENTE">Residente</option>
              <option value="VISITANTE">Visitante</option>
              <option value="SERVICIO">Servicio</option>
            </select>

            <input
              placeholder="Código vivienda *"
              value={fVivienda}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFVivienda(e.target.value)}
            />
            <input placeholder="Marca" value={fMarca} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFMarca(e.target.value)} />
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
                <th style={{ textAlign: "left", padding: 8 }}>Tipo</th>
                <th style={{ textAlign: "left", padding: 8 }}>Vivienda</th>
                <th style={{ textAlign: "left", padding: 8 }}>Marca</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                    No se encontraron vehículos.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: 8 }}>{v.placa}</td>
                    <td style={{ padding: 8 }}>{v.tipo}</td>
                    <td style={{ padding: 8 }}>{v.vivienda_code}</td>
                    <td style={{ padding: 8 }}>{v.marca}</td>
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
