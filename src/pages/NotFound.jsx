// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h1>404 - Página no encontrada</h1>
          <p>La página que buscas no existe.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
