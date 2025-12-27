// src/pages/permisos/CrearPermiso.jsx
import React, { useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearPermiso = () => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar error cuando se escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del permiso es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.post("/permissions", {
        name: formData.name.trim(),
      });

      Swal.fire({
        title: "¡Éxito!",
        text: "Permiso creado exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        window.location.href = "/permisos/listado";
      });
    } catch (error) {
      console.error("Error al crear permiso:", error);

      if (error.response?.data?.message === "El permiso ya existe") {
        setErrors({ name: "El permiso ya existe" });
      } else {
        Swal.fire("Error", "No se pudo crear el permiso.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = "/permisos/listado";
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Crear Permiso</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Datos del permiso</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="name">Nombre del permiso *</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre del permiso"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary float-right"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creando...
                      </>
                    ) : (
                      "Crear Permiso"
                    )}
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

export default CrearPermiso;
