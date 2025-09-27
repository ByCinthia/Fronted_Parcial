// src/pages/Dashboard.tsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Protected from "../shared/Protected";
import { useAuth } from "../shared/auth";
import "../styles/dashboard.css";

/* lazy-load de páginas (mantén los paths según tu estructura) */
const CopropietariosPage = lazy(() => import("./vivienda/copropietarios"));
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
  path: string; // path relativo dentro de /app, ej "vivienda" o "vivienda/copropietarios"
  roles?: Role[];
  children?: MenuItem[];
};

/* -------------------------
   MENU (un solo array, tipado)
   ------------------------- */
export const MENU: MenuItem[] = [
  { id: "home", label: "Inicio", path: "home", roles: ["ADMIN", "GUARD", "RESIDENT"] },

  {
    id: "vivienda",
    label: "Vivienda",
    path: "vivienda",
    roles: ["ADMIN"],
    children: [
      { id: "copropietarios", label: "Copropietarios", path: "vivienda/copropietarios", roles: ["ADMIN"] },
      { id: "residentes", label: "Residentes", path: "vivienda/residentes", roles: ["ADMIN"] },
      { id: "vehiculos", label: "Vehículos", path: "vivienda/vehiculos", roles: ["ADMIN", "GUARD"] },
      { id: "mascotas", label: "Mascotas", path: "vivienda/mascotas", roles: ["ADMIN"] },
    ],
  },

  {
    id: "seguridad",
    label: "Seguridad",
    path: "seguridad",
    roles: ["ADMIN", "GUARD"],
    children: [
      { id: "accesos", label: "Control accesos", path: "seguridad/accesos", roles: ["ADMIN", "GUARD"] },
      { id: "visitantes", label: "Visitantes", path: "seguridad/visitantes", roles: ["ADMIN", "GUARD", "RESIDENT"] },
      { id: "parqueo", label: "Parqueo", path: "seguridad/parqueo", roles: ["ADMIN", "GUARD"] },
      { id: "alertas", label: "Alertas / IA", path: "seguridad/alertas", roles: ["ADMIN"] },
    ],
  },

  {
    id: "reservas",
    label: "Reservas",
    path: "reservas",
    roles: ["ADMIN", "RESIDENT"],
    children: [
      { id: "config", label: "Configuración", path: "reservas/config", roles: ["ADMIN"] },
      { id: "list", label: "Reservas", path: "reservas/list", roles: ["ADMIN", "RESIDENT"] },
      { id: "tarifas", label: "Tarifas & inventario", path: "reservas/tarifas", roles: ["ADMIN"] },
    ],
  },

  {
    id: "finanzas",
    label: "Finanzas",
    path: "finanzas",
    roles: ["ADMIN"],
    children: [
      { id: "expensas", label: "Expensas", path: "finanzas/expensas", roles: ["ADMIN", "RESIDENT"] },
      { id: "pagos", label: "Pagos", path: "finanzas/pagos", roles: ["ADMIN"] },
      { id: "multas", label: "Multas", path: "finanzas/multas", roles: ["ADMIN"] },
      { id: "recibos", label: "Recibos", path: "finanzas/recibos", roles: ["ADMIN"] },
      { id: "reportes", label: "Reportes", path: "finanzas/reportes", roles: ["ADMIN"] },
    ],
  },

  {
    id: "servicios",
    label: "Servicios",
    path: "servicios",
    roles: ["ADMIN"],
    children: [
      { id: "programacion", label: "Programación", path: "servicios/programacion", roles: ["ADMIN"] },
      { id: "costos", label: "Costos", path: "servicios/costos", roles: ["ADMIN"] },
    ],
  },

  {
    id: "comunicacion",
    label: "Comunicación",
    path: "comunicacion",
    roles: ["ADMIN", "RESIDENT"],
    children: [
      { id: "comunicados", label: "Comunicados", path: "comunicacion/comunicados", roles: ["ADMIN"] },
      { id: "lecturas", label: "Lecturas", path: "comunicacion/lecturas", roles: ["ADMIN"] },
      { id: "recordatorios", label: "Recordatorios", path: "comunicacion/recordatorios", roles: ["ADMIN"] },
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
    if (!userRole) return true; // en dev permitimos mostrar todo si no hay role
    return item.roles!.includes(userRole);
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
                // botón que alterna el submenú (no navega)
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
                    <div className="icon" aria-hidden>
                      {item.label.charAt(0)}
                    </div>
                    <div className="label">{item.label}</div>
                  </div>
                  <div className="right">
                    <Chevron open={!!openKeys[item.id]} />
                  </div>
                </div>
              ) : (
                // item simple -> Link directo a /app/${item.path}
                <Link to={`/app/${item.path}`} className={`nav-item ${active ? "active" : ""}`} onClick={onCloseMobile} role="link">
                  <div className="left">
                    <div className="icon" aria-hidden>
                      {item.label.charAt(0)}
                    </div>
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
                          <div className="icon" aria-hidden>
                            •
                          </div>
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
const Topbar: React.FC<{ onToggle: () => void; onOpenMobile: () => void }> = ({ onToggle, onOpenMobile }) => {
  return (
    <header className="topbar">
      <div className="left">
        <button
          className="btn-icon"
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth <= 900) {
              onOpenMobile();
            } else {
              onToggle();
            }
          }}
          aria-label="toggle menu"
        >
          ☰
        </button>
        <div className="title">Panel</div>
      </div>

      <div className="right">
        <input className="search-input" placeholder="Buscar..." aria-label="buscar" />
        <button className="btn-icon" type="button" aria-label="notificaciones">
          🔔
        </button>
      </div>
    </header>
  );
};

