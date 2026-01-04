// src/pages/roles/EditarRol.jsx
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const EditarRol = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Cargar datos del rol al montar el componente
  useEffect(() => {
    const fetchRol = async () => {
      try {
        const response = await api.get(`/roles/${id}`);
        setFormData({
          name: response.data.name,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar rol:", error);
        Swal.fire("Error", "No se pudieron cargar los datos del rol.", "error");
        navigate("/roles/listado");
      }
    };

    fetchRol();
  }, [id, navigate]);

  useEffect(() => {
    // Inicializar tooltips
    const timer = setTimeout(() => {
      $('[data-bs-toggle="tooltip"]').tooltip();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Limpiar tooltips al desmontar el componente
      $('[data-bs-toggle="tooltip"]').tooltip("dispose");
    };
  }, []);

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
      newErrors.name = "El nombre del rol es requerido";
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
      await api.put(`/roles/${id}`, {
        name: formData.name.trim(),
      });

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Éxito!",
        text: "Rol actualizado exitosamente.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        navigate("/roles/listado");
      });
    } catch (error) {
      console.error("Error al actualizar rol:", error);

      if (error.response?.data?.message === "El rol ya existe") {
        setErrors({ name: "El rol ya existe" });
      } else {
        Swal.fire("Error", "No se pudo actualizar el rol.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/roles/listado");
  };

  if (loading) {
    return (
      <div className="content-header">
        <div className="container-fluid">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Editar Rol</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Editar datos del rol</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="name">Nombre del rol *</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre del rol"
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
                    onClick={() => {
                      // Cerrar todos los tooltips antes de enviar el formulario
                      $('[data-bs-toggle="tooltip"]').tooltip("hide");
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar Rol"
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

export default EditarRol;
