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
    path: "finanzas/cargo",
    children: [
      { id: "crear-cargo", label: "Crear Cargo", path: "cargo" },
      { id: "crear-pago", label: "Crear Pago", path: "pago" },
      { id: "aplicar-pago", label: "Aplicar Pago a Cargo", path: "aplicar-pago" },
    ],
  },
  {
    id: "seguridad",
    label: "Seguridad",
    path: "seguridad",
    roles: ["ADMIN", "GUARD"],
    children: [{ id: "accesos", label: "Control accesos", path: "seguridad/accesos", roles: ["ADMIN", "GUARD"] }],
  },
  { id: "reportes", label: "Reportes", path: "reportes", roles: ["ADMIN"] },
  ////////////////
  {
    id: "comunicacion",
    label: "Comunicación",
    path: "comunicacion",
  },
  {
    id: "reservaciones",
    label: "Reservaciones",
    path: "reservaciones",
  },
  {
    id: "mantenimiento",
    label: "Mantenimiento",
    path: "mantenimiento",
  },
  {
    id: "reportes",
    label: "Reportes",
    path: "reportes",
  },
  {
    id: "reconocimiento-facial",
    label: "Reconocimiento Facial",
    path: "reconocimiento-facial",
  },

];
