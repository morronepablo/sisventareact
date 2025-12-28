// src/pages/Dashboard.jsx
/* eslint-disable react-hooks/static-components */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCounts } from "../services/dashboardService";

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [counts, setCounts] = useState({
    usuarios: 0,
    roles: 0,
    permisos: 0,
    categorias: 0,
    unidades: 0,
    productos: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCounts();
      setCounts(data);
    };
    loadData();
  }, []);

  const InfoBox = ({ permission, link, color, icon, title, count, label }) => {
    if (!hasPermission(permission)) return null;

    return (
      <div className="col-md-3 col-sm-6 col-12 mb-3">
        <div className="info-box zoomP shadow-sm">
          <Link to={link} className={`info-box-icon ${color}`}>
            <span>
              <i className={icon}></i>
            </span>
          </Link>
          <div className="info-box-content">
            <span
              className="info-box-text text-dark"
              style={{ fontWeight: "500" }}
            >
              {title}
            </span>
            <span
              className="info-box-number"
              style={{ fontSize: "1.25rem", fontWeight: "800" }}
            >
              {count}{" "}
              <small
                className="text-muted"
                style={{ fontSize: "0.9rem", fontWeight: "400" }}
              >
                {label}
              </small>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid pt-3">
      {/* Título idéntico al original */}
      <div className="row mb-2">
        <div className="col-12">
          <h1 className="m-0" style={{ fontWeight: "700", fontSize: "2rem" }}>
            Bienvenido {user?.name || "Admin"}
          </h1>
          <hr className="mt-2 mb-4" />
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="row">
        <InfoBox
          permission="ver_roles"
          link="/roles/listado"
          color="bg-info"
          icon="fas fa-user-check"
          title="Roles registrados"
          count={counts.roles}
          label="roles"
        />
        <InfoBox
          permission="ver_usuarios"
          link="/usuarios/listado"
          color="bg-primary"
          icon="fas fa-users"
          title="Usuarios registrados"
          count={counts.usuarios}
          label="usuarios"
        />
        <InfoBox
          permission="ver_categorias"
          link="/categorias/listado"
          color="bg-success"
          icon="fas fa-tags"
          title="Categorías registradas"
          count={counts.categorias}
          label="categorías"
        />
        <InfoBox
          permission="ver_unidades"
          link="/unidades/listado"
          color="bg-warning"
          icon="fas fa-weight-hanging"
          title="Unidades registradas"
          count={counts.unidades}
          label="unidades"
        />
        <InfoBox
          permission="ver_productos"
          link="/productos/listado"
          color="bg-danger"
          icon="fas fa-boxes-stacked"
          title="Productos registrados"
          count={counts.productos}
          label="productos"
        />
      </div>
    </div>
  );
};

export default Dashboard;
