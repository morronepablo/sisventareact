// src/components/layout/NotificationsDropdown.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const NotificationsDropdown = () => {
  const { theme } = useTheme();
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
            maxHeight: "260px", // Altura aproximada para 4-5 productos
            overflowY: "auto",
            overflowX: "hidden",
          }}
          className="low-stock-scroll-container"
        >
          {loading ? (
            <p className="dropdown-item text-center">Cargando...</p>
          ) : lowStockProducts.length === 0 ? (
            <a href="#" className="dropdown-item">
              <i className="fas fa-check text-success mr-2"></i> No hay
              productos con bajo stock
            </a>
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
        {/* FIN DEL CONTENEDOR CON SCROLL */}

        <a href="/productos/listado" className="dropdown-item dropdown-footer">
          Ver todos los productos
        </a>
      </div>

      {/* ESTILO OPCIONAL PARA HACER EL SCROLL MÁS FINO (Chrome/Safari) */}
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
