// src/pages/Dashboard.tsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Protected from "../shared/Protected";
import { useAuth } from "../shared/auth";
import "../styles/dashboard.css";
// 👇 Usa el nombre correcto del archivo: Usuario.tsx (con mayúscula)
const UsuarioPage = lazy(() => import("./usuarios/usuario"));
const VehiculosPage = lazy(() => import("./vivienda/vehiculos"));
const MascotasPage = lazy(() => import("./vivienda/mascotas"));

/** Tipos locales */
type Role = "ADMIN" | "GUARD" | "RESIDENT";

type AuthUser = {
  id: string;
  email?: string;
  full_name?: string;
  role?: Role;
};

type MenuItem = {
  id: string;
  label: string;
  path: string; // relativo al /app, ej "vivienda/vehiculos"
  roles?: Role[];
  children?: MenuItem[];
};

/* -------------------------
   MENU (limpio según solicitud)
   ------------------------- */
export const MENU: MenuItem[] = [
  {
    id: "usuarios",
    label: "Usuarios",
    path: "usuarios",
    roles: ["ADMIN", "GUARD"],
    children: [
      // Solo conservar "Crear usuario" y "Ver usuarios"
      { id: "crearUsuario", label: "Crear usuario", path: "usuarios/crear", roles: ["ADMIN"] },
      { id: "verUsuarios", label: "Ver usuarios", path: "usuarios/list", roles: ["ADMIN"] },
    ],
  },

  {
    id: "vivienda",
    label: "Vivienda",
    path: "vivienda",
    roles: ["ADMIN"],
    children: [
      { id: "crearUnidad", label: "Crear unidad", path: "vivienda/crear-unidad", roles: ["ADMIN"] },
      { id: "asignarResidencia", label: "Asignar residencia", path: "vivienda/asignar", roles: ["ADMIN"] },
      { id: "unidad", label: "Unidad", path: "vivienda/unidad", roles: ["ADMIN", "GUARD", "RESIDENT"] },
      { id: "registrarVehiculos", label: "Registrar vehículos", path: "vivienda/registrar-vehiculos", roles: ["ADMIN", "GUARD"] },
      { id: "registrarMascota", label: "Registrar mascota", path: "vivienda/registrar-mascota", roles: ["ADMIN"] },
      { id: "contratoAlquiler", label: "Contrato alquiler", path: "vivienda/contrato-alquiler", roles: ["ADMIN"] },
    ],
  },

  // Otros módulos mínimos (placeholder)
  {
    id: "seguridad",
    label: "Seguridad",
    path: "seguridad",
    roles: ["ADMIN","GUARD"],
    children: [
      { id: "accesos", label: "Control accesos", path: "seguridad/accesos", roles: ["ADMIN","GUARD"] },
    ],
  },

  { id: "reportes", label: "Reportes", path: "reportes", roles: ["ADMIN"] },
];

/* -------------------------
   Small UI bits
   ------------------------- */
