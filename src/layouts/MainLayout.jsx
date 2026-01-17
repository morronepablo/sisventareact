// src/layouts/MainLayout.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import Footer from "../components/Layout/Footer";
import { useNotifications } from "../context/NotificationContext"; // 👈 IMPORTADO
import Swal from "sweetalert2";

const MainLayout = () => {
  const { isDesktopCollapsed, isMobileOpen, closeMobileSidebar } = useLayout();

  // 📥 Extraemos arqueoId y arqueoAbierto (nombres idénticos al contexto)
  const { arqueoId, arqueoAbierto, refreshAll } = useNotifications();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === "F1") {
        e.preventDefault();
        navigate("/ventas/crear");
      }
      if (e.key === "F2") {
        e.preventDefault();
        navigate("/compras/crear");
      }
      if (e.key === "F4") {
        e.preventDefault();
        navigate("/productos/listado");
      }
      if (e.key === "F6") {
        e.preventDefault();
        navigate("/arqueos/listado");
      }
      if (e.key === "F7") {
        e.preventDefault();
        navigate("/devoluciones/crear");
      }
      if (e.key === "F9" && !e.ctrlKey) {
        e.preventDefault();
        navigate("/proveedores/listado");
      }
      if (e.key === "F10") {
        e.preventDefault();
        navigate("/clientes/listado");
      }
      if (e.key === "F11") {
        e.preventDefault();
        navigate("/dashboard");
      }

      // ✨ ATAJO SEGURO: CTRL + SHIFT + S
      if (e.ctrlKey && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();

        if (arqueoAbierto && arqueoId) {
          navigate(`/arqueos/cierre/${arqueoId}`);
        } else {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "Atención",
            text: "No hay un arqueo abierto actualmente",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      }
      // ✨ ATAJO SEGURO: SHIFT + F1
      if (e.shiftKey && e.key === "F1") {
        e.preventDefault();
        navigate("/ventas/listado");
      }
      // ✨ ATAJO SEGURO: SHIFT + F2
      if (e.shiftKey && e.key === "F2") {
        e.preventDefault();
        navigate("/compras/listado");
      }
      // ✨ ATAJO SEGURO: SHIFT + F6
      if (e.shiftKey && e.key === "F6") {
        e.preventDefault();
        navigate("/arqueos/crear");
      }
      // ✨ ATAJO SEGURO: SHIFT + F7
      if (e.shiftKey && e.key === "F7") {
        e.preventDefault();
        navigate("/devoluciones/listado");
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [arqueoId, arqueoAbierto]); // 👈 Dependencias sincronizadas

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.add(
      "sidebar-mini",
      "layout-fixed",
      "layout-navbar-fixed",
      "layout-footer-fixed",
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
        "sidebar-open",
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
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
