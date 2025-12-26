// src/components/layout/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="main-footer">
      <strong>
        Copyright © 2025 {import.meta.env.VITE_APP_NAME || "Sistema de Ventas"}
      </strong>{" "}
      Todos los derechos reservados.
      <div className="float-right d-none d-sm-inline-block">
        <b>Version</b> {import.meta.env.VITE_APP_VERSION || "1.0.0"}
      </div>
    </footer>
  );
};

export default Footer;
