// src/pages/Comunicacion/service.ts
import { fetchJson } from "../../shared/api";
import { Comunicado, Notificacion } from "./types";

/* ----- COMUNICADOS ----- */
export function crearComunicado(payload: Comunicado): Promise<Comunicado> {
  return fetchJson<Comunicado>("/comunicacion/comunicados/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function listarComunicados(params?: {
  creador?: number;
  desde?: string;
  hasta?: string;
}): Promise<Comunicado[]> {
  const query = new URLSearchParams();
  if (params?.creador) query.append("creado_por", String(params.creador));
  if (params?.desde) query.append("desde", params.desde);
  if (params?.hasta) query.append("hasta", params.hasta);

  return fetchJson<Comunicado[]>(`/comunicacion/comunicados/?${query.toString()}`);
}

export function verLecturas(
  comunicadoId: number
): Promise<{ user: number; nombre: string; fecha: string }[]> {
  return fetchJson<{ user: number; nombre: string; fecha: string }[]>(
    `/comunicacion/comunicados/${comunicadoId}/lecturas/`
  );
}

/* ----- NOTIFICACIONES ----- */
export function crearNotificacion(payload: Notificacion): Promise<Notificacion> {
  return fetchJson<Notificacion>("/comunicacion/notificaciones/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}
