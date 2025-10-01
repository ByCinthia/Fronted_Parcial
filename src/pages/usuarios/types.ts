export interface AppUser {
  id: number;
  username: string;
  password?: string; 
  ci?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  groups: string[];
  photo?: string; // url o base64
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
