// src/components/layout/Sidebar.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { useNotifications } from "../../context/NotificationContext";
import menuItems from "../../data/menu.json";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const { counts } = useNotifications();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const { closeMobileSidebar } = useLayout();

  const checkIsActive = (item) => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children)
      return item.children.some((child) => checkIsActive(child));
    return false;
  };

  useEffect(() => {
    const autoOpenPaths = {};
    const findAndMarkParents = (items) => {
      items.forEach((item) => {
        if (item.children && checkIsActive(item)) {
          autoOpenPaths[item.id] = true;
          findAndMarkParents(item.children);
        }
      });
    };
    findAndMarkParents(menuItems);
    setOpenMenus((prev) => ({ ...prev, ...autoOpenPaths }));
  }, [location.pathname]);

  const handleMenuClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTotalBadge = (item) => {
    if (!item.permiso || !counts) return null;
    let total = 0;
    let badgeClass = "badge-info";

    if (item.permiso === "ver_usuarios") {
      total = counts.usuarios;
      badgeClass = "badge-primary";
    } else if (item.permiso === "ver_roles") {
      total = counts.roles;
      badgeClass = "badge-success";
    } else if (item.permiso === "ver_permisos") {
      total = counts.permisos;
      badgeClass = "badge-warning";
    } else if (item.permiso === "ver_categorias") {
      total = counts.categorias;
      badgeClass = "badge-danger";
    } else if (item.permiso === "ver_unidades") {
      total = counts.unidades;
      badgeClass = "badge-info";
    } else if (item.permiso === "ver_productos") {
      total = counts.productos;
      badgeClass = "badge-primary";
    } else if (item.permiso === "ver_proveedores") {
      total = counts.proveedores;
      badgeClass = "badge-success";
    } else if (item.permiso === "ver_compras") {
      total = counts.compras;
      badgeClass = "badge-warning";
    } else if (item.permiso === "ver_clientes") {
      total = counts.clientes;
      badgeClass = "badge-danger";
    } else if (item.permiso === "ver_ventas") {
      total = counts.ventas;
      badgeClass = "badge-info";
    } else if (item.permiso === "ver_arqueos") {
      total = counts.arqueos;
      badgeClass = "badge-primary";
    } else if (item.permiso === "ver_combos") {
      total = counts.combos;
      badgeClass = "badge-success";
    } else if (item.permiso === "ver_devoluciones") {
      total = counts.devoluciones;
      badgeClass = "badge-warning";
    }

    return total > 0 ? (
      <span className={`badge ${badgeClass} right`}>{total}</span>
    ) : null;
  };

  const renderMenuItems = (items, level = 0) => {
    return items
      .filter((item) => {
        // Los headers no tienen permiso, siempre se muestran si hay contenido visible debajo (opcional)
        // Por simplicidad, filtramos los que tengan permiso o sean headers
        if (item.type === "header") return true;
        return !item.permiso || hasPermission(item.permiso);
      })
      .map((item, index) => {
        // 1. CASO: ENCABEZADO (HEADER)
        if (item.type === "header") {
          return (
            <li key={`header-${index}`} className="nav-header text-uppercase">
              {item.text}
            </li>
          );
        }

        const isOpen = !!openMenus[item.id];
        const isActive = checkIsActive(item);

        // 2. CASO: MENÚ CON SUBMENÚS (TREEVIEW)
        if (item.children) {
          return (
            <li
              key={item.id}
              className={`nav-item ${isOpen ? "menu-open" : ""}`}
            >
              <a
                href="#"
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={(e) => handleMenuClick(e, item.id)}
              >
                <i className={`nav-icon ${item.icon}`}></i>
                <p>
                  {item.text} <i className="right fas fa-angle-left"></i>
                  {level === 0 && getTotalBadge(item)}
                </p>
              </a>
              <ul
                className="nav nav-treeview"
                style={{ display: isOpen ? "block" : "none" }}
              >
                {renderMenuItems(item.children, level + 1)}
              </ul>
            </li>
          );
        }

        // 3. CASO: LINK SIMPLE
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
      <NavLink to="/dashboard" className="brand-link">
        <img
          src="/src/assets/img/logo.jpg"
          alt="Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: ".8" }}
        />
        <span className="brand-text font-weight-light">
          {import.meta.env.VITE_APP_NAME || "Sistema de Ventas"}
        </span>
      </NavLink>
      <div className="sidebar">
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
              <NavLink
                to="/dashboard"
                className="d-block"
                onClick={closeMobileSidebar}
              >
                {user.name || user.nombre || "Usuario"}
              </NavLink>
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
