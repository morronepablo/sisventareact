// src/pages/configuracion/ConfiguracionSesion.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

// --- CSS REFORZADO PARA SELECT2 (ESTILO ADMINLTE / BOOTSTRAP 4) ---
const select2CustomStyles = `
  .select2-container--default .select2-selection--single {
    height: 38px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
    box-shadow: none !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__rendered {
    color: #495057 !important;
    padding-left: 12px !important;
    line-height: 38px !important; /* Centrado vertical perfecto */
  }
  .select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 36px !important;
    right: 8px !important;
  }
  .select2-dropdown {
    border: 1px solid #ced4da !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
  }
`;

const ConfiguracionSesion = () => {
  const [formData, setFormData] = useState({ unidad: "horas", cantidad: 24 });
  const [loading, setLoading] = useState(true);
  const selectRef = useRef(null);

  useEffect(() => {
    // 1. Cargar configuración actual
    api
      .get("/config-session")
      .then((res) => {
        setFormData({ unidad: res.data.unidad, cantidad: res.data.cantidad });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar config:", err);
        setLoading(false);
      });

    // 2. Inicializar Select2 con un pequeño delay para asegurar el render
    const timer = setTimeout(() => {
      const $select = window.$(selectRef.current);
      if ($select.length) {
        $select.select2({
          theme: "default", // Cambiado a default para usar nuestro CSS manual
          width: "100%",
          placeholder: "Seleccione una unidad",
        });

        // Sincronizar cambio de Select2 con el estado de React
        $select.on("change", (e) => {
          setFormData((prev) => ({ ...prev, unidad: e.target.value }));
        });
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.select2 && selectRef.current) {
        window.$(selectRef.current).select2("destroy");
      }
    };
  }, []);

  // Sincronizar valor visual de Select2 cuando los datos llegan del servidor
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
        text: "Configuración actualizada. Se aplicará en el próximo inicio de sesión.",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar la configuración", "error");
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
                  <i className="fas fa-user-clock mr-2"></i> Duración de la
                  Sesión
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <p className="text-muted">
                    Configure el tiempo de validez del token de acceso. Una vez
                    vencido, el usuario deberá reautenticarse.
                  </p>

                  <div className="form-group mb-4">
                    <label className="font-weight-bold">Medir tiempo en:</label>
                    {/* Quitamos 'value' del select para evitar advertencias de React 
                        ya que Select2 lo maneja por nosotros vía jQuery */}
                    <select ref={selectRef} className="form-control">
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
                    <button
                      type="submit"
                      className="btn btn-primary shadow-sm text-bold"
                    >
                      <i className="fas fa-save mr-1"></i> Guardar Cambios
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div
              className="alert alert-info mt-3 shadow-sm"
              style={{ borderLeft: "5px solid #117a8b" }}
            >
              <i className="icon fas fa-info-circle"></i>
              El sistema verifica la expiración cada 10 segundos para mayor
              seguridad.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionSesion;
