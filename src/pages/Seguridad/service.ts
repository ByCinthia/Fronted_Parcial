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
  return fetchJson<Acceso[]>("/seguridad/accesos/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function listarAccesos() {
  return fetchJson<Acceso[]>("/seguridad/accesos/");
}

// --- Reconocimiento facial ---
export function reconocerFacial(imagenBase64: string) {
  return fetchJson<ReconocimientoResponse>("/seguridad/reconocimiento-facial/", {
    method: "POST",
    body: JSON.stringify({ imagen: imagenBase64 }),
    csrf: true,
  });
}

// --- Visitas ---
export function registrarVisita(payload: Visita) {
  return fetchJson<Visita>("/seguridad/visitas/", {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export function listarVisitas() {
  return fetchJson<Visita[]>("/seguridad/visitas/");
}

// --- Incidentes ---
export function registrarIncidente(fd: FormData) {
  return fetchJson<Incidente>("/seguridad/incidentes/", {
    method: "POST",
    body: fd,
    csrf: true,
  });
}

export function listarIncidentes() {
  return fetchJson<Incidente[]>("/seguridad/incidentes/");
}

export function generarCargoIncidente(incidenteId: number, monto: number) {
  return fetchJson<{ id: number; monto: string; estado: string }>(
    `/seguridad/incidentes/${incidenteId}/cargo/`,
    {
      method: "POST",
      body: JSON.stringify({ monto }),
      csrf: true,
    }
  );
}

// --- Evidencias ---
export function registrarEvidencia(fd: FormData) {
  return fetchJson<Evidencia>("/seguridad/evidencias/", {
    method: "POST",
    body: fd,
    csrf: true,
  });
}

export function listarEvidencias() {
  return fetchJson<Evidencia[]>("/seguridad/evidencias/");
}

export function listarEvidenciasPorIncidente(incidenteId: number) {
  return fetchJson<Evidencia[]>(`/seguridad/evidencias/?incidente=${incidenteId}`);
}

// --- Evidencias de placa ---
export function crearEvidenciaPlaca(fd: FormData) {
  return fetchJson<EvidenciaPlaca>("/seguridad/evidencias-placa/", {
    method: "POST",
    body: fd,
    csrf: true,
  });
}

export function listarEvidenciasPlaca() {
  return fetchJson<EvidenciaPlaca[]>("/seguridad/evidencias-placa/");
}
