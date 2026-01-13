// src/pages/categorias/EditarCategoria.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const EditarCategoria = () => {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [margenObjetivo, setMargenObjetivo] = useState(0); // 👈 Nuevo estado
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const res = await api.get(`/categorias/${id}`);
        setNombre(res.data.nombre);
        setDescripcion(res.data.descripcion || "");
        setMargenObjetivo(res.data.margen_objetivo || 0); // 👈 Cargamos el valor actual
        setLoadingData(false);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar la categoría", "error").then(
          () => {
            window.location.href = "/categorias/listado";
          }
        );
      }
    };
    fetchCategoria();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())
      return Swal.fire("Error", "El nombre es obligatorio", "error");

    setLoading(true);
    try {
      // Enviamos nombre, descripcion y el nuevo campo margen_objetivo
      await api.put(`/categorias/${id}`, {
        nombre,
        descripcion,
        margen_objetivo: margenObjetivo,
      });

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Éxito!",
        text: "Categoría actualizada correctamente",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "/categorias/listado";
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al actualizar",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (loadingData) return <div className="content-header">Cargando...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0 text-bold">Editar Categoría</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-primary card-outline shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  Editar datos de categoría
                </h3>
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
                      Ajusta este valor para que el <b>Guardián de Márgenes</b>{" "}
                      te avise si los costos suben demasiado.
                    </small>
                  </div>
                </div>

                <div className="card-footer bg-transparent">
                  <button
                    type="submit"
                    className="btn btn-success shadow-sm"
                    disabled={loading}
                  >
                    <i className="fas fa-sync-alt mr-1"></i>{" "}
                    {loading ? "Actualizando..." : "Guardar Cambios"}
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

export default EditarCategoria;
