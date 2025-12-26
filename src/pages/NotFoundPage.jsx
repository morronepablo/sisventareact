// src/pages/NotFoundPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container mt-5 text-center">
      <h1>404 - Página no encontrada</h1>
      <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
        Volver al inicio
      </button>
    </div>
  );
};

export default NotFoundPage;
