// src/pages/usuarios/CrearUsuario.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearUsuario = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    empresa_id: 1,
  });

  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar roles al montar el componente
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/roles");
        setRoles(response.data);
      } catch (error) {
        console.error("Error al cargar roles:", error);
        Swal.fire("Error", "No se pudieron cargar los roles.", "error");
      }
    };

    fetchRoles();
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

  const handleRoleChange = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Las contraseñas no coinciden";
    }

    if (selectedRoles.length === 0) {
      newErrors.roles = "Debe seleccionar al menos un rol";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.post("/users", {
        ...formData,
        roles: selectedRoles,
      });

      Swal.fire({
        title: "¡Éxito!",
        text: "Usuario creado exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        navigate("/usuarios/listado");
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);

      if (error.response?.data?.message === "El email ya está registrado") {
        setErrors({ email: "El email ya está registrado" });
      } else {
        Swal.fire("Error", "No se pudo crear el usuario.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/usuarios/listado");
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Crear Usuario</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Datos del usuario</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="name">Nombre completo *</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre completo"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ingrese el email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Contraseña *</label>
                    <input
                      type="password"
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Ingrese la contraseña"
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password_confirmation">
                      Confirmar contraseña *
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        errors.password_confirmation ? "is-invalid" : ""
                      }`}
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      placeholder="Confirme la contraseña"
                    />
                    {errors.password_confirmation && (
                      <div className="invalid-feedback">
                        {errors.password_confirmation}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Rol *</label>
                    <div className="row">
                      {roles.map((role) => (
                        <div key={role.id} className="col-md-6 col-lg-4">
                          <div className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id={`role-${role.id}`}
                              name="selectedRole"
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => setSelectedRoles([role.id])} // ← Solo un rol
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`role-${role.id}`}
                            >
                              {role.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.roles && (
                      <div className="text-danger">{errors.roles}</div>
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
                      "Crear Usuario"
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

export default CrearUsuario;
