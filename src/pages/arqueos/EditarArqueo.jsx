// src/pages/arqueos/EditarArqueo.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const EditarArqueo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fecha_apertura: "",
    monto_inicial: "",
    descripcion: "",
  });

  useEffect(() => {
    const fetchArqueo = async () => {
      try {
        const response = await api.get(`/arqueos/${id}`);
        const { arqueo } = response.data;

        setUsuarioNombre(arqueo.usuario_nombre);
        setFormData({
          fecha_apertura: new Date(arqueo.fecha_apertura)
            .toISOString()
            .slice(0, 16),
          monto_inicial: arqueo.monto_inicial,
          descripcion: arqueo.descripcion || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar arqueo:", error);
        Swal.fire(
          "Error",
          "No se pudo cargar la información del arqueo",
          "error"
        );
        navigate("/arqueos/listado");
      }
    };
    fetchArqueo();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/arqueos/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "El arqueo se ha modificado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/arqueos/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el arqueo", "error");
    }
  };

  if (loading) return <div className="p-4">Cargando datos...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-12">
            <h1>
              <b>Modificar de un arqueo</b> - Usuario: {usuarioNombre}
            </h1>
            <hr />
            <br />
          </div>
        </div>

        <div className="row d-flex justify-content-center">
          <div className="col-md-4">
            <div className="card card-outline card-success shadow">
              <div className="card-header">
                <h3 className="card-title">Ingrese los datos</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>
                      Fecha Apertura <b className="text-danger">*</b>
                    </label>
                    <input
                      type="datetime-local"
                      name="fecha_apertura"
                      className="form-control"
                      value={formData.fecha_apertura}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Monto Inicial <b className="text-danger">*</b>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="monto_inicial"
                      className="form-control text-right"
                      value={formData.monto_inicial}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      className="form-control"
                      value={formData.descripcion}
                      onChange={handleChange}
                    />
                  </div>

                  <hr />
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/arqueos/listado")}
                    >
                      <i className="fas fa-reply"></i> Volver
                    </button>
                    <button type="submit" className="btn btn-success">
                      <i className="fas fa-save"></i> Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarArqueo;
