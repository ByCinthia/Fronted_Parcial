// src/pages/vivienda/types.ts

export type Pagination<T> = {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
};

/* -------------------------
   Copropietarios
------------------------- */
export type Copropietario = {
  id: number;
  full_name: string;
  email?: string;
  vivienda_code?: string; // p.e. "A-101"
  role: "TITULAR" | "AUTORIZADO";
  phone?: string;
  created_at?: string;
};

/* -------------------------
   Unidades
------------------------- */
export interface Unidad {
  id: number;
  code: string;       // ej: "A-101"
  is_active: boolean;
  created_at?: string;
}

export interface CreateUnidadPayload {
  code: string;
  is_active: boolean;
}

/* -------------------------
   Asignar residencia
------------------------- */
export interface AsignacionResidencia {
  id: number;
  user: number;           // id del usuario
  unidad: number;         // id de la unidad
  is_owner: boolean;
  tipo_ocupacion: "propietario" | "inquilino" | "otro";
  status: "activa" | "inactiva";
  start: string;          // fecha inicio ISO
}

export interface CreateAsignacionResidenciaPayload {
  user: number;
  unidad: number;
  is_owner: boolean;
  tipo_ocupacion: "propietario" | "inquilino" | "otro";
  status: "activa" | "inactiva";
  start: string;
}

/* -------------------------
   Vehículos
------------------------- */
export type ResponsableId = number;

export interface Vehiculo {
  id: number;
  unidad: number;             // id de la unidad
  responsable: ResponsableId; // id usuario
  placa: string;
  marca?: string;
  color?: string;
  observacion?: string;
  created_at?: string;
}

export interface CreateVehiculoPayload {
  unidad: number;
  responsable: number;
  placa: string;
  marca?: string;
  color?: string;
  observacion?: string;
}

/* -------------------------
   Mascotas
------------------------- */
export interface Mascota {
  id: number;
  unidad: number;
  responsable: number;
  nombre: string;
  tipo: string;             // perro | gato | etc
  raza?: string;
  activo: boolean;
  desde: string;            // fecha ISO
  created_at?: string;
}

export interface CreateMascotaPayload {
  unidad: number;
  responsable: number;
  nombre: string;
  tipo: string;
  raza?: string;
  activo: boolean;
  desde: string;
}

/* -------------------------
   Contrato de alquiler
------------------------- */
export interface ContratoAlquiler {
  id: number;
  unidad: number;
  inquilino: number;
  fecha_inicio: string;     // ISO
  monto_mensual: string;    // ej "350.00"
  garantia: string;         // ej "500.00"
  activo: boolean;
}

export interface CreateContratoAlquilerPayload {
  unidad: number;
  inquilino: number;
  fecha_inicio: string;
  monto_mensual: string;
  garantia: string;
  activo: boolean;
}

/* -------------------------
   Contrato general (dueño - inquilino)
------------------------- */
export interface Contrato {
  id: number;
  unidad: number;
  duenno: number;
  inquilino: number;
  start: string;             // ISO
  monto_mensual: string;
  is_active: boolean;
  descripcion?: string;
}

export interface CreateContratoPayload {
  unidad: number;
  duenno: number;
  inquilino: number;
  start: string;
  monto_mensual: string;
  is_active: boolean;
  descripcion?: string;
}
