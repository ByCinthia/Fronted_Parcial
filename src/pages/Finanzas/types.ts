/* -------------------------
   Cargos
------------------------- */
export interface Cargo {
  id?: number;
  unidad: number;
  concepto: string;
  descripcion: string;
  monto: string;
  periodo: string;
  estado: "pendiente" | "pagado"; // Puede estar pendiente o pagado
  saldo: string;
  
  creado_por?: string; // opcional: solo visible si la API lo manda
}

export interface CreateCargoPayload {
  unidad: number;
  concepto: string;
  descripcion: string;
  monto: string;
  periodo: string;
  estado: "pendiente";
  saldo: string;
}

/* -------------------------
   Pagos
------------------------- */
export interface Pago {
  id: number;
  user: number;
  unidad: number;
  fecha: string;
  monto_total: string;
  metodo: "efectivo" | "tarjeta" | "transferencia"; // Métodos de pago posibles
  estado: "confirmado" | "pendiente"; // Puede estar confirmado o pendiente
  referencia: string;
}

export interface CreatePagoPayload {
  user: number;
  unidad: number;
  fecha: string;
  monto_total: string;
  metodo: "efectivo" | "tarjeta" | "transferencia";
  estado: "pendiente" | "confirmado";   // 👈 ahora acepta ambos
  referencia: string;
}

/* -------------------------
   Aplicar Pago a Cargo
------------------------- */

export interface AplicarPago {
  pago: number; // ID del pago
  cargo: number; // ID del cargo
  monto: string; // ejemplo "80.00"
}


