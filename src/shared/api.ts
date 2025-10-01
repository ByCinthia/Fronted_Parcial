// src/shared/api.ts
const API_BASE = import.meta.env.VITE_API_URL;

export async function fetchJson<T>(
  endpoint: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);

  // Aseguramos Accept y Content-Type
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const isFormData = init?.body instanceof FormData;
  if (!isFormData && init?.method && init.method !== "GET") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  // Adjuntar token JWT si existe
  const token = localStorage.getItem("access");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Hacemos la petición
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
    credentials: "include", // ⬅️ opcional si no manejas cookies
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
