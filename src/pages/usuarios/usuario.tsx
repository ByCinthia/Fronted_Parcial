// src/pages/usuarios/Usuario.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../shared/auth";
import "../../styles/dashboard.css"; // usa tu css global o crea uno propio

/** Tipo de usuario según estructura que diste */
export interface AppUser {
  id: number;
  username: string;
  password?: string; // no ideal almacenar en claro; es mock
  ci?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  groups: string[];
  photo?: string; // base64 data URL (mock)
}

/** key de localStorage para persistir el mock */
const LS_KEY = "mock_users_v1";

/** helpers */
async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Error leyendo archivo"));
    fr.readAsDataURL(file);
  });
}

function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

/** Componente principal (crea + lista) */
const UsuarioPage: React.FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const meId = auth.user?.id ? Number(auth.user.id) : null;

  // decide vista según ruta
  const rel = location.pathname.replace(/^\/app\/?/, "");
  const isCreateRoute = rel.endsWith("usuarios/crear");
  const isListRoute = rel === "usuarios" || rel.startsWith("usuarios/list");

  // lista de usuarios (mock persistido)
  const [users, setUsers] = useState<AppUser[]>(() => loadUsers());

  // formulario new user
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ci, setCi] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [groups, setGroups] = useState<string>("admin");
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  // crear usuario (mock)
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim()) {
      setError("El campo username es obligatorio.");
      return;
    }
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const newUser: AppUser = {
      id: Date.now(),
      username: username.trim(),
      password: password,
      ci: ci.trim() || undefined,
      first_name: firstName.trim() || undefined,
      last_name: lastName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      is_active: !!isActive,
      groups: groups ? groups.split(",").map(s => s.trim()).filter(Boolean) : [],
      photo: photoPreview,
    };

    setUsers((s) => [newUser, ...s]);
    setSuccess("Usuario creado (mock) correctamente.");
    // reset form
    setUsername("");
    setPassword("");
    setCi("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setIsActive(true);
    setGroups("admin");
    setPhotoPreview(undefined);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  // subir foto desde input
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const dataUrl = await fileToDataUrl(f);
      setPhotoPreview(dataUrl);
    } catch {
      setError("No se pudo leer la imagen.");
    }
  }

  // actualizar foto para un usuario existente
  async function updatePhotoForUser(userId: number, file?: File) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setUsers((prev) => prev.map(u => (u.id === userId ? { ...u, photo: dataUrl } : u)));
    } catch {
      setError("Error actualizando foto.");
    }
  }

  // eliminar usuario (mock)
  function deleteUser(id: number) {
    if (!confirm("¿Eliminar usuario? (solo mock)")) return;
    setUsers((s) => s.filter(u => u.id !== id));
  }

  // pequeñas utilidades
  const loggedUsersCount = users.filter(u => u.is_active).length;
  const [filterQ, setFilterQ] = useState("");

  const filtered = users.filter(u => {
    const q = filterQ.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.username ?? "").toLowerCase().includes(q) ||
      (u.first_name ?? "").toLowerCase().includes(q) ||
      (u.last_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.ci ?? "").toLowerCase().includes(q)
    );
  });

  // --- Renderizado condicional ---
  return (
    <div>
      <div className="breadcrumbs">Usuarios</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2>{isCreateRoute ? "Crear Usuario" : "Usuarios"}</h2>

        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Buscar usuarios..." value={filterQ} onChange={(e) => setFilterQ(e.target.value)} />
        </div>
      </div>

      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}

      {isCreateRoute ? (
        // Vista formulario
        <form className="card" onSubmit={handleCreate}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input placeholder="username *" value={username} onChange={(e) => setUsername(e.target.value)} style={{ minWidth: 180 }} />
              <input placeholder="password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ minWidth: 180 }} />
              <input placeholder="CI" value={ci} onChange={(e) => setCi(e.target.value)} />
              <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Activo
              </label>

              <input placeholder="groups (csv) e.g. admin,user" value={groups} onChange={(e) => setGroups(e.target.value)} />

              <div>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} />
                {photoPreview && (
                  <div style={{ marginTop: 8 }}>
                    <img src={photoPreview} alt="preview" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8 }} />
                  </div>
                )}
              </div>

              <div style={{ marginLeft: "auto" }}>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                    setCi("");
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPhone("");
                    setIsActive(true);
                    setGroups("admin");
                    setPhotoPreview(undefined);
                    if (photoInputRef.current) photoInputRef.current.value = "";
                  }}
                >
                  Cancelar
                </button>
                <button className="btn" type="submit" style={{ marginLeft: 8 }}>
                  Crear
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : isListRoute ? (
        // Vista listado
        <>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Total:</strong> {users.length} &nbsp; <strong>Activos:</strong> {loggedUsersCount} &nbsp;{" "}
                <strong>Con sesión (mock):</strong> {meId ? 1 : 0}
              </div>
              <div>
                <a className="btn" href="/app/usuarios/crear">
                  Crear usuario
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {filtered.map((u) => (
              <div key={u.id} className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 88 }}>
                  {u.photo ? (
                    <img src={u.photo} alt="foto" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        background: "#eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {u.first_name?.charAt(0) ?? u.username.charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {u.username} {u.id === meId && <span style={{ color: "#6b21a8", marginLeft: 8 }}>(sesión)</span>}
                      </div>
                      <div className="text-muted">
                        {u.first_name} {u.last_name} · {u.email} · CI: {u.ci}
                      </div>
                      <div className="text-muted">Groups: {u.groups.join(", ")}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        Activo{" "}
                        <input
                          type="checkbox"
                          checked={u.is_active}
                          onChange={() =>
                            setUsers((prev) =>
                              prev.map((x) => (x.id === u.id ? { ...x, is_active: !x.is_active } : x))
                            )
                          }
                        />
                      </label>

                      {/* actualizar foto */}
                      <label
                        style={{
                          cursor: "pointer",
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "#f3f4f6",
                        }}
                      >
                        Subir foto
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            await updatePhotoForUser(u.id, file);
                          }}
                        />
                      </label>

                      <button className="btn secondary" onClick={() => deleteUser(u.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && <div className="card text-muted">No hay usuarios que coincidan.</div>}
          </div>
        </>
      ) : (
        // Fallback
        <div className="card text-muted">Selecciona "Crear usuario" o "Ver usuarios".</div>
      )}
    </div>
  );
};

export default UsuarioPage;
