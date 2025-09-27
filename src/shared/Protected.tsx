// src/shared/Protected.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./auth";

export default function Protected() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
