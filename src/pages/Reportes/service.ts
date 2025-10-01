// src/pages/Reportes/service.ts
import { listarPagos, listarCargos } from "../Finanzas/service";
import { listarUsuarios } from "../Usuarios/service";
import { ReporteFinanzas, ReporteUsuarios } from "./types";
import { Pago, Cargo } from "../Finanzas/types";
import { AppUser } from "../Usuarios/types";
import { Unidad } from "../Vivienda/types";
import { fetchJson } from "../../shared/api";

// ✅ Nuevo: exportar listarUnidades
export async function listarUnidades(): Promise<Unidad[]> {
  return fetchJson<Unidad[]>("/api/v1/unidades/");
}

export async function generarReporteFinanzas(unidad: number): Promise<ReporteFinanzas> {
  const pagos: Pago[] = await listarPagos(unidad);
  const cargos: Cargo[] = await listarCargos(unidad);

  return {
    totalPagos: pagos.length,
    totalConfirmados: pagos.filter((p: Pago) => p.estado === "confirmado").length,
    totalPendientes: pagos.filter((p: Pago) => p.estado === "pendiente").length,
    totalCargos: cargos.length,
    cargosPagados: cargos.filter((c: Cargo) => c.estado === "pagado").length,
    cargosPendientes: cargos.filter((c: Cargo) => c.estado === "pendiente").length,
  };
}

export async function generarReporteUsuarios(): Promise<ReporteUsuarios> {
  const usuarios: AppUser[] = await listarUsuarios();

  return {
    totalUsuarios: usuarios.length,
    activos: usuarios.filter((u: AppUser) => u.is_active).length,
    inactivos: usuarios.filter((u: AppUser) => !u.is_active).length,
  };
}
