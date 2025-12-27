// src/pages/unidades/CrearUnidad.jsx
import React, { useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearUnidad = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())
      return Swal.fire("Error", "El nombre es obligatorio", "error");

    setLoading(true);
    try {
      await api.post("/unidades", { nombre, descripcion });
      Swal.fire("Éxito", "Unidad creada correctamente", "success").then(() => {
        window.location.href = "/unidades/listado";
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al crear unidad",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Crear Unidad</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Nueva unidad</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ml-2"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearUnidad;
