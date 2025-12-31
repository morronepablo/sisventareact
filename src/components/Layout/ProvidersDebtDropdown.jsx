// src/components/layout/ProvidersDebtDropdown.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

const ProvidersDebtDropdown = () => {
  const { providersWithDebt, refreshProviderDebts } = useNotifications();

  useEffect(() => {
    refreshProviderDebts();
  }, [refreshProviderDebts]);

  const totalDebt = providersWithDebt.reduce(
    (acc, curr) => acc + parseFloat(curr.deuda || 0),
    0
  );
  const count = providersWithDebt.length;

  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link"
        data-toggle="dropdown"
        href="#"
        style={{ position: "relative" }}
      >
        <i className="fas fa-truck-fast" style={{ fontSize: "1.1rem" }}></i>
        {count > 0 && (
          <span
            className="badge badge-danger navbar-badge"
            style={{ position: "absolute", top: "2px", right: "1px" }}
          >
            {count}
          </span>
        )}
      </a>

      {/* Ajuste de ancho aquí: minWidth: "350px" */}
      <div
        className="dropdown-menu dropdown-menu-lg dropdown-menu-right"
        style={{ minWidth: "380px", padding: "0" }}
      >
        <span className="dropdown-item dropdown-header bg-light">
          <b>{count}</b> Proveedores con Deuda
        </span>
        <div className="dropdown-divider"></div>

        <div
          className="dropdown-scroll"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {providersWithDebt.length === 0 ? (
            <div className="dropdown-item text-center py-3">
              <i className="fas fa-check text-success mr-2"></i> Sin deudas
              pendientes
            </div>
          ) : (
            providersWithDebt.map((p) => (
              <React.Fragment key={p.id}>
                <Link
                  to={`/proveedores/pagos/${p.id}`}
                  className="dropdown-item"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginRight: "10px",
                      }}
                    >
                      <i className="fas fa-exclamation-triangle text-danger mr-2"></i>
                      <span className="text-sm">{p.nombre_completo}</span>
                    </div>
                    <span
                      className="text-bold text-danger"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      ${" "}
                      {parseFloat(p.deuda).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </Link>
                <div className="dropdown-divider"></div>
              </React.Fragment>
            ))
          )}
        </div>

        {count > 0 && (
          <div className="dropdown-item text-center bg-gray-light py-2">
            <span className="text-muted">Deuda acumulada: </span>
            <span
              className="text-bold text-danger"
              style={{ fontSize: "1.1rem" }}
            >
              ${" "}
              {totalDebt.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="dropdown-divider"></div>
        <Link
          to="/proveedores/listado"
          className="dropdown-item dropdown-footer bg-light"
        >
          <b>Ver todos los proveedores</b>
        </Link>
      </div>

      {/* Estilo para el scrollbar fino */}
      <style>{`
        .dropdown-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
      `}</style>
    </li>
  );
};

export default ProvidersDebtDropdown;
