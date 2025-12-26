// src/components/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="sr-only">Cargando...</span>
    </div>
  </div>
);

export default LoadingSpinner;
