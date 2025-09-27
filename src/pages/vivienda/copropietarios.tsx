// src/pages/vivienda/copropietarios.tsx
import React, { useEffect, useState } from "react";
import type { Copropietario, Pagination } from "./types";
import * as svc from "./service";

export default function CopropietariosPage() {
  const [items, setItems] = useState<Copropietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await svc.fetchCopropietarios();
        // soporta { results: [...] } o una lista directa
        const list: Copropietario[] = Array.isArray((data as unknown) as Copropietario[])
          ? ((data as unknown) as Copropietario[])
          : ((data as Pagination<Copropietario>).results ?? []);
        if (mounted) setItems(list);
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
          setItems([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Cargando copropietarios...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Copropietarios</h2>
      </div>

      <table className="table" style={{ width: "100%" }}>
        <thead>
          <tr><th>Nombre</th><th>Vivienda</th><th>Rol</th><th>Contacto</th></tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>No hay copropietarios.</td>
            </tr>
          )}
          {items.map(it => (
            <tr key={it.id}>
              <td>{it.full_name}</td>
              <td>{it.vivienda_code}</td>
              <td>{it.role}</td>
              <td>{it.email ?? it.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
