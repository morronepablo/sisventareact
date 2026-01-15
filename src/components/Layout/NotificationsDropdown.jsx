// src/components/layout/NotificationsDropdown.jsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext"; // Importamos el contexto

const NotificationsDropdown = () => {
  const { theme } = useTheme();
  // EXTRAEMOS LOS DATOS DIRECTAMENTE DEL CONTEXTO GLOBAL
  const { lowStockProducts } = useNotifications();

  const lowStockCount = lowStockProducts.length;
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
          className={bellIconClass}
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

        {/* CONTENEDOR CON SCROLL PARA LOS PRODUCTOS */}
        <div
          style={{
            maxHeight: "260px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
          className="low-stock-scroll-container"
        >
          {lowStockProducts.length === 0 ? (
            <div className="dropdown-item">
              <i className="fas fa-check text-success mr-2"></i> No hay
              productos con bajo stock
            </div>
          ) : (
            <>
              {lowStockProducts.map((prod) => (
                <React.Fragment key={prod.id}>
                  <a
                    href={`/productos/ver/${prod.id}`}
                    className="dropdown-item"
                  >
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle text-danger mr-2"></i>
                      <div
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {prod.nombre}
                      </div>
                    </div>
                    <span
                      className="text-muted text-sm d-block"
                      style={{ marginLeft: "25px" }}
                    >
                      Stock:{" "}
                      <span className="text-danger font-weight-bold">
                        {prod.stock}
                      </span>{" "}
                      / Mín: {prod.stock_minimo}
                    </span>
                  </a>
                  <div className="dropdown-divider"></div>
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        <a href="/productos/listado" className="dropdown-item dropdown-footer">
          Ver todos los productos
        </a>
      </div>

      <style>{`
        .low-stock-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .low-stock-scroll-container::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .low-stock-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #b3b3b3;
        }
      `}</style>
    </li>
  );
};

export default NotificationsDropdown;
