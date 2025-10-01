/* -------------------------
   Cargos
------------------------- */
export interface Cargo {
  id: number;
  unidad: number;
  concepto: "cuota" | "multa" | "deposito" | "otro";
  descripcion?: string;
  monto: string;
  periodo: string;
  estado: "pendiente" | "parcial" | "pagado" | "anulado";
  saldo: string;
  creado_por?: string;
}

export interface CreateCargoPayload {
  unidad: number;
  concepto?: "cuota" | "multa" | "deposito" | "otro";
  descripcion?: string;
  monto: string;
  periodo: string;
}

/* -------------------------
   Pagos
------------------------- */
export interface Pago {
  id: number;
  user: number;
  fecha: string;
  metodo: "efectivo" | "tarjeta" | "transferencia" | "otro";
  estado: "pendiente" | "confirmado" | "fallido";
  observacion?: string;
  comprobante_key?: string | null;
  monto_total: string; // calculado por backend
}

export interface CreatePagoPayload {
  user: number;
  fecha: string;
  metodo: "efectivo" | "tarjeta" | "transferencia" | "otro";
  estado?: "pendiente" | "confirmado";
  observacion?: string;
}

/* -------------------------
   Aplicar Pago a Cargo
------------------------- */
export interface AplicarPago {
  id?: number;
  pago: number;
  cargo: number;
  monto: string;
}
