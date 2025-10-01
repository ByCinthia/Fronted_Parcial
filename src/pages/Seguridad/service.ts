// src/pages/Seguridad/service.ts
import {
  Acceso,
  ReconocimientoResponse,
  Visita,
  Incidente,
  Evidencia,
  EvidenciaPlaca,
} from "./types";
import { fetchJson } from "../../shared/api";

// =============================
//  SEGURIDAD SERVICES
// =============================

// --- Accesos ---
export function registrarAcceso(payload: Acceso) {
  return fetchJson<Acceso>("/api/v1/accesos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarAccesos() {
  return fetchJson<Acceso[]>("/api/v1/accesos/");
}

// --- Reconocimiento facial ---
export function reconocerFacial(imagenBase64: string) {
  return fetchJson<ReconocimientoResponse>("/api/v1/reconocimiento-facial/", {
    method: "POST",
    body: JSON.stringify({ imagen: imagenBase64 }),
  });
}

// --- Visitas ---
export function registrarVisita(payload: Visita) {
  return fetchJson<Visita>("/api/v1/visitas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarVisitas() {
  return fetchJson<Visita[]>("/api/v1/visitas/");
}

// --- Incidentes ---
export function registrarIncidente(fd: FormData) {
  return fetchJson<Incidente>("/api/v1/incidentes/", {
    method: "POST",
    body: fd,
  });
}

export function listarIncidentes() {
  return fetchJson<Incidente[]>("/api/v1/incidentes/");
}

export function generarCargoIncidente(incidenteId: number, monto: number) {
  return fetchJson<{ id: number; monto: string; estado: string }>(
    `/api/v1/incidentes/${incidenteId}/cargo/`,
    {
      method: "POST",
      body: JSON.stringify({ monto }),
    }
  );
}

// --- Evidencias ---
export function registrarEvidencia(fd: FormData) {
  return fetchJson<Evidencia>("/api/v1/evidencias/", {
    method: "POST",
    body: fd,
  });
}

export function listarEvidencias() {
  return fetchJson<Evidencia[]>("/api/v1/evidencias/");
}

export function listarEvidenciasPorIncidente(incidenteId: number) {
  return fetchJson<Evidencia[]>(`/api/v1/evidencias/?incidente=${incidenteId}`);
}

// --- Evidencias de placa ---
export function crearEvidenciaPlaca(fd: FormData) {
  return fetchJson<EvidenciaPlaca>("/api/v1/evidencias-placa/", {
    method: "POST",
    body: fd,
  });
}

export function listarEvidenciasPlaca() {
  return fetchJson<EvidenciaPlaca[]>("/api/v1/evidencias-placa/");
}
