import type {
  Cargo,
  CreateCargoPayload,
  Pago,
  CreatePagoPayload,
  AplicarPago,
} from "./types"; // Importar las interfaces

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api/v1";

// Función auxiliar para manejar respuestas JSON
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

// Función para crear un cargo
export async function createCargo(payload: CreateCargoPayload): Promise<Cargo> {
  const res = await fetch(`${API_BASE}/cargos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createCargo failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  return safeJson<Cargo>(res);
}

// Función para crear un pago
export async function createPago(payload: CreatePagoPayload): Promise<Pago> {
  const res = await fetch(`${API_BASE}/pagos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createPago failed: ${res.status} ${res.statusText} - ${body.slice(0, 800)}`);
  }
  return safeJson<Pago>(res);
}

// Función para aplicar un pago a un cargo
export async function aplicarPago(payload: AplicarPago): Promise<AplicarPago> {
  const res = await fetch(`${API_BASE}/aplicar-pago/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al aplicar pago");
  return res.json();
}
// listar cargos por unidad y estado
export async function listarCargos(unidad: number, estado?: string, ordering?: string): Promise<Cargo[]> {
  const params = new URLSearchParams();
  params.append("unidad", String(unidad));
  if (estado) params.append("estado", estado);
  if (ordering) params.append("ordering", ordering);

  const res = await fetch(`${API_BASE}/cargos/?${params.toString()}`);
  if (!res.ok) throw new Error("Error al listar cargos");
  return res.json();
}

// listar pagos por unidad y rango de fechas
export async function listarPagos(unidad: number, fecha_gte?: string, fecha_lte?: string, ordering?: string): Promise<Pago[]> {
  const params = new URLSearchParams();
  params.append("unidad", String(unidad));
  if (fecha_gte) params.append("fecha__gte", fecha_gte);
  if (fecha_lte) params.append("fecha__lte", fecha_lte);
  if (ordering) params.append("ordering", ordering);

  const res = await fetch(`${API_BASE}/pagos/?${params.toString()}`);
  if (!res.ok) throw new Error("Error al listar pagos");
  return res.json();
}

// ver aplicaciones de pago por pago
export async function verAplicacionesPago(pagoId: number, ordering?: string): Promise<AplicarPago[]> {
  const params = new URLSearchParams();
  params.append("pago", String(pagoId));
  if (ordering) params.append("ordering", ordering);

  const res = await fetch(`${API_BASE}/aplicaciones/?${params.toString()}`);
  if (!res.ok) throw new Error("Error al listar aplicaciones de pago");
  return res.json();
}