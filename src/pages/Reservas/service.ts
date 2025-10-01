// src/pages/Reservas/service.ts
import { fetchJson } from "../../shared/api";
import { Area, Suministro, Reserva } from "./types";

/* ----- ÁREAS ----- */
export function crearArea(payload: Area): Promise<Area> {
  return fetchJson<Area>("/reservas/areas/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function listarAreas(): Promise<Area[]> {
  return fetchJson<Area[]>("/reservas/areas/");
}

/* ----- SUMINISTROS ----- */
export function crearSuministro(payload: Suministro): Promise<Suministro> {
  return fetchJson<Suministro>("/reservas/suministros/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function listarSuministros(areaId: number): Promise<Suministro[]> {
  return fetchJson<Suministro[]>(`/reservas/suministros/?area=${areaId}`);
}

/* ----- RESERVAS ----- */
export function crearReserva(payload: Reserva): Promise<Reserva> {
  return fetchJson<Reserva>("/reservas/reservas/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function listarReservas(): Promise<Reserva[]> {
  return fetchJson<Reserva[]>("/reservas/reservas/");
}

export function cambiarEstadoReserva(id: number, estado: string): Promise<Reserva> {
  return fetchJson<Reserva>(`/reservas/reservas/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
    csrf: true,
  });
}
