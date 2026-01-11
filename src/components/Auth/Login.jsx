// src/components/auth/Login.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Swal from "sweetalert2";
import logo from "../../assets/img/logoventas.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth(); // 👈 Función que guarda el token
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column";
    document.body.style.justifyContent = "center";
    document.body.style.alignItems = "center";
    document.body.style.height = "100vh";
    document.body.style.margin = "0";

    return () => {
      document.body.classList.remove("login-page");
      document.body.style.backgroundColor = "";
      document.body.style.display = "";
      document.body.style.flexDirection = "";
      document.body.style.justifyContent = "";
      document.body.style.alignItems = "";
      document.body.style.height = "";
      document.body.style.margin = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    try {
      // 1. Enviamos los datos al servidor
      const res = await api.post("/auth/login", { email, password });

      // 2. 🟢 ¡ESTO ES LO QUE FALTABA! 🟢
      // Guardamos el token en el contexto y localStorage
      if (res.data.token) {
        login(res.data.token);
        // 3. Redirigimos al Dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Alerta de Arqueo Bloqueado
        Swal.fire({
          icon: "error",
          title: "Acceso Denegado",
          text: error.response.data.message,
          confirmButtonText: "Entendido",
          footer:
            '<span class="text-danger">Política de Seguridad: Una caja por turno.</span>',
        });
      } else if (error.response && error.response.status === 401) {
        Swal.fire("Error", "Usuario o contraseña incorrectos", "error");
      } else {
        Swal.fire("Error", "No se pudo conectar con el servidor", "error");
      }
    }
  };

  return (
    <div className="login-box" style={{ width: "400px", marginTop: "20px" }}>
      <div className="login-logo" style={{ marginBottom: "25px" }}>
        <img
          src={logo}
          alt="Logo Sistema"
          style={{ maxWidth: "250px", height: "auto" }}
        />
      </div>

      <div
        className="card card-outline card-primary"
        style={{ boxShadow: "5px 5px 5px 0px #cccccccc" }}
      >
        <div className="card-header text-center">
          <h3 className="card-title float-none" style={{ fontSize: "1.1rem" }}>
            Autenticarse para iniciar sesión
          </h3>
        </div>

        <div className="card-body login-card-body">
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
              <div className="col-7">
                <div className="icheck-primary">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label htmlFor="remember"> Recordarme</label>
                </div>
              </div>
              <div className="col-5">
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-flat"
                >
                  <i className="fas fa-sign-in-alt mr-1"></i> Acceder
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="card-footer bg-white border-top-0">
          <p className="mb-1" style={{ fontSize: "0.9rem" }}>
            <a href="/password/reset">Olvidé mi contraseña</a>
          </p>
          <p className="mb-0" style={{ fontSize: "0.9rem" }}>
            <a href="/crear-empresa">Crear una nueva empresa</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
