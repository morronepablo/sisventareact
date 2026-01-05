// src/pages/configuracion/ConfiguracionSesion.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

// --- ESTILOS PARA IGUALAR SELECT2 CON BOOTSTRAP ---
const select2CustomStyles = `
  .select2-container .select2-selection--single {
    height: 38px !important;
    display: flex !important;
    align-items: center !important;
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__rendered {
    line-height: 38px !important;
    padding-left: 12px !important;
    color: #495057 !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 36px !important;
  }
`;

const ConfiguracionSesion = () => {
  const [formData, setFormData] = useState({ unidad: "horas", cantidad: 24 });
  const [loading, setLoading] = useState(true);
  const selectRef = useRef(null);

  useEffect(() => {
    // 1. Cargar configuración
    api
      .get("/config-session")
      .then((res) => {
        setFormData({ unidad: res.data.unidad, cantidad: res.data.cantidad });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // 2. Inicializar Select2
    const timer = setTimeout(() => {
      if (window.$ && window.$.fn.select2) {
        const $select = window.$(selectRef.current);
        $select.select2({ theme: "bootstrap4", width: "100%" });

        $select.on("change", (e) => {
          setFormData((prev) => ({ ...prev, unidad: e.target.value }));
        });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.select2 && selectRef.current) {
        window.$(selectRef.current).select2("destroy");
      }
    };
  }, []);

  // Sincronizar Select2 cuando los datos llegan del servidor
  useEffect(() => {
    if (!loading && window.$ && selectRef.current) {
      window
        .$(selectRef.current)
        .val(formData.unidad)
        .trigger("change.select2");
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/config-session", formData);
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Configuración actualizada. Se aplicará en el próximo login.",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  if (loading)
    return (
      <div className="p-5 text-center">
        <h4>Cargando configuración...</h4>
      </div>
    );

  return (
    <div className="content-header">
      <style>{select2CustomStyles}</style>
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Configuración de Sesión</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header border-primary">
                <h3 className="card-title text-bold text-primary">
                  <i className="fas fa-user-clock mr-2"></i> Duración del Token
                  de Acceso
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <p className="text-muted">
                    Configure el tiempo de expiración de la sesión para todos
                    los usuarios.
                  </p>

                  <div className="form-group mb-4">
                    <label className="font-weight-bold">Medir tiempo en:</label>
                    <select
                      ref={selectRef}
                      className="form-control"
                      value={formData.unidad}
                    >
                      <option value="minutos">Minutos</option>
                      <option value="horas">Horas</option>
                      <option value="dias">Días</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="font-weight-bold">Cantidad:</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ height: "38px" }}
                      value={formData.cantidad}
                      onChange={(e) =>
                        setFormData({ ...formData, cantidad: e.target.value })
                      }
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="card-footer bg-light border-top p-3">
                  <div className="d-flex justify-content-between w-100">
                    <Link
                      to="/dashboard"
                      className="btn btn-secondary shadow-sm text-white"
                    >
                      <i className="fas fa-reply mr-1"></i> Volver
                    </Link>
                    <button type="submit" className="btn btn-primary shadow-sm">
                      <i className="fas fa-save mr-1"></i> Guardar Cambios
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="alert alert-info mt-3 shadow-sm">
              <i className="icon fas fa-info"></i>
              Por seguridad, el sistema verifica la validez del token cada 10
              segundos. Si el tiempo expira, la sesión se cerrará
              automáticamente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionSesion;
