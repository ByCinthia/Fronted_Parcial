export type Pagination<T> = {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
};

export type Copropietario = {
  id: number;
  full_name: string;
  email?: string;
  vivienda_code?: string; // p.e. "A-101"
  role: "TITULAR" | "AUTORIZADO";
  phone?: string;
  created_at?: string;
};

export type Vehiculo = {
  id: number;
  placa: string;
  tipo: "RESIDENTE" | "VISITANTE" | "SERVICIO";
  vivienda_code?: string;
  marca?: string;
  modelo?: string;
  created_at?: string;
};

export type Mascota = {
  id: number;
  nombre: string;
  especie?: string; // "Perro" | "Gato"
  raza?: string;
  vivienda_code?: string;
  created_at?: string;
};
