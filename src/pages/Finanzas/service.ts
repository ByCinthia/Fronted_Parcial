import type { Cargo, CreateCargoPayload, Pago, CreatePagoPayload, AplicarPago } from "./types";
import { fetchJson } from "../../shared/api";

/* -------------------------
   Cargos
------------------------- */
export function createCargo(payload: CreateCargoPayload): Promise<Cargo> {
  return fetchJson<Cargo>("/api/v1/cargos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarCargos(unidad?: number, estado?: string): Promise<Cargo[]> {
  const params = new URLSearchParams();
  if (unidad) params.append("unidad", String(unidad));
  if (estado) params.append("estado", estado);
  return fetchJson<Cargo[]>(`/api/v1/cargos/?${params.toString()}`);
}

export function anularCargo(id: number): Promise<Cargo> {
  return fetchJson<Cargo>(`/api/v1/cargos/${id}/anular/`, { method: "POST" });
}

/* -------------------------
   Pagos
------------------------- */
export function createPago(payload: CreatePagoPayload): Promise<Pago> {
  return fetchJson<Pago>("/api/v1/pagos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarPagos(unidad?: number, desde?: string, hasta?: string): Promise<Pago[]> {
  const params = new URLSearchParams();
  if (unidad) params.append("unidad", String(unidad));
  if (desde) params.append("fecha__gte", desde);
  if (hasta) params.append("fecha__lte", hasta);
  return fetchJson<Pago[]>(`/api/v1/pagos/?${params.toString()}`);
}

export function confirmarPago(id: number): Promise<Pago> {
  return fetchJson<Pago>(`/api/v1/pagos/${id}/confirmar/`, { method: "POST" });
}

export function marcarPagoFallido(id: number): Promise<Pago> {
  return fetchJson<Pago>(`/api/v1/pagos/${id}/fallido/`, { method: "POST" });
}

/* -------------------------
   PagoCargo
------------------------- */
export function aplicarPago(payload: AplicarPago): Promise<AplicarPago> {
  return fetchJson<AplicarPago>("/api/v1/pagocargo/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verAplicacionesPago(pagoId: number): Promise<AplicarPago[]> {
  return fetchJson<AplicarPago[]>(`/api/v1/pagocargo/?pago=${pagoId}`);
}
