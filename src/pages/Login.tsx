import React, { useState } from "react";
import { useAuth } from "../shared/auth";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const { signIn, loading } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const can = u.trim().length > 0 && p.trim().length >= 6 && !loading;
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await signIn(u, p);
    navigate("/app");
  }

  return (
    // usamos la clase .login-page que define el background en CSS
    <div className="login-page">
      {/* Tarjeta centrada — usa tu CSS (.login-card) */}
      <div className="login-card">
        <h1 className="login-title">CONDO SMART</h1>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <input
            type="text"
            placeholder="correo electrónico"
            value={u}
            onChange={(e) => setU(e.target.value)}
            className="login-input"
            aria-label="correo electrónico"
          />
          <input
            type="password"
            placeholder="contraseña"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="login-input"
            aria-label="contraseña"
          />
          <button
            type="submit"
            disabled={!can}
            className="login-button"
            aria-disabled={!can}
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <div className="text-center text-gray-500 text-sm mt-6">Conectarse con:</div>

        <div className="flex justify-center gap-6 mt-6">
          <button type="button" className="social-button text-blue-600" aria-label="Conectar con Facebook">
            f
          </button>
          <button type="button" className="social-button text-red-500" aria-label="Conectar con Google">
            G
          </button>
        </div>

        <div className="text-center text-sm mt-8">
          <a className="text-purple-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
