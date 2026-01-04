// src/pages/usuarios/EditarUsuario.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const EditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    empresa_id: 1,
  });

  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Cargar roles y datos del usuario al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar roles
        const rolesResponse = await api.get("/roles");
        setRoles(rolesResponse.data);

        // Cargar datos del usuario
        const userResponse = await api.get(`/users/${id}`);
        const userData = userResponse.data;

        setFormData({
          name: userData.name,
          email: userData.email,
          empresa_id: userData.empresa_id,
        });

        // Extraer IDs de roles seleccionados
        const roleIds = userData.roles
          .map(
            (role) => rolesResponse.data.find((r) => r.name === role.name)?.id
          )
          .filter(Boolean);

        setSelectedRoles(roleIds);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire(
          "Error",
          "No se pudieron cargar los datos del usuario.",
          "error"
        );
        navigate("/usuarios/listado");
      }
    };

    fetchData();
  }, [id, navigate]);

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

    if (selectedRoles.length === 0) {
      newErrors.roles = "Debe seleccionar un rol";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.put(`/users/${id}`, {
        ...formData,
        roles: selectedRoles,
      });

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Éxito!",
        text: "Usuario actualizado exitosamente.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        navigate("/usuarios/listado");
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);

      if (error.response?.data?.message === "El email ya está registrado") {
        setErrors({ email: "El email ya está registrado" });
      } else {
        Swal.fire("Error", "No se pudo actualizar el usuario.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/usuarios/listado");
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
            <h1 className="m-0">Editar Usuario</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Editar datos del usuario</h3>
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
                    <label htmlFor="empresa_id">ID de Empresa</label>
                    <input
                      type="number"
                      className="form-control"
                      id="empresa_id"
                      name="empresa_id"
                      value={formData.empresa_id}
                      onChange={handleInputChange}
                      placeholder="Ingrese el ID de empresa"
                    />
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
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar Usuario"
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

export default EditarUsuario;
