// src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../shared/auth";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const { signIn, loading } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const can = u.trim().length > 0 && p.trim().length >= 6 && !loading;
  const navigate = useNavigate();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await signIn(u, p);
      navigate("/app");
    } catch {
      setError("Credenciales inválidas o servidor no disponible");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card neon">
        <h1 className="login-title">CONDO SMART</h1>
        <p className="login-subtitle">Accede con tus credenciales</p>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <input
            type="text"
            placeholder="Usuario"
            value={u}
            onChange={(e) => setU(e.target.value)}
            className="login-input"
            aria-label="Usuario"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="login-input"
            aria-label="contraseña"
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!can}
            className="login-button"
            aria-disabled={!can}
          >
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
