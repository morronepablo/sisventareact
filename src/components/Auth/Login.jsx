// src/components/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales inválidas", err);
    }
  };

  return (
    <div className="login-box">
      <div className="card">
        <div className="card-body login-card-body">
          <h3 className="login-box-msg">Iniciar sesión</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-envelope"></span>
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-lock"></span>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <button type="submit" className="btn btn-primary btn-block">
                  Ingresar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
