import React, { useEffect, useState, useRef } from "react";
import { AppUser, CreateUserPayload } from "./types";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  actualizarFoto,
  eliminarUsuario,
} from "./service";
import "../../styles/dashboard.css";

const UsuarioPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<AppUser[]>([]);
  const [form, setForm] = useState<CreateUserPayload>({
    username: "",
    password: "",
    ci: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    is_active: true,
    groups: ["admin"],
  });
  const [photoPreview, setPhotoPreview] = useState<string>();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [mensaje, setMensaje] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => setMensaje({ type: "error", text: "Error cargando usuarios" }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nuevo = await crearUsuario(form);
      setUsuarios((prev) => [nuevo, ...prev]);
      setForm({
        username: "",
        password: "",
        ci: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        is_active: true,
        groups: ["admin"],
      });
      setPhotoPreview(undefined);
      if (photoInputRef.current) photoInputRef.current.value = "";
      setMensaje({ type: "success", text: "Usuario creado correctamente" });
    } catch {
      setMensaje({ type: "error", text: "Error al crear usuario" });
    }
  };

  const handlePhotoPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="module-container">
      {/* Crear Usuario */}
      <div className="module-card">
        <h2>Crear Usuario</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario *</label>
            <input
              className="form-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" name="first_name" value={form.first_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input className="form-input" name="last_name" value={form.last_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Correo</label>
            <input className="form-input" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Activo</label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Foto</label>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoPreview} />
            {photoPreview && (
              <img src={photoPreview} alt="preview" style={{ width: 96, height: 96, borderRadius: 8, marginTop: 8 }} />
            )}
          </div>
          <button className="btn" type="submit">Crear</button>
        </form>
      </div>

      {/* Listado Usuarios */}
      <div className="module-card">
        <h2>Usuarios</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.photo ? (
                    <img src={u.photo} alt="foto" style={{ width: 48, height: 48, borderRadius: "50%" }} />
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>{u.username}</td>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={u.is_active}
                    onChange={() => actualizarUsuario(u.id, { is_active: !u.is_active })
                      .then((upd) => setUsuarios((prev) => prev.map((x) => (x.id === u.id ? upd : x))))}
                  />
                </td>
                <td>
                  <label className="btn ghost">
                    Cambiar foto
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const upd = await actualizarFoto(u.id, file);
                        setUsuarios((prev) => prev.map((x) => (x.id === u.id ? upd : x)));
                      }}
                    />
                  </label>
                  <button className="btn secondary" onClick={() => eliminarUsuario(u.id).then(() => setUsuarios((prev) => prev.filter((x) => x.id !== u.id)))}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mensaje && (
        <div style={{ color: mensaje.type === "error" ? "red" : "green", marginTop: 8 }}>
          {mensaje.text}
        </div>
      )}
    </div>
  );
};

export default UsuarioPage;
