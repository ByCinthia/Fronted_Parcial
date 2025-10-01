// src/pages/Usuarios/UsuarioPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { AppUser, CreateUserPayload } from "./types";
import {
  listarUsuarios,
  crearUsuario,
  actualizarFoto,
  eliminarUsuario,
  activarUsuario,
  desactivarUsuario,
} from "./service";
import "../../styles/dashboard.css";
import axios from "axios";

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
    groups: ["user"],
  });
  const [photoPreview, setPhotoPreview] = useState<string>();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [mensaje, setMensaje] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => setMensaje({ type: "error", text: "Error cargando usuarios" }));
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGroups = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setForm((prev) => ({
      ...prev,
      groups: value ? value.split(",").map((g) => g.trim()) : [" "],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const file = photoInputRef.current?.files?.[0];
    await crearUsuario({ ...form, is_active: true }, file);

    // recargar lista desde backend
    const lista = await listarUsuarios();
    setUsuarios(lista);

    // limpiar formulario
    setForm({
      username: "",
      password: "",
      ci: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      is_active: true,
      groups: ["user"],
    });
    setPhotoPreview(undefined);
    if (photoInputRef.current) photoInputRef.current.value = "";

    setMensaje({ type: "success", text: "Usuario creado correctamente" });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as Record<string, string[]>;
      const errores = Object.values(data).flat().join(" ");
      setMensaje({ type: "error", text: errores });
    } else if (error instanceof Error) {
      setMensaje({ type: "error", text: error.message });
    } else {
      setMensaje({ type: "error", text: "Error al crear usuario" });
    }
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
          <input className="form-input" name="username" value={form.username} onChange={handleChange} placeholder="Usuario *" required />
          <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Contraseña *" required />
          <input className="form-input" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Nombre" />
          <input className="form-input" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Apellido" />
          <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Correo" />
          <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" />
          <input className="form-input" name="ci" value={form.ci} onChange={handleChange} placeholder="CI" />
          <input className="form-input" name="group" value={form.groups.join(", ")} onChange={handleGroups} placeholder="Grupo" />

          <div className="form-group">
            <label className="form-label">Foto</label>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoPreview} />
            {photoPreview && <img src={photoPreview} alt="preview" style={{ width: 96, height: 96, borderRadius: 8, marginTop: 8 }} />}
          </div>
          <button className="btn" type="submit">Crear</button>
        </form>
      </div>

      {/* Listado Usuarios */}
      <div className="module-card">
        <h2>Usuarios</h2>

        {/* 🔎 Buscador */}
        <div className="form-group" style={{ marginBottom: 12 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Buscar por usuario, nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.photo_url ? (
                    <img src={u.photo_url} alt="foto" style={{ width: 48, height: 48, borderRadius: "50%" }} />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{u.username}</td>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.is_active ? "Activo" : "Inactivo"}</td>
                <td>
                  {u.is_active ? (
                    <button
                      className="btn ghost"
                      onClick={async () => {
                        const upd = await desactivarUsuario(u.id);
                        setUsuarios((prev) => prev.map((x) => (x.id === u.id ? upd : x)));
                        setMensaje({ type: "success", text: "Usuario desactivado" });
                      }}
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      className="btn"
                      onClick={async () => {
                        const upd = await activarUsuario(u.id);
                        setUsuarios((prev) => prev.map((x) => (x.id === u.id ? upd : x)));
                        setMensaje({ type: "success", text: "Usuario activado" });
                      }}
                    >
                      Activar
                    </button>
                  )}

                  {/* Cambiar foto */}
                  <label className="btn ghost">
                    Cambiar foto
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const upd = await actualizarFoto(u.id, file);
                          setUsuarios((prev) =>
                            prev.map((x) => (x.id === u.id ? upd : x))
                          );
                          setMensaje({ type: "success", text: "Foto actualizada" });
                        } catch {
                          setMensaje({ type: "error", text: "Error al actualizar foto" });
                        }
                      }}
                    />
                  </label>

                  <button
                    className="btn secondary"
                    onClick={async () => {
                      await eliminarUsuario(u.id);
                      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
                      setMensaje({ type: "success", text: "Usuario eliminado" });
                    }}
                  >
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
