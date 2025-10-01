// src/pages/Vivienda/types.ts
export type Pagination<T> = {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
};

/* -------- Condominios -------- */
export interface Condominio {
  id: number;
  direccion: string;
  name: string;
  tipo: "vertical" | "horizontal";
  is_active?: boolean;
}
export interface CreateCondominioPayload {
  direccion: string;
  name: string;
  tipo: "vertical" | "horizontal";
}

/* -------- Unidades -------- */
export interface Unidad {
  id: number;
  condominio: number;          // FK condominio
  direccion: string;           // calle / referencia
  code: string;                // ej: "A-101"
  user?: number | null;        // dueño (opcional)
  piso?: number | null;        // solo vertical
  manzano?: string | null;     // solo horizontal
  is_active?: boolean;
  // conveniente para UI:
  tipo?: "vertical" | "horizontal"; // se hereda del condominio (read-only)
}
export interface CreateUnidadPayload {
  condominio: number;
  direccion: string;
  code: string;
  user?: number | null;
  piso?: number | null;
  manzano?: string | null;
}

/* -------- Residencias (Residency) -------- */
export interface AsignacionResidencia {
  id: number;
  user: number;
  unidad: number;
  tipo_ocupacion: "propietario" | "residente";
  status: "activa" | "inactiva";
  is_owner: boolean;
  start: string;               // YYYY-MM-DD
  end?: string | null;
  is_active?: boolean;
}
export interface CreateAsignacionResidenciaPayload {
  user: number;
  unidad: number;
  tipo_ocupacion: "propietario" | "residente";
  status: "activa" | "inactiva";
  is_owner: boolean;
  start: string;
  end?: string | null;
}

/* -------- Vehículos -------- */
export interface Vehiculo {
  id: number;
  unidad: number;
  responsable?: number | null;
  placa: string;
  marca?: string;
  color?: string;
  observacion?: string;
  is_active?: boolean;
}
export interface CreateVehiculoPayload {
  unidad: number;
  responsable?: number | null;
  placa: string;
  marca?: string;
  color?: string;
  observacion?: string;
}
export type UpdateVehiculoPayload = Partial<CreateVehiculoPayload>;

/* -------- Mascotas -------- */
export interface Mascota {
  id: number;
  name: string;
  tipo: string;                // perro/gato/...
  raza?: string;
  desde?: string | null;       // YYYY-MM-DD
  hasta?: string | null;       // YYYY-MM-DD
  responsable?: number | null;
  is_active?: boolean;
}
export interface CreateMascotaPayload {
  name: string;
  tipo: string;
  raza?: string;
  desde?: string | null;
  hasta?: string | null;
  responsable?: number | null;
}

/* -------- Contratos -------- */
export interface Contrato {
  id: number;
  unidad: number;
  duenno?: number | null;      // ojo: "duenno"
  inquilino?: number | null;
  descripcion?: string;
  start: string;               // YYYY-MM-DD
  end?: string | null;
  documento?: string;          // URL del archivo si el API lo devuelve así
  monto_mensual?: string;      // Decimal en string
  is_active?: boolean;
}
export interface CreateContratoPayload {
  unidad: number;
  duenno?: number | null;
  inquilino?: number | null;
  descripcion?: string;
  start: string;
  end?: string | null;
  monto_mensual?: string;
}
