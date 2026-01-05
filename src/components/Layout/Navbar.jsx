// src/components/layout/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLayout } from "../../context/LayoutContext";
import { useNotifications } from "../../context/NotificationContext";
import NotificationsDropdown from "./NotificationsDropdown";
import ProvidersDebtDropdown from "./ProvidersDebtDropdown";
import ClientsDebtDropdown from "./ClientsDebtDropdown";
import api from "../../services/api"; // 👈 Importamos api para la reconstrucción
import Swal from "sweetalert2";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleDesktopSidebar, toggleMobileSidebar } = useLayout();
  const { arqueoAbierto, arqueoId } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) toggleMobileSidebar();
    else toggleDesktopSidebar();
  };

  const handleCierreArqueo = () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esto cerrará el arqueo actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, ir al cierre",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/arqueos/cierre/${arqueoId}`);
      }
    });
  };

  // --- NUEVA FUNCIÓN: LIMPIAR Y RECONSTRUIR MOVIMIENTOS ---
  const handleRebuildMovimientos = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto eliminará todos los movimientos y los reconstruirá desde compras, ventas, devoluciones y ajustes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f39c12",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, reconstruir",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Mostrar estado de carga
        Swal.fire({
          title: "Reconstruyendo...",
          text: "Por favor espere mientras se procesan los datos históricos.",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          // Llamada al backend
          const response = await api.post("/movimientos/rebuild");

          if (response.data.success) {
            await Swal.fire({
              icon: "success",
              title: "¡Éxito!",
              text: response.data.message,
              confirmButtonText: "Ir al Historial",
            });
            // Opcional: Redirigir al historial de movimientos
            navigate("/movimientos/listado");
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo completar el proceso de reconstrucción. Verifique la conexión con el servidor.",
          });
        }
      }
    });
  };

  return (
    <nav
      className={`main-header navbar navbar-expand ${
        theme === "dark" ? "navbar-dark bg-dark" : "navbar-white navbar-light"
      }`}
    >
      <ul className="navbar-nav">
        <li className="nav-item">
          <a
            className="nav-link"
            onClick={handleToggleSidebar}
            href="#"
            role="button"
          >
            <i className="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>

        {/* Botones principales */}
        <li className="nav-item d-none d-sm-inline-block ml-2">
          <Link
            to="/ventas/crear"
            className="nav-link btn btn-primary text-white"
            style={{ padding: "5px 10px", fontSize: "0.875rem" }}
          >
            <i className="fas fa-cash-register"></i> Vender
          </Link>
        </li>
        <li className="nav-item d-none d-sm-inline-block ml-2">
          <Link
            to="/compras/crear"
            className="nav-link btn btn-info text-white"
            style={{ padding: "5px 10px", fontSize: "0.875rem" }}
          >
            <i className="fas fa-shopping-cart"></i> Comprar
          </Link>
        </li>
        <li className="nav-item d-none d-sm-inline-block ml-2">
          <Link
            to="/devoluciones/crear"
            className="nav-link btn btn-danger text-white"
            style={{ padding: "5px 10px", fontSize: "0.875rem" }}
          >
            <i className="fas fa-rotate-left"></i> Devolver
          </Link>
        </li>

        {/* Botón Reconstruir Actualizado */}
        <li className="nav-item d-none d-sm-inline-block ml-2">
          <button
            type="button"
            className="nav-link btn btn-warning text-white"
            style={{ padding: "5px 10px", fontSize: "0.875rem" }}
            onClick={handleRebuildMovimientos}
          >
            <i className="fas fa-sync-alt"></i> Limpiar y Reconstruir
            Movimientos
          </button>
        </li>

        {/* BOTÓN CIERRE ARQUEO */}
        {arqueoAbierto && (
          <li className="nav-item d-none d-sm-inline-block ml-2">
            <button
              type="button"
              className="nav-link btn btn-success text-white"
              style={{ padding: "5px 10px", fontSize: "0.875rem" }}
              onClick={handleCierreArqueo}
            >
              <i className="fas fa-lock"></i> Cierre Arqueo
            </button>
          </li>
        )}
      </ul>

      <ul className="navbar-nav ml-auto">
        <NotificationsDropdown />
        <ClientsDebtDropdown />
        <ProvidersDebtDropdown />

        {/* Perfil de Usuario */}
        {user && (
          <li className="nav-item dropdown user-menu">
            <a
              href="#"
              className="nav-link dropdown-toggle"
              data-toggle="dropdown"
            >
              <img
                src="/src/assets/img/usuario.png"
                className="user-image img-circle elevation-2"
                alt="User"
              />
              <span className="d-none d-md-inline">
                {user.name || user.nombre}
              </span>
            </a>
            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
              <li className="user-header bg-primary">
                <img
                  src="/src/assets/img/usuario.png"
                  className="img-circle elevation-2"
                  alt="User"
                />
                <p>
                  {user.name || user.nombre}
                  <small>{user.email}</small>
                </p>
              </li>
              <li className="user-footer">
                <button
                  onClick={handleLogout}
                  className="btn btn-default btn-flat float-right"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </li>
        )}

        {/* Modo oscuro */}
        <li className="nav-item">
          <a
            className="nav-link"
            onClick={toggleTheme}
            style={{ cursor: "pointer" }}
          >
            {theme === "light" ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun"></i>
            )}
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
