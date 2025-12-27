// src/components/auth/Login.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import logo from "../../assets/img/logoventas.jpg"; // ← IMPORTA TU LOGO

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Al montar el componente, limpiar clases del body y forzar fondo blanco
  useEffect(() => {
    document.body.className = "login-page"; // ← Solo esta clase
    document.body.style.backgroundColor = "#ffffff"; // ← Fondo blanco
    return () => {
      document.body.className = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      {/* Logo */}
      <div className="login-logo">
        <img
          src={logo}
          alt="Logo"
          style={{
            maxWidth: "200px",
            height: "auto",
            marginBottom: "30px",
          }}
        />
      </div>

      {/* Card de login */}
      <div
        className="card card-outline card-primary"
        style={{ boxShadow: "5px 5px 5px 0px #cccccc" }}
      >
        <div className="card-header">
          <h3 className="card-title float-none text-center">
            Autenticarse para iniciar sesión
          </h3>
        </div>
        <div className="card-body login-card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email */}
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

            {/* Contraseña */}
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

            {/* Recordarme */}
            <div className="row">
              <div className="col-7">
                <div
                  className="icheck-primary"
                  title="Mantenerme autenticado indefinidamente o hasta cerrar la sesión manualmente"
                >
                  <input
                    type="checkbox"
                    name="remember"
                    id="remember"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                  />
                  <label htmlFor="remember">Recordarme</label>
                </div>
              </div>
              <div className="col-5">
                <button
                  type="submit"
                  className="btn btn-block btn-flat btn-primary"
                >
                  <span className="fas fa-sign-in-alt"></span>
                  Acceder
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="card-footer">
          <p className="my-0">
            <a href="#">Olvidé mi contraseña</a>
          </p>
          <p className="my-0">
            <a href="/empresas/crear">Crear una nueva empresa</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