const Chevron: React.FC<{ open?: boolean }> = ({ open }) => (
  <svg className={`w-4 h-4 transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function findMenuItemByPath(pathRel: string): MenuItem | undefined {
  const queue = [...MENU];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.path === pathRel) return cur;
    if (cur.children) queue.push(...cur.children);
  }
  return undefined;
}

/* -------------------------
   Sidebar
   ------------------------- */
const Sidebar: React.FC<{
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}> = ({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) => {
  const auth = useAuth();
  const user = auth.user as AuthUser | null;
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      MENU.forEach((m) => {
        if (m.children?.some((c) => location.pathname.startsWith(`/app/${c.path}`))) {
          setOpenKeys((s) => ({ ...s, [m.id]: true }));
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Sidebar init error:", e);
    }
  }, [location.pathname]);

  const userRole = user?.role;
  const canView = (item: MenuItem) => {
    if (!item.roles) return true;
    if (!userRole) return true;
    return item.roles.includes(userRole);
  };

  const sidebarClass = ["sidebar", collapsed ? "collapsed" : "", mobileOpen ? "open" : ""].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClass} aria-hidden={!mobileOpen && typeof window !== "undefined" && window.innerWidth < 900}>
      <div className="brand">
        <div className="logo">CS</div>
        <div className="label">CONDO SMART</div>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
          style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer" }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav>
        {MENU.map((item) => {
          if (!canView(item)) return null;
          const active = location.pathname.startsWith(`/app/${item.path}`);

          return (
            <div key={item.id} className="nav-group">
              {item.children?.length ? (
                <div
                  className={`nav-item ${active ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenKeys((s) => ({ ...s, [item.id]: !s[item.id] }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setOpenKeys((s) => ({ ...s, [item.id]: !s[item.id] }));
                  }}
                  aria-expanded={!!openKeys[item.id]}
                >
                  <div className="left">
                    <div className="icon" aria-hidden>{item.label.charAt(0)}</div>
                    <div className="label">{item.label}</div>
                  </div>
                  <div className="right"><Chevron open={!!openKeys[item.id]} /></div>
                </div>
              ) : (
                <Link to={`/app/${item.path}`} className={`nav-item ${active ? "active" : ""}`} onClick={onCloseMobile} role="link">
                  <div className="left">
                    <div className="icon" aria-hidden>{item.label.charAt(0)}</div>
                    <div className="label">{item.label}</div>
                  </div>
                </Link>
              )}

              {item.children && openKeys[item.id] && (
                <div className="sub-menu" role="menu">
                  {item.children.map((child) => {
                    if (!canView(child)) return null;
                    const cActive = location.pathname === `/app/${child.path}`;
                    return (
                      <Link key={child.id} to={`/app/${child.path}`} className={`nav-item ${cActive ? "active" : ""}`} onClick={onCloseMobile}>
                        <div className="left">
                          <div className="icon" aria-hidden>{child.label.charAt(0)}</div>
                          <div className="label">{child.label}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>{user?.full_name ?? user?.email ?? user?.id}</div>
        <div className="text-muted">{user?.role ?? "sin rol"}</div>
      </div>
    </aside>
  );
};

/* -------------------------
   Topbar
   ------------------------- */
const Topbar: React.FC<{ onToggle: () => void; onOpenMobile: () => void }> = ({ onToggle, onOpenMobile }) => (
  <header className="topbar">
    <div className="left">
      <button
        className="btn-icon"
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.innerWidth <= 900) onOpenMobile();
          else onToggle();
        }}
        aria-label="toggle menu"
      >
        ☰
      </button>
      <div className="title">Panel</div>
    </div>

    <div className="right">
      <input className="search-input" placeholder="Buscar..." aria-label="buscar" />
      <button className="btn-icon" type="button" aria-label="notificaciones">🔔</button>
    </div>
  </header>
);

/* -------------------------
   EndpointViewer — ejemplos para rutas conservadas
   ------------------------- */
const EndpointViewer: React.FC = () => {
  const location = useLocation();
  const rel = location.pathname.replace(/^\/app\/?/, "");
  const item = findMenuItemByPath(rel);

  const examples: Record<string, Record<string, unknown>> = {
    // Usuarios
    "usuarios/crear": {
      username: "fd",
      password: "pass12345",
      ci: "3524",
      first_name: "Juan",
      last_name: "Ramos",
      email: "juan@example.com",
      phone: "555-100",
      is_active: true,
      groups: ["admin"],
    },

    // Vivienda
    "vivienda/crear-unidad": { code: "A-101", is_active: true },
    "vivienda/asignar": {
      user: 2,
      unidad: 1,
      is_owner: true,
      tipo_ocupacion: "propietario",
      status: "activa",
      start: "2025-01-01",
    },
    "vivienda/registrar-vehiculos": {
      unidad: 1,
      responsable: 2,
      placa: "BAC123",
      marca: "Toyota",
      color: "Rojo",
      observacion: "N/A",
    },
    "vivienda/registrar-mascota": {
      unidad: 1,
      responsable: 2,
      nombre: "Rocky",
      tipo: "perro",
      raza: "Labrador",
      activo: true,
      desde: "2025-02-01",
    },
  };

  if (!item) {
    return (
      <div>
        <div className="breadcrumbs">Ayuda</div>
        <div className="card"><p>Selecciona una opción del menú para ver la ficha/ejemplo (si la página no existe aún, verás esta ayuda).</p></div>
      </div>
    );
  }

  const example = examples[item.path];

  return (
    <div>
      <div className="breadcrumbs">{item.label}</div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{item.label}</h3>
        <p><strong>Ruta (sugerida):</strong> <code>/api/v1/{item.path}</code></p>
        <div style={{ marginTop: 8 }}>
          <strong>Descripción</strong>
          <p className="text-muted">Ficha de ayuda: aqui puedes documentar la funcionalidad o mostrar un payload de ejemplo.</p>
        </div>

        {example && (
          <>
            <div style={{ marginTop: 8 }}><strong>Ejemplo de payload</strong></div>
            <pre style={{ background: "#0f172a10", padding: 12, borderRadius: 8, overflowX: "auto" }}>
              {JSON.stringify(example, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

/* -------------------------
   Placeholders / Summaries
   ------------------------- */
const Home: React.FC = () => (
  <div>
    <div className="breadcrumbs">Usuarios</div>
    <div className="grid cols-3">
      <div className="card"><div className="card-header"><div className="card-title">Usuarios</div></div><div className="stat"><div className="value">1,234</div><div className="label">Activos</div></div></div>
      <div className="card"><div className="card-header"><div className="card-title">Reservas</div></div><div className="stat"><div className="value">42</div><div className="label">Hoy</div></div></div>
      <div className="card"><div className="card-header"><div className="card-title">Incidentes</div></div><div className="stat"><div className="value">3</div><div className="label">Sin resolver</div></div></div>
    </div>
  </div>
);

const ViviendaSummary: React.FC = () => (
  <div>
    <div className="breadcrumbs">Módulo Vivienda</div>
    <div className="card"><h3 className="card-title">Resumen</h3><p className="text-muted">Acciones del módulo vivienda: crear unidad, asignar residencia, registrar vehículos/mascotas, contrato alquiler.</p></div>
  </div>
);

/* -------------------------
   Dashboard principal
   ------------------------- */
export default function Dashboard() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem("sidebar_collapsed") === "1"; } catch (e) { console.error(e); return false; }
  });

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  }, [location.pathname, mobileOpen]);

  useEffect(() => {
    try { localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0"); } catch (e) { console.error("Error storing collapsed state:", e); }
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed((c) => !c);
  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const appClass = ["app-layout", mobileOpen ? "drawer-open" : ""].filter(Boolean).join(" ");

  return (
    <div className={appClass}>
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggleCollapse={toggleCollapse} onCloseMobile={closeMobile} />

      <div className="main-content">
        <Topbar onToggle={toggleCollapse} onOpenMobile={openMobile} />

        <div className="content-container">
          <Routes>
  <Route element={<Protected />}>
    {/* redirección inicial */}
    <Route path="/" element={<Navigate to="home" replace />} />

    {/* home */}
    <Route path="home" element={<Home />} />

    {/* usuarios */}
    <Route path="usuarios" element={<Navigate to="usuarios/list" replace />} />
    <Route
      path="usuarios/*"
      element={
        <Suspense fallback={<div>Cargando Usuarios...</div>}>
          <UsuarioPage />
        </Suspense>
      }
    />

    {/* vivienda */}
<Route
  path="vivienda/registrar-vehiculos"
  element={
    <Suspense fallback={<div>Cargando Vehículos...</div>}>
      <VehiculosPage />
    </Suspense>
  }
/>

<Route
  path="vivienda/registrar-mascota"
  element={
    <Suspense fallback={<div>Cargando Mascotas...</div>}>
      <MascotasPage />
    </Suspense>
  }
/>

<Route path="vivienda" element={<ViviendaSummary />} />

    {/* fallback */}
    <Route path="*" element={<EndpointViewer />} />
  </Route>
</Routes>

        </div>
      </div>

      <div className="overlay" onClick={closeMobile} />
    </div>
  );
}
