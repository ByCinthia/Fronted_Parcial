import { AppUser, CreateUserPayload } from "./types";
import { fetchJson } from "../../shared/api";
//const API_BASE = import.meta.env.VITE_API_URL;


// --- Usuarios --- //
export function listarUsuarios(): Promise<AppUser[]> {
  return fetchJson<AppUser[]>("/usuarios/");
}

export function crearUsuario(payload: CreateUserPayload): Promise<AppUser> {
  return fetchJson<AppUser>("/usuarios/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function actualizarUsuario(id: number, payload: Partial<CreateUserPayload>): Promise<AppUser> {
  return fetchJson<AppUser>(`/usuarios/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function actualizarFoto(id: number, file: File): Promise<AppUser> {
  const fd = new FormData();
  fd.append("photo", file);
  return fetchJson<AppUser>(`/usuarios/${id}/foto/`, {
    method: "POST",
    body: fd,
    csrf: true,
  });
}

export function eliminarUsuario(id: number): Promise<void> {
  return fetchJson<void>(`/usuarios/${id}/`, { method: "DELETE", csrf: true });
}
