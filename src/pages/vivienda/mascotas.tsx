import React, { useEffect, useState } from "react";
import type { Mascota, Pagination } from "./types";
import * as svc from "./service";

export default function MascotasPage() {
  const [items, setItems] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await svc.fetchMascotas();
        const list: Mascota[] = Array.isArray((data as unknown) as Mascota[]) ? ((data as unknown) as Mascota[]) : ((data as Pagination<Mascota>).results ?? []);
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

  if (loading) return <div>Cargando mascotas...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Mascotas</h2>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.length === 0 && <div className="text-muted">No hay mascotas registradas.</div>}
        {items.map((m) => (
          <div className="card" key={m.id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{m.nombre}</strong>
              <span className="badge">{m.especie}</span>
            </div>
            <div className="text-muted">{m.raza} · {m.vivienda_code}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
