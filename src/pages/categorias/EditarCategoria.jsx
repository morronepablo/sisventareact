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
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const res = await api.get(`/categorias/${id}`);
        setNombre(res.data.nombre);
        setDescripcion(res.data.descripcion || "");
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
      await api.put(`/categorias/${id}`, { nombre, descripcion });
      Swal.fire("Éxito", "Categoría actualizada correctamente", "success").then(
        () => {
          window.location.href = "/categorias/listado";
        }
      );
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
            <h1 className="m-0">Editar Categoría</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Editar categoría</h3>
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
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? "Actualizando..." : "Actualizar"}
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

export default EditarCategoria;
