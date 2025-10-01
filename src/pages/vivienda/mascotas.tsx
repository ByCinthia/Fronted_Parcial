// src/pages/Vivienda/Mascotas.tsx
import React, { useEffect, useState } from "react";
import { Mascota, CreateMascotaPayload } from "./types";
import { fetchMascotas, createMascota } from "./service";
import { fetchJson } from "../../shared/api";
import "../../styles/dashboard.css";

type User = { id: number; username: string };

const MascotasPage: React.FC = () => {
  const [items, setItems] = useState<Mascota[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<CreateMascotaPayload>({
    name: "",
    tipo: "perro",
    raza: "",
    desde: "",
    hasta: "",
    responsable: null,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);
      try {
        const [m, u] = await Promise.all([
          fetchMascotas(),
          fetchJson<{ results: User[] } | User[]>("/api/v1/users/"),
        ]);
        setItems(m);
        setUsers(Array.isArray(u) ? u : u.results);
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : "Error cargando");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const isValid = form.name.trim().length >= 2 && form.tipo.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || creating) return;
    setCreating(true);
    setMsg(null);
    try {
      const payload: CreateMascotaPayload = {
        name: form.name.trim(),
        tipo: form.tipo,
        raza: form.raza?.trim() || "",
        desde: form.desde || null,
        hasta: form.hasta || null,
        responsable: form.responsable ? Number(form.responsable) : null,
      };
      const nuevo = await createMascota(payload);
      setItems((prev) => [nuevo, ...prev]);
      setForm({ name: "", tipo: "perro", raza: "", desde: "", hasta: "", responsable: null });
      setMsg("Mascota registrada");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error al registrar");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Registrar Mascota</h2>
        <form className="module-form" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-input" name="name" value={form.name} onChange={onChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo *</label>
            <select className="form-input" name="tipo" value={form.tipo} onChange={onChange}>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="pez">Pez</option>
              <option value="hamster">Hámster</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Raza</label>
            <input className="form-input" name="raza" value={form.raza || ""} onChange={onChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Desde</label>
            <input className="form-input" type="date" name="desde" value={form.desde || ""} onChange={onChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Hasta</label>
            <input className="form-input" type="date" name="hasta" value={form.hasta || ""} onChange={onChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Responsable</label>
            <select className="form-input" name="responsable" value={form.responsable ?? ""} onChange={onChange}>
              <option value="">-- (opcional) --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit" disabled={!isValid || creating}>
            {creating ? "Guardando..." : "Registrar"}
          </button>
        </form>
        {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      </div>

      <div className="module-card">
        <h2>Mascotas</h2>
        {loading && items.length === 0 ? (
          <p>Cargando...</p>
        ) : items.length === 0 ? (
          <p>No hay registros.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th>Tipo</th><th>Raza</th><th>Responsable</th><th>Desde</th><th>Hasta</th></tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.tipo}</td>
                  <td>{m.raza || "-"}</td>
                  <td>{m.responsable ?? "-"}</td>
                  <td>{m.desde ?? "-"}</td>
                  <td>{m.hasta ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MascotasPage;
