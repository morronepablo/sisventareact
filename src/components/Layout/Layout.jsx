// src/components/Layout/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="wrapper">
      <Navbar />
      <Sidebar />
      <div className="content-wrapper">
        <div className="content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
      </div>
      <footer className="main-footer">
        <strong>
          Copyright &copy; 2025 <a href="#">Sistema de Ventas</a>.
        </strong>
        Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Layout;
