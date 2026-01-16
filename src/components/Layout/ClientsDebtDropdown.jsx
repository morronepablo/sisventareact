// src/components/layout/ClientsDebtDropdown.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

const ClientsDebtDropdown = () => {
  const { clientsWithDebt, refreshClientDebts } = useNotifications();

  useEffect(() => {
    refreshClientDebts();
  }, [refreshClientDebts]);

  const totalDebt = clientsWithDebt.reduce(
    (acc, curr) => acc + parseFloat(curr.deuda || 0),
    0
  );
  const count = clientsWithDebt.length;

  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link"
        data-toggle="dropdown"
        href="#"
        style={{ position: "relative" }}
      >
        <i className="far fa-user" style={{ fontSize: "1.1rem" }}></i>
        {count > 0 && (
          <span
            className="badge badge-danger navbar-badge"
            style={{ position: "absolute", top: "2px", right: "1px" }}
          >
            {count}
          </span>
        )}
      </a>

      <div
        className="dropdown-menu dropdown-menu-lg dropdown-menu-right"
        style={{ minWidth: "380px", padding: "0" }}
      >
        <span className="dropdown-item dropdown-header bg-light">
          <b>{count}</b> Clientes con Deuda
        </span>
        <div className="dropdown-divider"></div>

        {/* CONTENEDOR CON SCROLL CONFIGURADO A 260px */}
        <div
          className="clients-debt-scroll-container"
          style={{
            maxHeight: "160px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {clientsWithDebt.length === 0 ? (
            <div className="dropdown-item text-center py-3">
              <i className="fas fa-check text-success mr-2"></i> Sin deudas de
              clientes
            </div>
          ) : (
            clientsWithDebt.map((c) => (
              <React.Fragment key={c.id}>
                <Link to={`/clientes/pagos/${c.id}`} className="dropdown-item">
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
                      <span className="text-sm">{c.nombre_completo}</span>
                    </div>
                    <span
                      className="text-xs text-muted"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Deuda:{" "}
                      <span className="text-danger text-bold">
                        ${parseFloat(c.deuda).toLocaleString("es-AR")}
                      </span>{" "}
                      / Mora: {c.mora}
                    </span>
                  </div>
                </Link>
                <div className="dropdown-divider"></div>
              </React.Fragment>
            ))
          )}
        </div>

        {count > 0 && (
          <div className="dropdown-item d-flex justify-content-between align-items-center bg-warning py-2 px-3 text-white border-top border-bottom">
            <span className="text-muted">Deuda Total: </span>
            <span
              className="text-bold text-danger"
              style={{ fontSize: "1.1rem" }}
            >
              ${totalDebt.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="dropdown-divider"></div>
        <Link
          to="/clientes/listado"
          className="dropdown-item dropdown-footer bg-light"
        >
          <b>Ver todos los clientes</b>
        </Link>
      </div>

      <style>{`
        .clients-debt-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .clients-debt-scroll-container::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .clients-debt-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #b3b3b3;
        }
      `}</style>
    </li>
  );
};

export default ClientsDebtDropdown;