/* -------------------------
   Placeholders
   ------------------------- */
const Home: React.FC = () => (
  <div>
    <div className="breadcrumbs">Inicio</div>
    <div className="grid cols-3">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Usuarios</div>
        </div>
        <div className="stat">
          <div className="value">1,234</div>
          <div className="label">Activos</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Reservas</div>
        </div>
        <div className="stat">
          <div className="value">42</div>
          <div className="label">Hoy</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Incidentes</div>
        </div>
        <div className="stat">
          <div className="value">3</div>
          <div className="label">Sin resolver</div>
        </div>
      </div>
    </div>
  </div>
);

const Vivienda: React.FC = () => (
  <div>
    <div className="breadcrumbs">Módulo Vivienda</div>
    <div className="card">
      <h3 className="card-title">Resumen</h3>
      <p className="text-muted">Aquí irán las acciones principales del módulo vivienda.</p>
    </div>
  </div>
);

/* (puedes eliminar los placeholders de Copropietarios/Vehiculos si usas las páginas lazy importadas) */
const Seguridad: React.FC = () => (
  <div>
    <div className="breadcrumbs">Seguridad</div>
    <div className="card">
      <h3 className="card-title">Monitoreo</h3>
    </div>
  </div>
);

const Reservas: React.FC = () => (
  <div>
    <div className="breadcrumbs">Reservas</div>
    <div className="card">
      <h3 className="card-title">Reservas</h3>
    </div>
  </div>
);

const Finanzas: React.FC = () => (
  <div>
    <div className="breadcrumbs">Finanzas</div>
    <div className="card">
      <h3 className="card-title">Finanzas</h3>
    </div>
  </div>
);

const Reportes: React.FC = () => (
  <div>
    <div className="breadcrumbs">Reportes</div>
    <div className="card">
      <h3 className="card-title">Reportes</h3>
    </div>
  </div>
);

/* -------------------------
   Dashboard principal
   ------------------------- */
export default function Dashboard() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "1";
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();

  // cerrar drawer móvil al cambiar de ruta
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  }, [location.pathname, mobileOpen]);

  useEffect(() => {
    try {
      localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error storing collapsed state:", e);
    }
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
              <Route path="/" element={<Navigate to="/app/home" replace />} />
              <Route path="/app/home" element={<Home />} />

              {/* Lazy-loaded pages */}
              <Route
                path="/vivienda/copropietarios"
                element={
                  <Suspense fallback={<div>Cargando Copropietarios...</div>}>
                    <CopropietariosPage />
                  </Suspense>
                }
              />
              <Route
                path="/vivienda/vehiculos"
                element={
                  <Suspense fallback={<div>Cargando Vehículos...</div>}>
                    <VehiculosPage />
                  </Suspense>
                }
              />
              <Route
                path="/vivienda/mascotas"
                element={
                  <Suspense fallback={<div>Cargando Mascotas...</div>}>
                    <MascotasPage />
                  </Suspense>
                }
              />

              {/* Otros módulos (placeholders) */}
               <Route path="vivienda" element={<Vivienda />} />
               <Route path="seguridad" element={<Seguridad />} />
               <Route path="reservas" element={<Reservas />} />
               <Route path="finanzas" element={<Finanzas />} />
               <Route path="reportes" element={<Reportes />} />
            </Route>
          </Routes>
        </div>
      </div>

      {/* overlay para mobile drawer */}
      <div className="overlay" onClick={closeMobile} />
    </div>
  );
}
