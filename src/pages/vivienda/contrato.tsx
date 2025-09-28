import React, { useState, useEffect } from "react";
import { ContratoAlquiler, CrearContrato } from "./types"; 
import { createContratoAlquiler } from "./service"; // Importamos la función del servicio

const ContratoPage: React.FC = () => {
  const [contratos, setContratos] = useState<ContratoAlquiler[]>([]);
  const [newContrato, setNewContrato] = useState<CrearContrato>({
    unidad: 0,
    dueño: 0, 
    inquilino: 0,
    start: "",
    monto_mensual: "",
    is_active: true,
    descripcion: "",
  });

  // Cargar los contratos existentes desde el backend (simulado)
  useEffect(() => {
    const loadContratos = async () => {
      const contratosData = [
        {
          id: 1, 
          unidad: 1,
          inquilino: 2,
          fecha_inicio: "2025-03-01",
          monto_mensual: "350.00",
          garantia: "500.00",
          activo: true,
        },
      ];
      setContratos(contratosData);
    };

    loadContratos();
  }, []);

  // Manejador para la creación de un nuevo contrato
  const handleCreateContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Llamamos a la función del servicio para crear el contrato
    try {
      const createdContrato = await createContratoAlquiler({
        unidad: newContrato.unidad,
        dueño: newContrato.dueño,
        inquilino: newContrato.inquilino,
        start: newContrato.start,
        monto_mensual: newContrato.monto_mensual,
        is_active: newContrato.is_active,
        descripcion: newContrato.descripcion,
      });

      // Actualizar el estado con el nuevo contrato creado
      setContratos((prev) => [...prev, createdContrato]);

      // Limpiar el formulario después de la creación
      setNewContrato({
        unidad: 0,
        dueño: 0,
        inquilino: 0,
        start: "",
        monto_mensual: "",
        is_active: true,
        descripcion: "",
      });
    } catch (error) {
      console.error("Error al crear el contrato:", error);
    }
  };

  return (
    <div className="module-container">
      <div className="module-card">
        <h2>Contratos de Alquiler</h2>

        {/* Formulario para Crear Contrato */}
        <form onSubmit={handleCreateContrato} className="module-form">
          <h3>Crear Nuevo Contrato</h3>
          <div>
            <label>Unidad:</label>
            <input
              type="number"
              value={newContrato.unidad}
              onChange={(e) => setNewContrato({ ...newContrato, unidad: +e.target.value })}
              required
            />
          </div>
          <div>
            <label>Dueño:</label>
            <input
              type="number"
              value={newContrato.dueño}
              onChange={(e) => setNewContrato({ ...newContrato, dueño: +e.target.value })}
              required
            />
          </div>
          <div>
            <label>Inquilino:</label>
            <input
              type="number"
              value={newContrato.inquilino}
              onChange={(e) => setNewContrato({ ...newContrato, inquilino: +e.target.value })}
              required
            />
          </div>
          <div>
            <label>Fecha de Inicio:</label>
            <input
              type="date"
              value={newContrato.start}
              onChange={(e) => setNewContrato({ ...newContrato, start: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Monto Mensual:</label>
            <input
              type="text"
              value={newContrato.monto_mensual}
              onChange={(e) => setNewContrato({ ...newContrato, monto_mensual: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Descripción:</label>
            <input
              type="text"
              value={newContrato.descripcion}
              onChange={(e) => setNewContrato({ ...newContrato, descripcion: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Activo:</label>
            <input
              type="checkbox"
              checked={newContrato.is_active}
              onChange={(e) => setNewContrato({ ...newContrato, is_active: e.target.checked })}
            />
          </div>
          <button type="submit" className="btn">
            Crear Contrato
          </button>
        </form>
      </div>

      {/* Listado de Contratos Existentes */}
      <div className="module-card">
        <h3>Contratos Actuales</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Inquilino</th>
              <th>Fecha Inicio</th>
              <th>Monto Mensual</th>
              <th>Garantía</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((contrato, index) => (
              <tr key={index}>
                <td>{contrato.unidad}</td>
                <td>{contrato.inquilino}</td>
                <td>{contrato.fecha_inicio}</td>
                <td>{contrato.monto_mensual}</td>
                <td>{contrato.garantia}</td>
                <td>{contrato.activo ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContratoPage;
