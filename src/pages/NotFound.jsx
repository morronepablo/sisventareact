// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import notFoundImage from "../assets/img/404.png"; // ← IMPORTA LA IMAGEN

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-12">
              {/* Título rojo centrado y con margen superior */}
              <h1
                className="text-danger text-center"
                style={{
                  marginTop: "20px",
                  marginBottom: "30px",
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
              >
                404 - Página no encontrada
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="text-center mt-5">
                {/* Imagen 404 local importada */}
                <img
                  src={notFoundImage}
                  alt="404 - Página no encontrada"
                  style={{
                    maxWidth: "500px",
                    height: "auto",
                    marginBottom: "30px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <h3 className="mb-3">No se ha podido encontrar la página.</h3>
                <p className="mb-4">
                  Por favor, contacte al administrador del sistema si cree que
                  es un error.
                </p>
                <button className="btn btn-primary" onClick={handleGoHome}>
                  Regresar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
