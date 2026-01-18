// src/pages/productos/MonitorRotacion.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const dataTableStyles = `
  #rotacion-table_wrapper .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  #rotacion-table_wrapper .dataTables_paginate { padding: 10px 15px !important; }
  .status-pulse { height: 10px; width: 10px; border-radius: 50%; display: inline-block; }
  .pulse-green { background: #28a745; box-shadow: 0 0 8px #28a745; animation: pulse-green 2s infinite; }
  @keyframes pulse-green { 0% { transform: scale(0.95); } 70% { transform: scale(1.1); } 100% { transform: scale(0.95); } }
  .card-table-container { padding-bottom: 10px; }
`;

const MonitorRotacion = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/productos/bi/monitor-rotacion")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#rotacion-table";
      const $ = window.$;
      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
        $(tableId).DataTable({
          paging: true,
          ordering: true,
          // 🚀 ORDENACIÓN CRÍTICA: Columna 3 (Antigüedad) ASCENDENTE
          order: [[3, "asc"]],
          info: true,
          pageLength: 5,
          language: {
            info: "Mostrando _START_ a _END_ de _TOTAL_ productos",
            paginate: { previous: "Anterior", next: "Siguiente" },
          },
          dom: "rtip",
        });
      }, 300);
      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, data]);

  const productosHoy = data.filter((p) => p.dias_inactivo === 0);

  const totalesPorUnidad = productosHoy.reduce((acc, curr) => {
    const unidad = curr.unidad_nombre || "Unid.";
    const cantidadActual = parseFloat(curr.cantidad_hoy) || 0;
    acc[unidad] = (acc[unidad] || 0) + cantidadActual;
    return acc;
  }, {});

  const getBadgeAction = (dias) => {
    // Agregamos un span oculto con el número para que DataTable ordene por el número y no por el texto
    const sortKey = (
      <span style={{ display: "none" }}>
        {dias.toString().padStart(3, "0")}
      </span>
    );

    if (dias === 0)
      return (
        <div className="d-flex justify-content-center align-items-center">
          {sortKey}
          <span className="badge badge-success px-3 shadow-sm d-flex align-items-center">
            <div className="status-pulse pulse-green mr-2"></div> ¡VENDIDO HOY!
          </span>
        </div>
      );
    if (dias <= 3)
      return (
        <div className="text-center">
          {sortKey}
          <span className="badge badge-info px-3 shadow-sm">
            Hace {dias} días
          </span>
        </div>
      );
    if (dias <= 7)
      return (
        <div className="text-center">
          {sortKey}
          <span className="badge badge-primary px-3 shadow-sm">
            Esta semana
          </span>
        </div>
      );
    if (dias <= 15)
      return (
        <div className="text-center">
          {sortKey}
          <span className="badge badge-warning px-3 text-white shadow-sm">
            Quincena activa
          </span>
        </div>
      );
    return (
      <div className="text-center">
        {sortKey}
        <span className="badge badge-secondary px-3 shadow-sm">Estancado</span>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{dataTableStyles}</style>
      <h1 className="text-bold">
        <i className="fas fa-sync-alt text-info mr-2"></i>Radar de Rotación Real
      </h1>
      <p className="text-muted small text-uppercase font-weight-bold">
        Análisis cronológico: ¿Hace cuánto no sale cada producto?
      </p>
      <hr />

      <div className="row">
        <div className="col-md-3">
          <div className="info-box bg-gradient-success shadow-sm">
            <span className="info-box-icon">
              <i className="fas fa-layer-group"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text text-bold">Variedad Hoy</span>
              <span className="info-box-number h4">
                {productosHoy.length} ítems
              </span>
            </div>
          </div>
        </div>

        {Object.keys(totalesPorUnidad).length > 0 ? (
          Object.keys(totalesPorUnidad).map((unidad, idx) => (
            <div className="col-md-3" key={idx}>
              <div className="info-box bg-white shadow-sm border-left-info">
                <span className="info-box-icon text-info">
                  <i
                    className={
                      unidad.toLowerCase().includes("gram") ||
                      unidad.toLowerCase().includes("kg")
                        ? "fas fa-balance-scale"
                        : "fas fa-boxes"
                    }
                  ></i>
                </span>
                <div className="info-box-content">
                  <span className="info-box-text text-muted text-bold">
                    Total {unidad} Hoy
                  </span>
                  <span className="info-box-number h4 text-info">
                    {totalesPorUnidad[unidad].toLocaleString("es-AR")}{" "}
                    <small>{unidad}</small>
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-md-3">
            <div className="info-box bg-white shadow-sm border-left-secondary">
              <span className="info-box-icon text-muted">
                <i className="fas fa-ghost"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-muted text-bold">
                  Volumen Hoy
                </span>
                <span className="info-box-number h4 text-muted">
                  0 <small>ítems</small>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card card-outline card-info shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold text-info">
            Frescura de Inventario
          </h3>
        </div>
        <div className="card-body p-0 card-table-container">
          <div className="table-responsive">
            <table
              id="rotacion-table"
              className="table table-hover table-striped mb-0"
            >
              <thead className="thead-dark text-xs text-center">
                <tr>
                  <th className="text-left pl-3">Producto / Código</th>
                  <th style={{ width: "15%" }}>Stock Actual</th>
                  <th style={{ width: "15%" }}>Última Salida</th>
                  <th style={{ width: "20%" }}>Antigüedad</th>
                  <th style={{ width: "15%" }}>Acción Recomendada</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.map((p, i) => (
                  <tr key={i}>
                    <td className="align-middle pl-3">
                      <div
                        className="text-bold text-uppercase"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {p.nombre}
                      </div>
                      <small className="text-muted font-weight-bold">
                        {p.codigo}
                      </small>
                    </td>
                    <td className="text-center align-middle">
                      <span className="badge badge-light border px-2 shadow-xs">
                        {p.stock}{" "}
                        <small className="text-muted">
                          {p.unidad_nombre || "Unid"}
                        </small>
                      </span>
                    </td>
                    <td className="text-center align-middle font-weight-bold">
                      {p.dias_inactivo === 0 ? (
                        <span className="text-success text-bold">
                          <i className="fas fa-calendar-check mr-1"></i>Hoy
                        </span>
                      ) : (
                        <span className="text-muted small">
                          {p.ultima_fecha === "Sin Ventas"
                            ? "–"
                            : new Date(p.ultima_fecha).toLocaleDateString(
                                "es-AR",
                              )}
                        </span>
                      )}
                    </td>
                    <td className="align-middle">
                      {getBadgeAction(p.dias_inactivo)}
                    </td>
                    <td className="text-center align-middle">
                      {p.dias_inactivo > 15 ? (
                        <button
                          className="btn btn-xs btn-outline-danger shadow-sm px-2"
                          onClick={() =>
                            (window.location.href = "/productos/promociones")
                          }
                        >
                          <i className="fas fa-tag mr-1"></i> Forzar Salida
                        </button>
                      ) : (
                        <span className="text-success small font-weight-bold">
                          <i className="fas fa-check-double mr-1"></i> Saludable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-top-0">
          <span className="text-xs text-muted font-italic float-right">
            El Radar analiza ventas directas y combos para determinar la
            rotación real.
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonitorRotacion;
