import { AppUser, CreateUserPayload } from "./types";
import { fetchJson } from "../../shared/api";

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/* ------------------------------
   Usuarios
------------------------------ */
export async function listarUsuarios(): Promise<AppUser[]> {
  const data = await fetchJson<AppUser[] | Paginated<AppUser>>("/api/v1/users/");
  // Soporta API con o sin paginación
  if (Array.isArray(data)) {
    return data;
  }
  return (data as Paginated<AppUser>).results;
}

export function crearUsuario(payload: CreateUserPayload, file?: File): Promise<AppUser> {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach((val) => fd.append(k, val));
    } else if (v !== undefined && v !== null) {
      fd.append(k, String(v));
    }
  });
  if (file) {
    fd.append("photo", file);
  }

  return fetchJson<AppUser>("/api/v1/users/", {
    method: "POST",
    body: fd,
  });
}
export function actualizarUsuario(
  id: number,
  payload: Partial<CreateUserPayload>
): Promise<AppUser> {
  return fetchJson<AppUser>(`/api/v1/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* Activar usuario */
export function activarUsuario(id: number): Promise<AppUser> {
  return actualizarUsuario(id, { is_active: true });
}

/* Desactivar usuario */
export function desactivarUsuario(id: number): Promise<AppUser> {
  return actualizarUsuario(id, { is_active: false });
}

export function actualizarFoto(id: number, file: File): Promise<AppUser> {
  const fd = new FormData();
  fd.append("photo", file);
  return fetchJson<AppUser>(`/api/v1/users/${id}/`, {
    method: "PATCH",
    body: fd,
  });
}

export function eliminarUsuario(id: number): Promise<void> {
  return fetchJson<void>(`/api/v1/users/${id}/`, { method: "DELETE" });
}


// --- 🔹 Nuevo: listar grupos disponibles ---
export async function listarGrupos(): Promise<string[]> {
  const data = await fetchJson<{ id: number; name: string }[]>("/api/v1/groups/");
  return data.map((g) => g.name);
}
