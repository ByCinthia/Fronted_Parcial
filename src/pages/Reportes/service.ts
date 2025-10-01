// src/pages/Reportes/service.ts
import { listarPagos, listarCargos } from "../Finanzas/service";
import { listarUsuarios } from "../Usuarios/service";
import { ReporteFinanzas, ReporteUsuarios } from "./types";
import { Pago } from "../Finanzas/types";
import { Cargo } from "../Finanzas/types";
import { AppUser } from "../Usuarios/types";

// Reporte de Finanzas
export async function generarReporteFinanzas(unidad: number): Promise<ReporteFinanzas> {
  const pagos: Pago[] = await listarPagos(unidad);
  const cargos: Cargo[] = await listarCargos(unidad);

  return {
    totalPagos: pagos.length,
    totalConfirmados: pagos.filter(p => p.estado === "confirmado").length,
    totalPendientes: pagos.filter(p => p.estado === "pendiente").length,
    totalCargos: cargos.length,
    cargosPagados: cargos.filter(c => c.estado === "pagado").length,
    cargosPendientes: cargos.filter(c => c.estado === "pendiente").length,
  };
}

// Reporte de Usuarios
export async function generarReporteUsuarios(): Promise<ReporteUsuarios> {
  const usuarios: AppUser[] = await listarUsuarios();

  return {
    totalUsuarios: usuarios.length,
    activos: usuarios.filter(u => u.is_active).length,
    inactivos: usuarios.filter(u => !u.is_active).length,
  };
}
