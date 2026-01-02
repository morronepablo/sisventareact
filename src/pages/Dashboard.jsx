// src/pages/Dashboard.jsx
/* eslint-disable react-hooks/static-components */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCounts } from "../services/dashboardService";

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetchCounts().then(setCounts);
  }, []);

  const InfoBox = ({
    permission,
    link,
    color,
    icon,
    title,
    count,
    label,
    extraInfo,
  }) => {
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
              style={{ fontWeight: "600" }}
            >
              {title}
            </span>
            <div className="d-flex justify-content-between align-items-baseline">
              <span
                className="info-box-number"
                style={{ fontSize: "1.2rem", fontWeight: "800" }}
              >
                {count || 0}{" "}
                <small className="text-muted" style={{ fontWeight: "400" }}>
                  {label}
                </small>
              </span>
              {extraInfo}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-12">
          <h1 className="m-0" style={{ fontWeight: "700", fontSize: "2rem" }}>
            Bienvenido {user?.name || "Admin"}
          </h1>
          <hr className="mt-2 mb-4" />
        </div>
      </div>

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
          icon="fas fa-boxes"
          title="Productos registrados"
          count={counts.productos}
          label="productos"
        />

        <InfoBox
          permission="ver_proveedores"
          link="/proveedores/listado"
          color="bg-dark"
          icon="fas fa-truck"
          title="Proveedores registrados"
          count={counts.proveedores}
          label="proveedores"
          extraInfo={
            <span
              className="text-danger"
              style={{ fontWeight: "700", fontSize: "0.85rem" }}
            >
              Deuda: $
              {parseFloat(counts.proveedoresDeuda || 0).toLocaleString("es-AR")}
            </span>
          }
        />

        <InfoBox
          permission="ver_compras"
          link="/compras/listado"
          color="bg-purple"
          icon="fas fa-shopping-cart"
          title="Compras registradas"
          count={counts.compras}
          label="compras"
          extraInfo={
            <span
              className="text-success"
              style={{ fontWeight: "700", fontSize: "0.85rem" }}
            >
              {counts.comprasAnio || 0} año actual
            </span>
          }
        />

        <InfoBox
          permission="ver_clientes"
          link="/clientes/listado"
          color="bg-secondary"
          icon="fas fa-user-friends"
          title="Clientes registrados"
          count={counts.clientes}
          label="clientes"
          extraInfo={
            <span
              className="text-danger"
              style={{ fontWeight: "700", fontSize: "0.85rem" }}
            >
              Deuda: $
              {parseFloat(counts.clientesDeuda || 0).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </span>
          }
        />

        <InfoBox
          permission="ver_ventas"
          link="/ventas/listado"
          color="bg-orange"
          icon="fas fa-cash-register"
          title="Ventas registradas"
          count={counts.ventas}
          label="ventas"
          extraInfo={
            <span
              className="text-success"
              style={{ fontWeight: "700", fontSize: "0.85rem" }}
            >
              {counts.ventasAnio || 0} año actual
            </span>
          }
        />
      </div>
    </div>
  );
};

export default Dashboard;
