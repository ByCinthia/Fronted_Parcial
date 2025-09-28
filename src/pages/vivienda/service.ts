// src/pages/vivienda/service.ts
import type {
  Vehiculo,
  CreateVehiculoPayload,
  Mascota,
  CreateMascotaPayload,
  Unidad,
  CreateUnidadPayload,
  AsignacionResidencia,
  CreateAsignacionResidenciaPayload,
  ContratoAlquiler,
  CrearContrato,
} from "../Vivienda/types";

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api/v1";

async function safeJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") ?? "";
  const text = await res.text();
  if (!ct.includes("application/json")) {
    throw new Error(`Unexpected content-type: ${ct}. Body: ${text.slice(0, 800)}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(
      `Invalid JSON response: ${(err as Error).message}. Body: ${text.slice(0, 800)}`
    );
  }
}

function hasResultsArray(x: unknown): x is { results: unknown[] } {
  if (typeof x !== "object" || x === null) return false;
  const maybe = (x as { results?: unknown }).results;
  return Array.isArray(maybe);
}

/* ---------------- Vehículos ---------------- */
export async function fetchVehiculos(): Promise<Vehiculo[]> {
  const res = await fetch(`${API_BASE}/vehiculos/`, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fetchVehiculos failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  const data = await safeJson<unknown>(res);
  if (Array.isArray(data)) return data as Vehiculo[];
  if (hasResultsArray(data)) return data.results as Vehiculo[];
  return [];
}
export async function createVehiculo(payload: CreateVehiculoPayload): Promise<Vehiculo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: Date.now(), ...payload });
    }, 500);
  });
}

/*export async function createVehiculo(payload: CreateVehiculoPayload): Promise<Vehiculo> {
  const res = await fetch(`${API_BASE}/vehiculos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createVehiculo failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  return safeJson<Vehiculo>(res);
}*/
// src/pages/vivienda/service.ts
import type { UpdateVehiculoPayload} from "../Vivienda/types";

export async function updateVehiculo(id: number, payload: UpdateVehiculoPayload): Promise<Vehiculo> {
  const res = await fetch(`${API_BASE}/vehiculos/${id}/`, {
    method: "PUT", // o "PATCH" si tu backend soporta parciales
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`updateVehiculo failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }

  return safeJson<Vehiculo>(res);
}


/* ---------------- Mascotas ---------------- */
export async function fetchMascotas(): Promise<Mascota[]> {
  const res = await fetch(`${API_BASE}/mascotas/`, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fetchMascotas failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  const data = await safeJson<unknown>(res);
  if (Array.isArray(data)) return data as Mascota[];
  if (hasResultsArray(data)) return data.results as Mascota[];
  return [];
}

export async function createMascota(payload: CreateMascotaPayload): Promise<Mascota> {
  const res = await fetch(`${API_BASE}/mascotas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createMascota failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  return safeJson<Mascota>(res);
}

/* ---------------- Unidades ---------------- */
export async function fetchUnidades(): Promise<Unidad[]> {
  const res = await fetch(`${API_BASE}/unidades/`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `fetchUnidades failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`
    );
  }
  const data = await safeJson<unknown>(res);
  if (Array.isArray(data)) return data as Unidad[];
  if (hasResultsArray(data)) return data.results as Unidad[];
  return [];
}

export async function createUnidad(payload: CreateUnidadPayload): Promise<Unidad> {
  const res = await fetch(`${API_BASE}/unidades/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createUnidad failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  return safeJson<Unidad>(res);
}


/* ---------------- Residencias ---------------- */

export async function fetchResidencias(): Promise<AsignacionResidencia[]> {
  const res = await fetch(`${API_BASE}/asignaciones/`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `fetchResidencias failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`
    );
  }

  const data = await safeJson<unknown>(res);
  if (Array.isArray(data)) return data as AsignacionResidencia[];
  if (hasResultsArray(data)) return data.results as AsignacionResidencia[];
  return [];
}

/* ---------------- Asignar Residencia ---------------- */
export async function createAsignacionResidencia(
  payload: CreateAsignacionResidenciaPayload
): Promise<AsignacionResidencia> {
  const res = await fetch(`${API_BASE}/asignaciones/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createAsignacionResidencia failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  return safeJson<AsignacionResidencia>(res);
}

/* ---------------- Contrato alquiler ---------------- */
export async function createContratoAlquiler(
  payload: CrearContrato
): Promise<ContratoAlquiler> {
  const res = await fetch(`${API_BASE}/contratos-alquiler/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createContratoAlquiler failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  return safeJson<ContratoAlquiler>(res);
}
