// src/pages/arqueos/CrearArqueo.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
// Importamos el hook de notificaciones para actualizar el Navbar
import { useNotifications } from "../../context/NotificationContext";

const CrearArqueo = () => {
  const navigate = useNavigate();
  const { refreshAll } = useNotifications();

  // FUNCIÓN PARA OBTENER LA FECHA Y HORA LOCAL FORMATEADA PARA INPUT
  const getLocalDateTime = () => {
    const now = new Date();
    // Ajustamos el desfase de la zona horaria local
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [formData, setFormData] = useState({
    fecha_apertura: getLocalDateTime(), // Ahora sí pondrá tu hora real
    monto_inicial: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/arqueos", formData);

      // 👇 DISPARAMOS EL REFRESCO GLOBAL (Actualiza el botón verde en el Navbar)
      if (refreshAll) refreshAll();
      window.dispatchEvent(new Event("forceRefreshNotifications"));

      Swal.fire({
        icon: "success",
        title: "¡Registrado!",
        text: "El arqueo se ha abierto correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/arqueos/listado");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo crear el arqueo",
        "error"
      );
    }
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-12">
            <h1>
              <b>Registro de un nuevo arqueo</b>
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
                      placeholder="0.00"
                      style={{ fontSize: "1.2rem", fontWeight: "bold" }}
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
                      placeholder="Ej: Apertura Matutina"
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

export default CrearArqueo;
