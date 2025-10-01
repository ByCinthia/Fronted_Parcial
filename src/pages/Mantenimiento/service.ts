// src/pages/Mantenimiento/service.ts
import { fetchJson } from "../../shared/api";
import { Servicio, Ticket } from "./types";

/* ----- SERVICIOS ----- */
export function crearServicio(payload: Servicio): Promise<Servicio> {
  return fetchJson<Servicio>("/api/v1/servicios/", {
    method: "POST",
    body: JSON.stringify(payload),
    
  });
}

export function listarServicios(): Promise<Servicio[]> {
  return fetchJson<Servicio[]>("/mantenimiento/servicios/");
}

/* ----- TICKETS ----- */
export function crearTicket(payload: Ticket): Promise<Ticket> {
  return fetchJson<Ticket>("/api/v1/tickets/", {
    method: "POST",
    body: JSON.stringify(payload),
    
  });
}

export function listarTickets(params?: { desde?: string; hasta?: string }): Promise<Ticket[]> {
  const query = new URLSearchParams();
  if (params?.desde) query.append("programado_gte", params.desde);
  if (params?.hasta) query.append("programado_lte", params.hasta);

  return fetchJson<Ticket[]>(`/mantenimiento/tickets/?${query.toString()}`);
}
