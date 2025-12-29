// src/pages/arqueos/MovimientoArqueo.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const MovimientoArqueo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fechaApertura, setFechaApertura] = useState("");

  const [formData, setFormData] = useState({
    arqueo_id: id,
    tipo: "",
    monto: "",
    descripcion: "",
  });

  // Función para formatear fecha a local (Evita el salto de horas)
  const formatToLocalDatetime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000; // diferencia en ms
    const localISODate = new Date(date.getTime() - offset)
      .toISOString()
      .slice(0, 16);
    return localISODate;
  };

  useEffect(() => {
    const fetchArqueoInfo = async () => {
      try {
        const response = await api.get(`/arqueos/${id}`);
        // USAMOS LA NUEVA FUNCIÓN AQUÍ
        setFechaApertura(
          formatToLocalDatetime(response.data.arqueo.fecha_apertura)
        );
        setLoading(false);
      } catch (error) {
        navigate("/arqueos/listado");
      }
    };
    fetchArqueoInfo();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/arqueos/movimientos", formData);
      Swal.fire({
        icon: "success",
        title: "¡Registrado!",
        text: "Movimiento guardado.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/arqueos/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar.", "error");
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-12">
            <h1>
              <b>Registro de un nuevo ingreso/egreso</b>
            </h1>
            <hr />
            <br />
          </div>
        </div>
        <div className="row d-flex justify-content-center">
          <div className="col-md-4">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title">Ingrese los datos</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Fecha Apertura</label>
                    <input
                      type="datetime-local"
                      className="form-control bg-white"
                      value={fechaApertura}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Tipo <b className="text-danger">*</b>
                    </label>
                    <select
                      name="tipo"
                      className="form-control"
                      value={formData.tipo}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Seleccione un tipo
                      </option>
                      <option value="Ingreso">Ingreso</option>
                      <option value="Egreso">Egreso</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Monto <b className="text-danger">*</b>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="monto"
                      className="form-control text-right"
                      placeholder="0.00"
                      value={formData.monto}
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
                      placeholder="Motivo del movimiento"
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
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save"></i> Registrar
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

export default MovimientoArqueo;
