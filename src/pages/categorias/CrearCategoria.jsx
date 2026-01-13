// src/pages/categorias/CrearCategoria.jsx
import React, { useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearCategoria = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [margenObjetivo, setMargenObjetivo] = useState(0); // 👈 Nuevo estado para el margen
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())
      return Swal.fire("Error", "El nombre es obligatorio", "error");

    setLoading(true);
    try {
      // 1. Enviamos también el margen_objetivo al backend
      await api.post("/categorias", {
        nombre,
        descripcion,
        margen_objetivo: margenObjetivo,
      });

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Éxito!",
        text: "Categoría creada correctamente",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "/categorias/listado";
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al crear categoría",
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
            <h1 className="m-0 text-bold">Crear Categoría</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-primary card-outline shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">Nueva categoría</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  {/* NOMBRE */}
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      className="form-control shadow-sm"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Bebidas, Almacén, Limpieza..."
                      required
                    />
                  </div>

                  {/* DESCRIPCIÓN */}
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      className="form-control shadow-sm"
                      rows="3"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Breve descripción de la categoría (opcional)"
                    ></textarea>
                  </div>

                  {/* 🛡️ MARGEN OBJETIVO (CAMPO CRÍTICO PARA EL GUARDIÁN) 🛡️ */}
                  <div className="form-group">
                    <label className="text-primary">
                      <i className="fas fa-shield-alt mr-1"></i> Margen de
                      Ganancia Objetivo (%) *
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control shadow-sm"
                        value={margenObjetivo}
                        onChange={(e) => setMargenObjetivo(e.target.value)}
                        required
                      />
                      <div className="input-group-append">
                        <span className="input-group-text bg-primary text-white text-bold">
                          %
                        </span>
                      </div>
                    </div>
                    <small className="form-text text-muted">
                      El <b>Guardián de Márgenes</b> usará este porcentaje para
                      avisarte si la inflación o los costos afectan tu ganancia.
                    </small>
                  </div>
                </div>

                <div className="card-footer bg-transparent">
                  <button
                    type="submit"
                    className="btn btn-primary shadow-sm"
                    disabled={loading}
                  >
                    <i className="fas fa-save mr-1"></i>{" "}
                    {loading ? "Guardando..." : "Guardar Categoría"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ml-2 shadow-sm"
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

export default CrearCategoria;
