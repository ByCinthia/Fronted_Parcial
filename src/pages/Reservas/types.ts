// src/pages/Reservas/types.ts

export interface Area {
  id?: number;
  name: string;
  descripcion: string;
  deposit_amount: string;
  is_active: boolean;
}

export interface Suministro {
  id?: number;
  areacomun: number;
  name: string;
  descripcion: string;
  cantidad_total: number;
}

export type EstadoReserva = "pendiente" | "observacion" | "confirmada" | "cancelada";

export interface Reserva {
  id?: number;
  unidad: number;
  area: number;
  start: string;
  end: string;
  notas?: string;
  estado?: EstadoReserva;
}
