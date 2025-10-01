// src/shared/menu.ts
export type Role = "ADMIN" | "GUARD" | "RESIDENT";

export type MenuItem = {
  id: string;
  label: string;
  path: string;
  roles?: Role[];
  children?: MenuItem[];
};

export const MENU: MenuItem[] = [
  {
    id: "usuarios",
    label: "Usuarios",
    path: "usuarios",
    roles: ["ADMIN", "GUARD"],
    children: [
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
      { id: "unidad", label: "Unidad", path: "vivienda/unidad", roles: ["ADMIN", "GUARD", "RESIDENT"] },
      { id: "registrarVehiculos", label: "Registrar vehículos", path: "vivienda/registrar-vehiculos", roles: ["ADMIN", "GUARD"] },
      { id: "registrarMascota", label: "Registrar mascota", path: "vivienda/registrar-mascota", roles: ["ADMIN"] },
      { id: "contratoAlquiler", label: "Contrato alquiler", path: "vivienda/contrato-alquiler", roles: ["ADMIN"] },
    ],
  },
  {
  id: "finanzas",
  label: "Finanzas",
  path: "finanzas",
  roles: ["ADMIN"],
  children: [
    { id: "cargo", label: "Crear Cargo", path: "finanzas/cargo", roles: ["ADMIN"] },
    { id: "pago", label: "Crear Pago", path: "finanzas/pago", roles: ["ADMIN"] },
    { id: "aplicar-pago", label: "Aplicar Pago a Cargo", path: "finanzas/aplicar-pago", roles: ["ADMIN"] },
  ],
},

  {
    id: "seguridad",
    label: "Seguridad",
    path: "seguridad",
    roles: ["ADMIN", "GUARD"],
    children: [
    { id: "accesos", label: "Control accesos", path: "seguridad/accesos", roles: ["ADMIN", "GUARD"] },
    { id: "visitas", label: "Registro visitas", path: "seguridad/visitas", roles: ["ADMIN", "GUARD"] },
    { id: "incidentes", label: "Incidentes", path: "seguridad/incidentes", roles: ["ADMIN", "GUARD"] },
    { id: "evidencias", label: "Evidencias", path: "seguridad/evidencias", roles: ["ADMIN", "GUARD"] },
 
    ]
  },

  {
    id: "comunicacion",
    label: "Comunicación",
    path: "comunicacion",
    roles: ["ADMIN", "GUARD"], // los que pueden usarlo
    children: [
     { id: "comunicados", label: "Comunicados", path: "comunicacion/comunicados", roles: ["ADMIN"] },
     { id: "notificaciones", label: "Notificaciones", path: "comunicacion/notificaciones", roles: ["GUARD"] },
    ],
  },

  {
  id: "reservas",
  label: "Reservas",
  path: "reservas",
  roles: ["ADMIN", "GUARD", "RESIDENT"], // puedes ajustar según permisos
  children: [
    { id: "areas", label: "Áreas Comunes", path: "reservas/areas", roles: ["ADMIN"] },
    { id: "suministros", label: "Suministros", path: "reservas/suministros", roles: ["ADMIN"] },
    { id: "reservas", label: "Reservas", path: "reservas/list", roles: ["ADMIN", "GUARD", "RESIDENT"] },
  ],
},

  {
  id: "mantenimiento",
  label: "Mantenimiento",
  path: "mantenimiento",
  roles: ["ADMIN", "GUARD"],
  children: [
    { id: "servicios", label: "Servicios", path: "mantenimiento/servicios", roles: ["ADMIN"] },
    { id: "tickets", label: "Tickets", path: "mantenimiento/tickets", roles: ["ADMIN", "GUARD"] },
  ],
},

  
  {
    id: "reconocimiento-facial",
    label: "Reconocimiento Facial",
    path: "reconocimiento-facial",
  },

];
