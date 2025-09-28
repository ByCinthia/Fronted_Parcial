// src/shared/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { MENU } from "./menu";
/** Tipos */
type Role = "ADMIN" | "GUARD" | "RESIDENT";

type MenuItem = {
  id: string;
  label: string;
  path: string;
  roles?: Role[];
  children?: MenuItem[];
};


/* -------------------------
   Sidebar
   ------------------------- */
interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) => {
  const auth = useAuth();
  const user = auth.user as { id: string; email?: string; full_name?: string; role?: Role } | null;
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({
  usuarios: true,
  vivienda: true,
  seguridad: true,
  reportes: true,
});

 useEffect(() => {
  const newKeys: Record<string, boolean> = {};
  MENU.forEach((m) => {
    if (m.children?.some((c) => location.pathname.startsWith(`/app/${c.path}`))) {
      newKeys[m.id] = true;
    }
  });
  setOpenKeys(newKeys);
}, [location.pathname]);


   const userRole = user?.role;

   // si hay backend: 
  //const canView = (item: MenuItem) => !item.roles || (userRole && item.roles.includes(userRole));
 
  const canView = (item: MenuItem) => {
  if (!item.roles) return true; // si no tiene roles definidos → mostrar
  if (!userRole) return true;   // si no hay usuario autenticado → mostrar igual
  return item.roles.includes(userRole);
};

  const sidebarClass = ["sidebar", collapsed ? "collapsed" : "", mobileOpen ? "open" : ""].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClass}>
      <div className="brand">
        <div className="logo">CS</div>
        <div className="label">CONDO SMART</div>
        <button
          type="button"
          onClick={onToggleCollapse}
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
              {item.children ? (
                <div
                  className={`nav-item ${active ? "active" : ""}`}
                  role="button"
                  onClick={() => setOpenKeys((s) => ({ ...s, [item.id]: !s[item.id] }))}
                >
                  <div className="left">
                    <div className="icon">{item.label.charAt(0)}</div>
                    <div className="label">{item.label}</div>
                  </div>
                </div>
              ) : (
                <Link
                  to={`/app/${item.path}`}
                  className={`nav-item ${active ? "active" : ""}`}
                  onClick={onCloseMobile}
                >
                  <div className="left">
                    <div className="icon">{item.label.charAt(0)}</div>
                    <div className="label">{item.label}</div>
                  </div>
                </Link>
              )}

              {item.children && openKeys[item.id] && (
                <div className="sub-menu">
                  {item.children.map(
                    (child) =>
                      canView(child) && (
                        <Link
                          key={child.id}
                          to={`/app/${child.path}`}
                          className={`nav-item ${location.pathname === `/app/${child.path}` ? "active" : ""}`}
                          onClick={onCloseMobile}
                        >
                          <div className="left">
                            <div className="icon">{child.label.charAt(0)}</div>
                            <div className="label">{child.label}</div>
                          </div>
                        </Link>
                      )
                  )}
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

export default Sidebar;
