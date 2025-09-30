// src/pages/Comunicacion/service.ts
import { Comunicado, Notificacion } from "./types";

const API_BASE = "/api/v1/comunicados/";

// Crear comunicado
export async function crearComunicado(payload: Comunicado): Promise<Comunicado> {
  const res = await fetch(`${API_BASE}/comunicados/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear comunicado");
  return res.json();
}

// Listar comunicados con filtros
export async function listarComunicados(params?: { creador?: number; desde?: string; hasta?: string }): Promise<Comunicado[]> {
  const query = new URLSearchParams();
  if (params?.creador) query.append("creado_por", String(params.creador));
  if (params?.desde) query.append("desde", params.desde);
  if (params?.hasta) query.append("hasta", params.hasta);

  const res = await fetch(`${API_BASE}/comunicados/?${query.toString()}`);
  if (!res.ok) throw new Error("Error al listar comunicados");
  return res.json();
}

// Ver quiénes leyeron un comunicado
export async function verLecturas(comunicadoId: number): Promise<{ user: number; nombre: string; fecha: string }[]> {
  const res = await fetch(`${API_BASE}/comunicados/${comunicadoId}/lecturas/`);
  if (!res.ok) throw new Error("Error al obtener lecturas");
  return res.json();
}

// Crear notificación directa
export async function crearNotificacion(payload: Notificacion): Promise<Notificacion> {
  const res = await fetch(`${API_BASE}/notificaciones/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear notificación");
  return res.json();
}
