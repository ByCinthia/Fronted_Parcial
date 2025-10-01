// src/pages/Vivienda/service.ts
import { fetchJson } from "../../shared/api";
import type {
  Vehiculo, CreateVehiculoPayload, UpdateVehiculoPayload,
  Mascota, CreateMascotaPayload,
  Unidad, CreateUnidadPayload,
  AsignacionResidencia, CreateAsignacionResidenciaPayload,
  Contrato, CreateContratoPayload,
  Condominio, CreateCondominioPayload, Pagination,
} from "./types";

const asArray = <T>(data: T[] | Pagination<T>) => Array.isArray(data) ? data : data.results ?? [];

/* -------- Unidades -------- */
export async function fetchUnidades(params?: { page?: number; search?: string; condominio?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.search) q.set("search", params.search);
  if (params?.condominio) q.set("condominio", String(params.condominio));
  const res = await fetchJson<Unidad[] | Pagination<Unidad>>(`/api/v1/unidades/${q.toString() ? `?${q}` : ""}`);
  return asArray(res);
}
export function createUnidad(payload: CreateUnidadPayload) {
  return fetchJson<Unidad>("/api/v1/unidades/", { method: "POST", body: JSON.stringify(payload) });
}

/* -------- Residencias -------- */
export async function fetchResidencias(params?: { page?: number; unidad?: number; user?: number; status?: "activa"|"inactiva" }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.unidad) q.set("unidad", String(params.unidad));
  if (params?.user) q.set("user", String(params.user));
  if (params?.status) q.set("status", params.status);
  const res = await fetchJson<AsignacionResidencia[] | Pagination<AsignacionResidencia>>(`/api/v1/residencias/${q.toString() ? `?${q}` : ""}`);
  return asArray(res);
}
export function createAsignacionResidencia(payload: CreateAsignacionResidenciaPayload) {
  return fetchJson<AsignacionResidencia>("/api/v1/residencias/", { method: "POST", body: JSON.stringify(payload) });
}

/* -------- Vehículos -------- */
export async function fetchVehiculos(params?: { page?: number; unidad?: number; responsable?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.unidad) q.set("unidad", String(params.unidad));
  if (params?.responsable) q.set("responsable", String(params.responsable));
  const res = await fetchJson<Vehiculo[] | Pagination<Vehiculo>>(`/api/v1/vehiculos/${q.toString() ? `?${q}` : ""}`);
  return asArray(res);
}
export function createVehiculo(payload: CreateVehiculoPayload) {
  return fetchJson<Vehiculo>("/api/v1/vehiculos/", { method: "POST", body: JSON.stringify(payload) });
}
export function updateVehiculo(id: number, payload: UpdateVehiculoPayload) {
  return fetchJson<Vehiculo>(`/api/v1/vehiculos/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

/* -------- Mascotas -------- */
export async function fetchMascotas(params?: { page?: number; responsable?: number; unidad?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.responsable) q.set("responsable", String(params.responsable));
  if (params?.unidad) q.set("unidad", String(params.unidad));
  const res = await fetchJson<Mascota[] | Pagination<Mascota>>(`/api/v1/mascotas/${q.toString() ? `?${q}` : ""}`);
  return asArray(res);
}
export function createMascota(payload: CreateMascotaPayload) {
  return fetchJson<Mascota>("/api/v1/mascotas/", { method: "POST", body: JSON.stringify(payload) });
}

/* -------- Contratos -------- */
export function createContrato(payload: CreateContratoPayload) {
  return fetchJson<Contrato>("/api/v1/contratos/", { method: "POST", body: JSON.stringify(payload) });
}
export function generarCargoContrato(contratoId: number, periodo: string) {
  return fetchJson<{ ok: boolean; created?: number }>(`/api/v1/contratos/${contratoId}/generar_cargo/`, {
    method: "POST",
    body: JSON.stringify({ periodo }), // "YYYY-MM-01"
  });
}
export function generarCargosMes(periodo?: string) {
  return fetchJson<{ ok: boolean; created?: number }>(`/api/v1/contratos/generar_cargos_mes/`, {
    method: "POST",
    body: JSON.stringify(periodo ? { periodo } : {}),
  });
}

/* -------- Condominios -------- */
export async function fetchCondominios(params?: { page?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.search) q.set("search", params.search);
  const res = await fetchJson<Condominio[] | Pagination<Condominio>>(`/api/v1/condominios/${q.toString() ? `?${q}` : ""}`);
  return asArray(res);
}
export function createCondominio(payload: CreateCondominioPayload) {
  return fetchJson<Condominio>("/api/v1/condominios/", { method: "POST", body: JSON.stringify(payload) });
}

/* -------- Opcional: contrato con archivo (FormData) -------- */
export async function createContratoConArchivo(data: Omit<CreateContratoPayload, "monto_mensual"> & { monto_mensual?: string }, file?: File) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (file) fd.append("documento", file); // coincide con models.FileField(upload_to="contratos/")
  return fetchJson<Contrato>("/api/v1/contratos/", { method: "POST", body: fd });
}


