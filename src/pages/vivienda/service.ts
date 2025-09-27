import type { Pagination, Copropietario, Vehiculo, Mascota } from "./types";


const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api/v1/vehiculos/"; // ejemplo: http://localhost:8000



function getHeaders(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResp<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.detail || data.error || data.message)) || res.statusText || `HTTP ${res.status}`;
    throw new Error(String(msg));
  }
  return data as T;
}

export async function fetchCopropietarios(page = 1, search = "", token?: string): Promise<Pagination<Copropietario>> {
  const q = new URLSearchParams({ page: String(page), search });
  const res = await fetch(`${API_BASE}/copropietarios/?${q.toString()}`, { headers: getHeaders(token) });
  return handleResp<Pagination<Copropietario>>(res);
}
export async function createCopropietario(payload: Partial<Copropietario>, token?: string): Promise<Copropietario> {
  const res = await fetch(`${API_BASE}/copropietarios/`, { method: "POST", headers: getHeaders(token), body: JSON.stringify(payload) });
  return handleResp<Copropietario>(res);
}

export async function fetchVehiculos(page = 1, token?: string): Promise<Pagination<Vehiculo>> {
  const res = await fetch(`${API_BASE}/vehiculos/?page=${page}`, { headers: getHeaders(token) });
  return handleResp<Pagination<Vehiculo>>(res);
}
export async function createVehiculo(payload: Partial<Vehiculo>, token?: string): Promise<Vehiculo> {
  const res = await fetch(`${API_BASE}/vehiculos/`, { method: "POST", headers: getHeaders(token), body: JSON.stringify(payload) });
  return handleResp<Vehiculo>(res);
}

export async function fetchMascotas(page = 1, token?: string): Promise<Pagination<Mascota>> {
  const res = await fetch(`${API_BASE}/mascotas/?page=${page}`, { headers: getHeaders(token) });
  return handleResp<Pagination<Mascota>>(res);
}
export async function createMascota(payload: Partial<Mascota>, token?: string): Promise<Mascota> {
  const res = await fetch(`${API_BASE}/mascotas/`, { method: "POST", headers: getHeaders(token), body: JSON.stringify(payload) });
  return handleResp<Mascota>(res);
}
