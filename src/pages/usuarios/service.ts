import { AppUser, CreateUserPayload } from "./types";
import { fetchJson } from "../../shared/api";

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
// --- Usuarios --- //
// --- Usuarios --- //
export async function listarUsuarios(): Promise<AppUser[]> {
  const data = await fetchJson<AppUser[] | Paginated<AppUser>>("/api/v1/users/");
  // Si viene paginado → extraer results
  if (Array.isArray(data)) {
    return data;
  }
  return (data as Paginated<AppUser>).results;
}

export function crearUsuario(payload: CreateUserPayload): Promise<AppUser> {
  return fetchJson<AppUser>("/api/v1/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function actualizarUsuario(id: number, payload: Partial<CreateUserPayload>): Promise<AppUser> {
  return fetchJson<AppUser>(`/api/v1/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function actualizarFoto(id: number, file: File): Promise<AppUser> {
  const fd = new FormData();
  fd.append("photo", file);
  return fetchJson<AppUser>(`/api/v1/users/${id}/foto/`, {
    method: "POST",
    body: fd,
  });
}

export function eliminarUsuario(id: number): Promise<void> {
  return fetchJson<void>(`/api/v1/users/${id}/`, { method: "DELETE" });
}
