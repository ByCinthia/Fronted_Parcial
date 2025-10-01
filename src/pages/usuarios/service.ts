import { AppUser, CreateUserPayload } from "./types";
import { fetchJson } from "../../shared/api";

// --- Usuarios --- //
export function listarUsuarios(): Promise<AppUser[]> {
  return fetchJson<AppUser[]>("/users/");
}

export function crearUsuario(payload: CreateUserPayload): Promise<AppUser> {
  return fetchJson<AppUser>("/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function actualizarUsuario(id: number, payload: Partial<CreateUserPayload>): Promise<AppUser> {
  return fetchJson<AppUser>(`/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function actualizarFoto(id: number, file: File): Promise<AppUser> {
  const fd = new FormData();
  fd.append("photo", file);
  return fetchJson<AppUser>(`/users/${id}/foto/`, {
    method: "POST",
    body: fd,
  });
}

export function eliminarUsuario(id: number): Promise<void> {
  return fetchJson<void>(`/users/${id}/`, { method: "DELETE" });
}
