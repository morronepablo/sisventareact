// src/components/layout/NotificationsDropdown.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext"; // ← Importa useTheme

const NotificationsDropdown = () => {
  const { theme } = useTheme(); // ← Obtén el tema actual
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await api.get("/productos/bajo-stock");
        setLowStockProducts(res.data);
      } catch (error) {
        console.error("Error al cargar productos con bajo stock:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  const lowStockCount = lowStockProducts.length;

  // Define el ícono según el tema
  const bellIconClass = theme === "dark" ? "far fa-bell" : "fas fa-bell";

  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link"
        data-toggle="dropdown"
        href="#"
        style={{ position: "relative" }}
      >
        <i
          className={bellIconClass} // ← Ícono dinámico según tema
          style={{ fontSize: "1.2rem", marginRight: "4px" }}
        ></i>
        {lowStockCount > 0 && (
          <span
            className="badge badge-warning navbar-badge"
            style={{ position: "absolute", top: "2px", right: "1px" }}
          >
            {lowStockCount}
          </span>
        )}
      </a>
      <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
        <span className="dropdown-item dropdown-header">
          {lowStockCount} Productos con Bajo Stock
        </span>
        <div className="dropdown-divider"></div>
        {loading ? (
          <p className="dropdown-item text-center">Cargando...</p>
        ) : lowStockProducts.length === 0 ? (
          <a href="#" className="dropdown-item">
            <i className="fas fa-check text-success mr-2"></i> No hay productos
            con bajo stock
          </a>
        ) : (
          <>
            {lowStockProducts.map((prod) => (
              <React.Fragment key={prod.id}>
                <a href={`/productos/ver/${prod.id}`} className="dropdown-item">
                  <i className="fas fa-exclamation-triangle text-danger mr-2"></i>
                  {prod.nombre.length > 20
                    ? prod.nombre.substring(0, 20) + "..."
                    : prod.nombre}
                  <span className="float-right text-muted text-sm">
                    Stock: {prod.stock} / Mínimo: {prod.stock_minimo}
                  </span>
                </a>
                <div className="dropdown-divider"></div>
              </React.Fragment>
            ))}
          </>
        )}
        <a href="/productos/listado" className="dropdown-item dropdown-footer">
          Ver todos los productos
        </a>
      </div>
    </li>
  );
};

export default NotificationsDropdown;
