// src/pages/Reservas/service.ts
import { fetchJson } from "../../shared/api";
import { Area, Suministro, Reserva } from "./types";

/* ----- ÁREAS ----- */
export function crearArea(payload: Area): Promise<Area> {
  return fetchJson<Area>("/api/v1/reservas/areas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarAreas(): Promise<Area[]> {
  return fetchJson<Area[]>("/api/v1/reservas/areas/");
}

/* ----- SUMINISTROS ----- */
export function crearSuministro(payload: Suministro): Promise<Suministro> {
  return fetchJson<Suministro>("/api/v1/reservas/suministros/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarSuministros(areaId: number): Promise<Suministro[]> {
  return fetchJson<Suministro[]>(`/api/v1/reservas/suministros/?area=${areaId}`);
}

/* ----- RESERVAS ----- */
export function crearReserva(payload: Reserva): Promise<Reserva> {
  return fetchJson<Reserva>("/api/v1/reservas/reservas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarReservas(): Promise<Reserva[]> {
  return fetchJson<Reserva[]>("/api/v1/reservas/reservas/");
}

export function cambiarEstadoReserva(id: number, estado: string): Promise<Reserva> {
  return fetchJson<Reserva>(`/api/v1/reservas/reservas/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

