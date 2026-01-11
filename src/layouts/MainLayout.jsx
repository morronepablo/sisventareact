// src/layouts/MainLayout.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom"; // 👈 Importamos useNavigate
import { useLayout } from "../context/LayoutContext";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import Footer from "../components/Layout/Footer";

const MainLayout = () => {
  const { isDesktopCollapsed, isMobileOpen, closeMobileSidebar } = useLayout();
  const location = useLocation();
  const navigate = useNavigate(); // 👈 Inicializamos el navegador

  // --- LÓGICA DE ATAJOS GLOBALES (F1 y F2) ---
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // F1: Acceso directo a Nueva Venta
      if (e.key === "F1") {
        e.preventDefault(); // Evita abrir la ayuda de Windows
        navigate("/ventas/crear");
      }
      // F2: Acceso directo a Nueva Compra
      if (e.key === "F2") {
        e.preventDefault();
        navigate("/compras/crear");
      }
      // F3: Acceso directo a Listado de Ventas
      if (e.key === "F3") {
        e.preventDefault();
        navigate("/ventas/listado");
      }
      // F4: Acceso directo a Listado de Productos
      if (e.key === "F4") {
        e.preventDefault();
        navigate("/productos/listado");
      }
    };

    // Agregamos el escuchador al objeto window (global)
    window.addEventListener("keydown", handleGlobalKeys);

    // Limpiamos el escuchador cuando el componente se destruye
    return () => {
      window.removeEventListener("keydown", handleGlobalKeys);
    };
  }, []);

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  useEffect(() => {
    // Añadimos estas clases para que AdminLTE sepa que queremos todo fijo
    document.body.classList.add(
      "sidebar-mini",
      "layout-fixed",
      "layout-navbar-fixed",
      "layout-footer-fixed"
    );

    if (isDesktopCollapsed) document.body.classList.add("sidebar-collapse");
    else document.body.classList.remove("sidebar-collapse");

    if (isMobileOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => {
      document.body.classList.remove(
        "sidebar-mini",
        "layout-fixed",
        "layout-navbar-fixed",
        "layout-footer-fixed",
        "sidebar-collapse",
        "sidebar-open"
      );
    };
  }, [isDesktopCollapsed, isMobileOpen]);

  return (
    <>
      <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>
      <div className="wrapper">
        <Navbar />
        <Sidebar />
        <div className="content-wrapper">
          <Outlet /> {/* ← Aquí se renderizan todas las páginas del sistema */}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
