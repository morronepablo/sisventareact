// src/components/Auth/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    empresa_id: 1,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", formData);
      alert("Usuario registrado correctamente");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Registro</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Empresa ID (opcional)</label>
                  <input
                    type="number"
                    name="empresa_id"
                    className="form-control"
                    value={formData.empresa_id}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Registrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
