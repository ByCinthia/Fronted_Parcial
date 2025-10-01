// src/pages/Reportes/service.ts
import { Unidad } from "../Vivienda/types";
import { fetchJson } from "../../shared/api";

export interface ReporteFinanzas {
  totalPagos: number;
  totalConfirmados: number;
  totalPendientes: number;
  totalCargos: number;
  cargosPagados: number;
  cargosPendientes: number;
}

export interface ReporteUsuarios {
  totalUsuarios: number;
  activos: number;
  inactivos: number;
}


// Listar todas las unidades disponibles
export async function listarUnidades(): Promise<Unidad[]> {
  return fetchJson<Unidad[]>("/api/v1/unidades/");
}
