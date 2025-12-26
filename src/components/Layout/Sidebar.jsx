// src/components/layout/Sidebar.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import menuItems from "../../data/menu.json";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const { user, hasPermission } = useAuth(); // ← user puede ser null
  const { closeMobileSidebar } = useLayout();

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path))
    );
    if (activeParent) setOpenMenu(activeParent.id);
    console.log("Menú cargado:", menuItems);
  }, [location.pathname]);

  const handleMenuClick = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const renderMenuItems = (items) => {
    return items
      .filter((item) => !item.permiso || hasPermission(item.permiso))
      .map((item) => {
        const isActiveParent = openMenu === item.id;

        if (item.children) {
          return (
            <li
              key={item.id}
              className={`nav-item ${isActiveParent ? "menu-open" : ""}`}
            >
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick(item.id);
                }}
              >
                <i className={`nav-icon ${item.icon}`}></i>
                <p>
                  {item.text} <i className="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                {renderMenuItems(item.children)}
              </ul>
            </li>
          );
        }

        return (
          <li key={item.id} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMobileSidebar}
            >
              <i className={`nav-icon ${item.icon}`}></i>
              <p>{item.text}</p>
            </NavLink>
          </li>
        );
      });
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <div className="brand-link">
        <img
          src="/src/assets/img/logo.jpg"
          alt="Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: ".8" }}
        />
        <span className="brand-text font-weight-light">
          {import.meta.env.VITE_APP_NAME || "Sistema de Ventas"}
        </span>
      </div>
      <div className="sidebar">
        {/* Solo muestra el user-panel si hay usuario */}
        {user && (
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="image">
              <img
                src="/src/assets/img/usuario.png"
                className="img-circle elevation-2"
                alt="User"
              />
            </div>
            <div className="info">
              <a href="#" className="d-block">
                {user.name || user.nombre || "Usuario"}
              </a>
            </div>
          </div>
        )}
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            {renderMenuItems(menuItems)}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
