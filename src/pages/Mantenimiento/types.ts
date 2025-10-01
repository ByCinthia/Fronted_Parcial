// src/pages/Mantenimiento/types.ts

export interface Servicio {
  id?: number;
  name: string;
  descripcion: string;
  is_active: boolean;
}

export type EstadoTicket = "abierto" | "en_progreso" | "cerrado";

export interface Ticket {
  id?: number;
  unidad: number;
  servicio: number;
  titulo: string;
  descripcion: string;
  estado: EstadoTicket;
  programado: string; // fecha programada
  precio?: number;    // opcional, se refleja como cargo
}
