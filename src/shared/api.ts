// src/shared/api.ts
const API_BASE = import.meta.env.VITE_API_URL;
const AUTH_PATHS = ["/api/v1/token/", "/api/v1/token/refresh/"];

export async function fetchJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const isFormData = init?.body instanceof FormData;
  if (!isFormData && init?.method && init.method !== "GET") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  // No mandes Authorization en endpoints de auth
  const shouldSendAuth = !AUTH_PATHS.includes(endpoint);
  const token = localStorage.getItem("access");
  if (shouldSendAuth && token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
    credentials: "omit",            // ⬅️ clave para evitar el choque CORS
    // mode: "cors", // opcional; fetch lo usa por defecto para cross-origin
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = (data && (data.detail || JSON.stringify(data))) || "";
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
