// src/components/layout/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLayout } from "../../context/LayoutContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleDesktopSidebar, toggleMobileSidebar } = useLayout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) toggleMobileSidebar();
    else toggleDesktopSidebar();
  };

  return (
    <nav
      className={`main-header navbar navbar-expand ${
        theme === "dark" ? "navbar-dark" : "navbar-white navbar-light"
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
      </ul>
      <ul className="navbar-nav ml-auto">
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
      </ul>
    </nav>
  );
};

export default Navbar;
