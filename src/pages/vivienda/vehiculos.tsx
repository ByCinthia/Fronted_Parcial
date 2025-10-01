// src/pages/Vivienda/Vehiculo.tsx
import React, { useEffect, useState } from "react";
import { Vehiculo, CreateVehiculoPayload } from "./types";
import { fetchVehiculos, createVehiculo, fetchUnidades } from "./service";
import { fetchJson } from "../../shared/api";
import "../../styles/dashboard.css";

type User = { id: number; username: string };

const VehiculoPage: React.FC = () => {
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [unidades, setUnidades] = useState<{ id: number; code: string }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<CreateVehiculoPayload>({
    unidad: 0,
    responsable: null,
    placa: "",
    marca: "",
    color: "",
    observacion: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);
      try {
        const [v, u, us] = await Promise.all([
          fetchVehiculos(),
          fetchUnidades(),
          fetchJson<{ results: User[] } | User[]>("/api/v1/users/"),
        ]);
        setItems(v);
        setUnidades(u.map((x) => ({ id: x.id, code: x.code })));
        setUsers(Array.isArray(us) ? us : us.results);
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : "Error cargando");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: name === "unidad" ? Number(value) : value }));
  };

  const isValid = Number(form.unidad) > 0 && form.placa.trim().length >= 3;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || creating) return;
    setCreating(true);
    setMsg(null);
    try {
      const payload: CreateVehiculoPayload = {
        unidad: Number(form.unidad),
        responsable: form.responsable ? Number(form.responsable) : null,
        placa: form.placa.trim(),
        marca: form.marca?.trim() || "",
        color: form.color?.trim() || "",
        observacion: form.observacion?.trim() || "",
      };
      const nuevo = await createVehiculo(payload);
      setItems((prev) => [nuevo, ...prev]);
      setForm({ unidad: 0, responsable: null, placa: "", marca: "", color: "", observacion: "" });
      setMsg("Vehículo registrado");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error al registrar");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Registrar Vehículo</h2>
        <form className="module-form" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Unidad *</label>
            <select className="form-input" name="unidad" value={form.unidad} onChange={onChange}>
              <option value={0}>-- Selecciona --</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>{u.code}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Responsable</label>
            <select className="form-input" name="responsable" value={form.responsable ?? ""} onChange={onChange}>
              <option value="">-- (opcional) --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Placa *</label>
            <input className="form-input" name="placa" value={form.placa} onChange={onChange} />
          </div>
          <div className="form-group"><label className="form-label">Marca</label>
            <input className="form-input" name="marca" value={form.marca} onChange={onChange} />
          </div>
          <div className="form-group"><label className="form-label">Color</label>
            <input className="form-input" name="color" value={form.color} onChange={onChange} />
          </div>
          <div className="form-group"><label className="form-label">Observación</label>
            <textarea className="form-input" name="observacion" value={form.observacion} onChange={onChange} />
          </div>
          <button className="btn" type="submit" disabled={!isValid || creating}>
            {creating ? "Guardando..." : "Registrar"}
          </button>
        </form>
        {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      </div>

      <div className="module-card">
        <h2>Vehículos</h2>
        {loading && items.length === 0 ? (
          <p>Cargando...</p>
        ) : items.length === 0 ? (
          <p>No hay registros.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Unidad</th><th>Placa</th><th>Marca</th><th>Color</th><th>Responsable</th></tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td>{v.unidad}</td><td>{v.placa}</td><td>{v.marca || "-"}</td><td>{v.color || "-"}</td>
                  <td>{v.responsable ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VehiculoPage;
