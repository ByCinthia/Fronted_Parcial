// src/modules/seguridad/types.ts
// Tipos para Accesos y reconocimiento facial

export interface Acceso {
  id?: number;
  unidad: number;
  sentido: "in" | "out";
  permitido: boolean;
  fecha?: string; // opcional, lo devuelve el backend
  creado_por?: string; // opcional, si el backend lo asigna
}

export interface ReconocimientoResponse {
  match: boolean;
  unidad?: number;
  persona?: string;
}

export interface Visita {
  id?: number;
  nombre: string;
  documento: string;
  unidad: number;
  motivo: string;
  fecha: string;   // ISO 8601
  autorizado: boolean;
}
/// visitas

export interface Incidente {
  id?: number;
  unidad: number;
  user: number;
  titulo: string;
  descripcion: string;
  estado: "abierto" | "cerrado";
  evidencia?: string; // URL que devuelva el backend
  monto_multa?: number;
  fecha?: string; // opcional, si el backend la añade
}


export interface Evidencia {
  id?: number;
  incidente: number;
  tipo: "imagen" | "video";
  url: string;
  fecha?: string;
}

export interface EvidenciaPlaca {
  id?: number;
  acceso: number;
  modo: string;
  url: string;
  placa_detectada?: string;
  fecha?: string;
}
