// src/pages/Dashboard.tsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Protected from "../shared/Protected";
import Sidebar from "../shared/Sidebar";
import "../styles/dashboard.css";

// Páginas
const UsuarioPage = lazy(() => import("./Usuarios/usuario"));
const UnidadPage = lazy(() => import("./Vivienda/unidad"));
const VehiculosPage = lazy(() => import("./Vivienda/vehiculos"));
const MascotasPage = lazy(() => import("./Vivienda/mascotas"));
const ContratoPage = lazy(() => import("./Vivienda/contrato"));
const CargoPage = lazy(() => import("./Finanzas/cargo"));
const PagoPage = lazy(() => import("./Finanzas/pago"));
const AplicarPagoPage = lazy(() => import("./Finanzas/aplicarpago"));
const AccesoPage = lazy(()=> import ("./Seguridad/acceso"));
const VisitaPage =lazy(()=> import ("./Seguridad/visita"));
const IncidentesPage = lazy(() => import("./Seguridad/incidente"));
const EvidenciasPage = lazy(() => import("./Seguridad/evidencia"));
const ComunicadoPage = lazy(() => import("./Comunicacion/comunicado"));
const NotificacionPage = lazy(() => import("./Comunicacion/notificacion"));
const AreaPage = lazy(() => import("./Reservas/area"));
const SuministroPage = lazy(() => import("./Reservas/suministro"));
const ReservaPage = lazy(() => import("./Reservas/reserva"));
import ServicioPage from "./Mantenimiento/servicio";
import TicketPage from "./Mantenimiento/ticket";

/* -------------------------
   Home (bienvenida)
   ------------------------- */
const Home: React.FC = () => {
  return (
    <div>
      <div className="breadcrumbs">Inicio</div>
      <div className="card">
        <h2>¡Bienvenido!</h2>
        <p className="text-muted">Selecciona un módulo en el menú lateral para comenzar a trabajar.</p>
      </div>
    </div>
  );
};

/* -------------------------
   Dashboard principal
   ------------------------- */
export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  }, [location.pathname, mobileOpen]);

  const toggleCollapse = () => setCollapsed((c) => !c);
  const closeMobile = () => setMobileOpen(false);
  const openMobile = () => setMobileOpen(true);
  const appClass = ["app-layout", mobileOpen ? "drawer-open" : ""].filter(Boolean).join(" ");

  //  ENCABEZADO
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
      >
        ☰
      </button>
      <div className="title">Panel</div>
    </div>
    <div className="right">
      <input className="search-input" placeholder="Buscar..." />
      <button className="btn-icon" type="button">🔔</button>
    </div>
  </header>
);


 return (
  <div className={appClass}>
    {/* Sidebar con menú */}
    <Sidebar
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onToggleCollapse={toggleCollapse}
      onCloseMobile={closeMobile}
    />

    <div className="main-content">
      <Topbar onToggle={toggleCollapse} onOpenMobile={openMobile} />

      <div className="content-container">
        <Routes>
          <Route element={<Protected />}>
            {/* Vista inicial → Home */}
            <Route path="/" element={<Home />} />

            {/* Usuarios */}
            <Route
              path="usuarios/*"
              element={
                <Suspense fallback={<div>Cargando Usuarios...</div>}>
                  <UsuarioPage />
                </Suspense>
              }
            />

             {/* Vivienda */}
             <Route path="vivienda/unidad" element={<UnidadPage />} />
             <Route path="vivienda/registrar-vehiculos" element={<VehiculosPage />} />
             <Route path="vivienda/registrar-mascota" element={<MascotasPage />} />
             <Route path="vivienda/contrato-alquiler" element={<ContratoPage />} />
             {/* Finanzas */}
             <Route  path="finanzas/cargo" element={<CargoPage />}  />
             <Route path="finanzas/pago" element={<PagoPage />} />
             <Route path="finanzas/aplicar-pago" element={<AplicarPagoPage />} />
              
            {/* Seguridad */}
            <Route path="seguridad/accesos" element= {<AccesoPage />}  />
            <Route path="seguridad/visitas" element={<VisitaPage/>} />
            <Route path="seguridad/incidentes" element={
             <Suspense fallback={<div>Cargando Incidentes...</div>}>
                    <IncidentesPage />
             </Suspense>
             } />
                 {/* Evidencias */}
            <Route path="seguridad/evidencias/placa" element={<div className="card">Crear evidencia placa</div>} />
            <Route path="seguridad/evidencias/incidente" element={<div className="card">Crear evidencia incidente</div>} />
            <Route path="seguridad/evidencias/generar-cargo" element={<div className="card">Generar cargo por incidente</div>} />
            <Route
            path="seguridad/evidencias"
            element={
              <Suspense fallback={<div>Cargando Evidencias...</div>}>
                   <EvidenciasPage />
               </Suspense>
              }  
            />
            {/* Comunicación */}
             <Route
               path="comunicacion/comunicados" element={
             <Suspense fallback={<div>Cargando Comunicados...</div>}>
               <ComunicadoPage />
             </Suspense> } 
            />
            <Route
             path="comunicacion/notificaciones" element={
              <Suspense fallback={<div>Cargando Notificaciones...</div>}>
                <NotificacionPage />
              </Suspense> }
           />


            {/* Reservaciones */}

             <Route path="reservas/areas" element={<AreaPage />} />
             <Route path="reservas/suministros" element={<SuministroPage />} />
             <Route path="reservas/list" element={<ReservaPage />} />

            {/* Mantenimiento */}
           <Route path="mantenimiento/servicios" element={<ServicioPage />} />
           <Route path="mantenimiento/tickets" element={<TicketPage />} />
          
           {/* Reconocimiento Facial */}
          <Route path="reconocimiento-facial" element={<div>Reconocimiento Facial</div>} />
           </Route>
        </Routes>
      </div>
    </div>

    <div className="overlay" onClick={closeMobile} />
  </div>
);
}