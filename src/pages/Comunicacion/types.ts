// src/pages/Comunicacion/types.ts

export interface Comunicado {
  id?: number;
  titulo: string;
  cuerpo: string;
  publicado_at: string;
  creado_por?: number; // ID usuario creador
  leidos?: number;     // contador de leídos
  total?: number;      // total de usuarios destinatarios
}

export interface Notificacion {
  id?: number;
  user: number;
  tipo: string; // ej: "evento", "alerta"
  comunicado?: number | null;
  titulo: string;
  cuerpo: string;
  publicado_at: string;
}
