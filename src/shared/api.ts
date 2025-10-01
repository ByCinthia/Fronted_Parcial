// src/shared/api.ts
const API_BASE = import.meta.env.VITE_API_URL;

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

export async function fetchJson<T>(
  endpoint: string,
  init?: RequestInit & { csrf?: boolean }
): Promise<T> {
  const headers = new Headers(init?.headers);
  const withCreds: RequestInit = { ...init };


  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const isFormData = init?.body instanceof FormData;
  if (!isFormData && init?.method && init.method !== "GET") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  // añadir token JWT si existe
  const token = localStorage.getItem("access");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (init?.csrf) {
    const token = getCookie("csrftoken");
    if (token) headers.set("X-CSRFToken", token);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...withCreds, headers });
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
