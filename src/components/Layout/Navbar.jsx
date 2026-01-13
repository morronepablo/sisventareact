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
import api from "../../services/api";
import Swal from "sweetalert2";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleDesktopSidebar, toggleMobileSidebar } = useLayout();
  const { arqueoAbierto, arqueoId } = useNotifications(); // 👈 Ya tenemos arqueoAbierto aquí
  const navigate = useNavigate();

  // --- LOGOUT ACTUALIZADO ---
  const handleLogout = async () => {
    await logout("Cierre manual desde menú");
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
          const response = await api.post("/movimientos/rebuild");
          if (response.data.success) {
            await Swal.fire({
              icon: "success",
              title: "¡Éxito!",
              text: response.data.message,
              confirmButtonText: "Ir al Historial",
            });
            navigate("/movimientos/listado");
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo completar el proceso de reconstrucción.",
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

        {/* INDICADOR DE CAJA ACTUAL - FONDO NEGRO CON BADGE DE ESTADO */}
        <li className="nav-item d-none d-sm-flex align-items-center ml-2">
          <div
            className="badge badge-dark shadow-sm"
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              border: "1px solid #444",
              height: "32px",
            }}
          >
            <i className="fas fa-cash-register mr-2 text-warning"></i>
            <span style={{ fontWeight: "600" }} className="mr-2">
              CAJA N° {user?.caja_id || "1"}
            </span>

            {/* BADGE DE ESTADO (SUCCESS O DANGER) */}
            <span
              className={`badge ${
                arqueoAbierto ? "badge-success" : "badge-danger"
              }`}
              style={{
                fontSize: "0.65rem",
                padding: "3px 7px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {arqueoAbierto ? "Abierta" : "Cerrada"}
            </span>
          </div>
        </li>

        <li className="nav-item d-none d-sm-inline-block ml-2">
          <button
            type="button"
            className="nav-link btn btn-warning text-white"
            style={{ padding: "5px 10px", fontSize: "0.875rem" }}
            onClick={handleRebuildMovimientos}
          >
            <i className="fas fa-sync-alt"></i> Limp. y Reconst. Movim.
          </button>
        </li>
        {arqueoAbierto && (
          <li className="nav-item d-none d-sm-inline-block ml-2">
            <button
              type="button"
              className="nav-link btn btn-success text-white"
              style={{ padding: "5px 10px", fontSize: "0.875rem" }}
              onClick={handleCierreArqueo}
            >
              <small>CTRL</small> +{" "}
              <i
                className="fas fa-arrow-up mr-1"
                style={{ fontSize: "0.7rem" }}
              ></i>{" "}
              + S: Cerrar Caja
            </button>
          </li>
        )}
        <li className="nav-item d-none d-sm-inline-block ml-2 mt-1">
          <span className="badge badge-primary p-2 ml-1">F1: Ventas</span>
          <span className="badge badge-info p-2 ml-1">F2: Compras</span>
          <span className="badge badge-success p-2 ml-1">F4: Productos</span>
          <span className="badge badge-warning p-2 ml-1">F6: Arqueos</span>
          <span className="badge badge-danger p-2 ml-1">F7: Devolución</span>
          <span className="badge badge-dark p-2 ml-1">F9: Proveedores</span>
          <span className="badge badge-secondary p-2 ml-1">F10: Clientes</span>
          <span className="badge badge-primary p-2 ml-1">F11: Dashboard</span>
        </li>
      </ul>

      <ul className="navbar-nav ml-auto">
        <NotificationsDropdown />
        <ClientsDebtDropdown />
        <ProvidersDebtDropdown />
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
