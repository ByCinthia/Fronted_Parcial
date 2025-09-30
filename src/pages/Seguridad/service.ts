// src/modules/seguridad/service.ts
import {
  Acceso,
  ReconocimientoResponse,
  Visita,
  Incidente,
  Evidencia,
  EvidenciaPlaca,
} from "./types";

const BASE_URL = "/api/seguridad";

// --- Utils ---
function getCookie(name: string) {
  // Útil para CSRF con Django/DRF si usas SessionAuth
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit & { csrf?: boolean }
): Promise<T> {
  const headers = new Headers(init?.headers);

  // Incluye credenciales siempre si usas sesión
  const withCreds: RequestInit = { credentials: "include", ...init };

  // Acepta JSON por defecto
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  // Si no es FormData, entonces Content-Type JSON
  const isFormData = (init?.body instanceof FormData);
  if (!isFormData && init?.method && init.method !== "GET") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  // CSRF
  if (init?.csrf) {
    const token = getCookie("csrftoken");
    if (token) headers.set("X-CSRFToken", token);
  }

  const res = await fetch(input, { ...withCreds, headers });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }

  // algunos endpoints devuelven 204 sin contenido
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// --- Accesos ---
export async function registrarAcceso(payload: Acceso): Promise<Acceso> {
  return fetchJson<Acceso>(`${BASE_URL}/accesos/`, {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export async function listarAccesos(): Promise<Acceso[]> {
  return fetchJson<Acceso[]>(`${BASE_URL}/accesos/`);
}

// --- Reconocimiento facial ---
export async function reconocerFacial(imagenBase64: string): Promise<ReconocimientoResponse> {
  return fetchJson<ReconocimientoResponse>(`${BASE_URL}/reconocimiento-facial/`, {
    method: "POST",
    body: JSON.stringify({ imagen: imagenBase64 }),
    csrf: true,
  });
}

// --- Visitas ---
export async function registrarVisita(payload: Visita): Promise<Visita> {
  return fetchJson<Visita>(`${BASE_URL}/visitas/`, {
    method: "POST",
    body: JSON.stringify(payload),
    csrf: true,
  });
}

export async function listarVisitas(): Promise<Visita[]> {
  return fetchJson<Visita[]>(`${BASE_URL}/visitas/`);
}

// --- Incidentes ---
export async function registrarIncidente(fd: FormData): Promise<Incidente> {
  // Ojo: no ponemos Content-Type, el navegador arma el boundary
  return fetchJson<Incidente>(`${BASE_URL}/incidentes/`, {
    method: "POST",
    body: fd,
    csrf: true,
  });
}

export async function listarIncidentes(): Promise<Incidente[]> {
  return fetchJson<Incidente[]>(`${BASE_URL}/incidentes/`);
}

export async function generarCargoIncidente(incidenteId: number, monto: number) {
  return fetchJson<{ id: number; monto: number; estado: string }>(
    `${BASE_URL}/incidentes/${incidenteId}/cargo/`,
    {
      method: "POST",
      body: JSON.stringify({ monto }),
      csrf: true,
    }
  );
}

// --- Evidencias ---
export async function registrarEvidencia(fd: FormData): Promise<Evidencia> {
  return fetchJson<Evidencia>(`${BASE_URL}/evidencias/`, {
    method: "POST",
    body: fd,
    csrf: true,
  });
}

export async function listarEvidencias(): Promise<Evidencia[]> {
  return fetchJson<Evidencia[]>(`${BASE_URL}/evidencias/`);
}
// Listar evidencias por incidente
export async function listarEvidenciasPorIncidente(incidenteId: number): Promise<Evidencia[]> {
  const res = await fetch(`/api/seguridad/acceso-evidencias/?incidente=${incidenteId}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Error al listar evidencias");
  return res.json();
}

// Crear evidencia placa
export async function crearEvidenciaPlaca(fd: FormData): Promise<EvidenciaPlaca> {
  const res = await fetch(`/api/seguridad/crear-evidencia-placa/`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Error al crear evidencia de placa");
  return res.json();
}

// Listar evidencias placa (opcional si quieres tabla independiente)
export async function listarEvidenciasPlaca(): Promise<EvidenciaPlaca[]> {
  const res = await fetch(`/api/seguridad/crear-evidencia-placa/`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Error al listar evidencias de placa");
  return res.json();
}
