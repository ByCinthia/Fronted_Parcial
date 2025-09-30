// src/pages/Finanzas/cargo.tsx
import React, { useState } from "react";
import { CreateCargoPayload, Cargo } from "./types";
import { createCargo, listarCargos } from "./service";

const CargoPage: React.FC = () => {
  // estado para crear cargo
  const [newCargo, setNewCargo] = useState<CreateCargoPayload>({
    unidad: 0,
    concepto: "",
    descripcion: "",
    monto: "",
    periodo: "",
    estado: "pendiente",
    saldo: "",
  });

  // estado para listar cargos
  const [cargos, setCargos] = useState<Cargo[]>([]);

  const handleCreateCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCargo(newCargo);
      alert("Cargo creado correctamente");
      setNewCargo({
        unidad: 0,
        concepto: "",
        descripcion: "",
        monto: "",
        periodo: "",
        estado: "pendiente",
        saldo: "",
      });
    } catch (error) {
      alert("Error al crear el cargo");
      console.error(error);
    }
  };

  const handleBuscar = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget; // ya es un HTMLFormElement
  const unidad = Number((form.elements.namedItem("unidad") as HTMLInputElement).value);
  const estado = (form.elements.namedItem("estado") as HTMLInputElement).value;
  const data = await listarCargos(unidad, estado);
  setCargos(data);
};


  return (
    <div className="module-container">
      {/* Crear Cargo */}
      <div className="module-card">
        <h2>Crear Cargo</h2>
        <form className="module-form" onSubmit={handleCreateCargo}>
          <input
            type="number"
            placeholder="Unidad"
            value={newCargo.unidad}
            onChange={(e) => setNewCargo({ ...newCargo, unidad: +e.target.value })}
            min={1}
            required
          />
          <input
            type="text"
            placeholder="Concepto"
            value={newCargo.concepto}
            onChange={(e) => setNewCargo({ ...newCargo, concepto: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={newCargo.descripcion}
            onChange={(e) => setNewCargo({ ...newCargo, descripcion: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Monto"
            value={newCargo.monto}
            onChange={(e) => setNewCargo({ ...newCargo, monto: e.target.value })}
            required
          />
          <input
            type="date"
            placeholder="Periodo"
            value={newCargo.periodo}
            onChange={(e) => setNewCargo({ ...newCargo, periodo: e.target.value })}
            required
          />
          <button type="submit" className="btn">Crear Cargo</button>
        </form>
      </div>

      {/* Listar Cargos */}
      <div className="module-card">
        <h2>Cargos por Unidad</h2>
        <form className="module-form" onSubmit={handleBuscar}>
          <input type="number" name="unidad" placeholder="Unidad" min={1} required />
          <input type="text" name="estado" placeholder="Estado (pendiente, pagado...)" />
          <button type="submit" className="btn">Buscar</button>
        </form>

        {cargos.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Unidad</th>
                <th>Concepto</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Periodo</th>
                <th>Estado</th>
                <th>Saldo</th>
                <th>Creado por</th>
              </tr>
            </thead>
            <tbody>
              {cargos.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.unidad}</td>
                  <td>{c.concepto}</td>
                  <td>{c.descripcion}</td>
                  <td>{c.monto}</td>
                  <td>{c.periodo}</td>
                  <td>{c.estado}</td>
                  <td>{c.saldo}</td>
                  <td>{c.creado_por ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CargoPage;
