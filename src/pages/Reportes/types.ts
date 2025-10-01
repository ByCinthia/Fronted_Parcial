// src/pages/Reportes/types.ts
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
