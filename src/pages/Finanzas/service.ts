// src/pages/Finanzas/service.ts
import type {
  Cargo,
  CreateCargoPayload,
  Pago,
  CreatePagoPayload,
  AplicarPago,
} from "./types";

import { fetchJson } from "../../shared/api";

// Crear un cargo
export function createCargo(payload: CreateCargoPayload): Promise<Cargo> {
  return fetchJson<Cargo>("/finanzas/cargos/", {
    method: "POST",
    body: JSON.stringify(payload),
    
  });
}

// Crear un pago
export function createPago(payload: CreatePagoPayload): Promise<Pago> {
  return fetchJson<Pago>("/finanzas/pagos/", {
    method: "POST",
    body: JSON.stringify(payload),
    
  });
}

// Aplicar pago a un cargo
export function aplicarPago(payload: AplicarPago): Promise<AplicarPago> {
  return fetchJson<AplicarPago>("/finanzas/aplicar-pago/", {
    method: "POST",
    body: JSON.stringify(payload),
    
  });
}

// Listar cargos por unidad y estado
export function listarCargos(
  unidad: number,
  estado?: string,
  ordering?: string
): Promise<Cargo[]> {
  const params = new URLSearchParams();
  params.append("unidad", String(unidad));
  if (estado) params.append("estado", estado);
  if (ordering) params.append("ordering", ordering);

  return fetchJson<Cargo[]>(`/finanzas/cargos/?${params.toString()}`);
}

// Listar pagos por unidad y rango de fechas
export function listarPagos(
  unidad: number,
  fecha_gte?: string,
  fecha_lte?: string,
  ordering?: string
): Promise<Pago[]> {
  const params = new URLSearchParams();
  params.append("unidad", String(unidad));
  if (fecha_gte) params.append("fecha__gte", fecha_gte);
  if (fecha_lte) params.append("fecha__lte", fecha_lte);
  if (ordering) params.append("ordering", ordering);

  return fetchJson<Pago[]>(`/finanzas/pagos/?${params.toString()}`);
}

// Ver aplicaciones de pago por pago
export function verAplicacionesPago(
  pagoId: number,
  ordering?: string
): Promise<AplicarPago[]> {
  const params = new URLSearchParams();
  params.append("pago", String(pagoId));
  if (ordering) params.append("ordering", ordering);

  return fetchJson<AplicarPago[]>(`/finanzas/aplicaciones/?${params.toString()}`);
}
