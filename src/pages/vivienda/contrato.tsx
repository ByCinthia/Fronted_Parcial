// src/pages/Vivienda/Contrato.tsx
import React, { useEffect, useState } from "react";
import { Contrato, CreateContratoPayload, Unidad } from "./types";
import { createContrato, generarCargoContrato, generarCargosMes, fetchUnidades } from "./service";
import { fetchJson } from "../../shared/api";
import "../../styles/dashboard.css";

type User = { id: number; username: string };

const ContratoPage: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<CreateContratoPayload>({
    unidad: 0,
    duenno: null,
    inquilino: null,
    descripcion: "",
    start: "",
    end: "",
    monto_mensual: "",
  });

  const [periodoMes, setPeriodoMes] = useState<string>(""); // para generar cargos del mes (type="month")

  async function loadAll() {
    setLoading(true);
    setMsg(null);
    try {
      const [c, u, us] = await Promise.all([
        // listado directo (no lo pusimos en service.ts)
        fetchJson<Contrato[] | { results: Contrato[] }>("/api/v1/contratos/"),
        fetchUnidades(),
        fetchJson<User[] | { results: User[] }>("/api/v1/users/"),
      ]);
      setContratos(Array.isArray(c) ? c : c.results);
      setUnidades(u);
      setUsers(Array.isArray(us) ? us : us.results);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error cargando");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({
      ...s,
      [name]:
        name === "unidad" || name === "duenno" || name === "inquilino"
          ? (value ? Number(value) : null)
          : value,
    }));
  };

  const isValid = Number(form.unidad) > 0 && !!form.start;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || creating) return;
    setCreating(true);
    setMsg(null);
    try {
      const payload: CreateContratoPayload = {
        unidad: Number(form.unidad),
        duenno: form.duenno ? Number(form.duenno) : null,
        inquilino: form.inquilino ? Number(form.inquilino) : null,
        start: form.start,
        end: form.end || null,
        monto_mensual: form.monto_mensual ? String(form.monto_mensual) : undefined,
        descripcion: form.descripcion?.trim() || "",
      };
      const nuevo = await createContrato(payload);
      setContratos((prev) => [nuevo, ...prev]);
      setForm({ unidad: 0, duenno: null, inquilino: null, start: "", end: "", descripcion: "", monto_mensual: "" });
      setMsg("Contrato creado");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  };

  const genCargo = async (id: number, yyyymm: string) => {
    // yyyymm del input month => periodo "YYYY-MM-01"
    if (!yyyymm) return setMsg("Selecciona un mes");
    const periodo = `${yyyymm}-01`;
    try {
      const r = await generarCargoContrato(id, periodo);
      setMsg(r.ok ? `Cargo generado (contrato ${id})` : "Ya existía para ese periodo");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error al generar cargo");
    }
  };

  const genCargosMes = async (yyyymm: string) => {
    if (!yyyymm) return setMsg("Selecciona un mes");
    const periodo = `${yyyymm}-01`;
    try {
      const r = await generarCargosMes(periodo);
      setMsg(r.ok ? `Cargos del mes generados` : "Sin cambios");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error al generar cargos");
    }
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Crear Contrato</h2>
        <form className="module-form" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Unidad *</label>
            <select className="form-input" name="unidad" value={form.unidad || 0} onChange={onChange}>
              <option value={0}>-- Selecciona --</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>{u.code}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dueño</label>
            <select className="form-input" name="duenno" value={form.duenno ?? ""} onChange={onChange}>
              <option value="">-- (opcional) --</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Inquilino</label>
            <select className="form-input" name="inquilino" value={form.inquilino ?? ""} onChange={onChange}>
              <option value="">-- (opcional) --</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>

          <div className="form-group"><label className="form-label">Inicio *</label>
            <input className="form-input" type="date" name="start" value={form.start} onChange={onChange} />
          </div>
          <div className="form-group"><label className="form-label">Fin</label>
            <input className="form-input" type="date" name="end" value={form.end || ""} onChange={onChange} />
          </div>
          <div className="form-group"><label className="form-label">Monto mensual</label>
            <input className="form-input" name="monto_mensual" value={form.monto_mensual || ""} onChange={onChange} />
          </div>
          <div className="form-group"><label className="form-label">Descripción</label>
            <textarea className="form-input" name="descripcion" value={form.descripcion || ""} onChange={onChange} />
          </div>

          <button className="btn" type="submit" disabled={!isValid || creating}>
            {creating ? "Creando..." : "Crear"}
          </button>
        </form>
        {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      </div>

      <div className="module-card">
        <div className="module-card-header" style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Contratos</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="form-input"
              type="month"
              value={periodoMes}
              onChange={(e) => setPeriodoMes(e.target.value)}
              aria-label="Mes para generar cargos"
            />
            <button className="btn" onClick={() => void genCargosMes(periodoMes)}>Generar cargos del mes</button>
          </div>
        </div>

        {loading && contratos.length === 0 ? (
          <p>Cargando...</p>
        ) : contratos.length === 0 ? (
          <p>No hay registros.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Unidad</th><th>Dueño</th><th>Inquilino</th><th>Inicio</th><th>Monto</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.unidad}</td>
                  <td>{c.duenno ?? "-"}</td>
                  <td>{c.inquilino ?? "-"}</td>
                  <td>{c.start}</td>
                  <td>{c.monto_mensual ?? "-"}</td>
                  <td>
                    <button className="btn" onClick={() => void genCargo(c.id, periodoMes)} disabled={!periodoMes}>
                      Generar cargo
                    </button>
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

export default ContratoPage;
