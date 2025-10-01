// src/pages/Reservas/service.ts
import { fetchJson } from "../../shared/api";
import { Area, Suministro, Reserva } from "./types";

/* ----- ÁREAS ----- */
export function crearArea(payload: Area): Promise<Area> {
  return fetchJson<Area>("/api/v1/areas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarAreas(): Promise<Area[]> {
  return fetchJson<Area[]>("/api/v1/areas/");
}

/* ----- SUMINISTROS ----- */
export function crearSuministro(payload: Suministro): Promise<Suministro> {
  return fetchJson<Suministro>("/api/v1/suministros/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarSuministros(areaId?: number): Promise<Suministro[]> {
  const url = areaId ? `/api/v1/suministros/?area=${areaId}` : "/api/v1/suministros/";
  return fetchJson<Suministro[]>(url);
}

/* ----- RESERVAS ----- */
export function crearReserva(payload: Reserva): Promise<Reserva> {
  return fetchJson<Reserva>("/api/v1/reservas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarReservas(): Promise<Reserva[]> {
  return fetchJson<Reserva[]>("/api/v1/reservas/");
}

export function cancelarReserva(id: number): Promise<Reserva> {
  return fetchJson<Reserva>(`/api/v1/reservas/${id}/cancelar/`, {
    method: "POST", // según DRF, estas acciones personalizadas suelen ser POST
  });
}

export function confirmarReserva(id: number): Promise<Reserva> {
  return fetchJson<Reserva>(`/api/v1/reservas/${id}/confirmar/`, {
    method: "POST",
  });
}
