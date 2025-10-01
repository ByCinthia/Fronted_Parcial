export interface AppUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  ci?: string;
  phone?: string;
  is_active: boolean;
  groups: string[];
  photo_url?: string; // el backend la devuelve
}


export interface CreateUserPayload {
  username: string;
  password: string;
  ci?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  groups: string[];
}
