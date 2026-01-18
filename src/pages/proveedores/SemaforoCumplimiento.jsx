// src/pages/proveedores/SemaforoCumplimiento.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

// --- ESTILOS DE ARQUITECTURA PARA DATATABLE (Consistencia de Márgenes) ---
const dataTableStyles = `
  #cumplimiento-table_wrapper .dataTables_info {
    padding: 15px !important;
    font-size: 0.85rem;
    color: #6c757d;
  }
  #cumplimiento-table_wrapper .dataTables_paginate {
    padding: 10px 15px !important;
  }
  .card-table-container {
    padding-bottom: 10px;
  }
`;

const SemaforoCumplimiento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    processing: "Procesando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ proveedores",
    infoEmpty: "Sin datos",
    infoFiltered: "(filtrado de _MAX_)",
    zeroRecords: "No se encontraron proveedores analizados",
    emptyTable: "No hay órdenes de compra procesadas aún.",
    paginate: {
      first: "Primero",
      previous: "Ant.",
      next: "Sig.",
      last: "Último",
    },
  };

  useEffect(() => {
    api
      .get("/proveedores/bi/cumplimiento")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- INICIALIZACIÓN DE DATATABLE ---
  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#cumplimiento-table";
      const $ = window.$;

      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          order: [[3, "asc"]], // Ordenar por nivel de cumplimiento (los peores arriba)
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 5, // <--- Configuración solicitada
          language: spanishLanguage,
          dom: "rtip", // Diseño limpio sin el buscador gigante arriba
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, data]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{dataTableStyles}</style>

      <div className="row mb-2">
        <div className="col-sm-8">
          <h1>
            <i className="fas fa-traffic-light text-warning mr-2"></i>
            <b>Semáforo de Cumplimiento</b>
          </h1>
          <p className="text-muted">
            Efectividad logística: Comparativa de unidades pedidas vs recibidas
            por proveedor.
          </p>
        </div>
      </div>
      <hr />

      {/* TARJETAS DE RESUMEN BI */}
      <div className="row">
        <div className="col-md-4">
          <div className="info-box shadow-sm border-left-success">
            <span className="info-box-icon bg-success">
              <i className="fas fa-truck-fast"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text text-bold">
                Proveedores Cumplidores
              </span>
              <span className="info-box-number h3">
                {data.filter((p) => p.score >= 95).length}
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="info-box shadow-sm border-left-danger">
            <span className="info-box-icon bg-danger">
              <i className="fas fa-truck-arrow-right"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text text-bold">
                Proveedores Deficientes
              </span>
              <span className="info-box-number h3">
                {data.filter((p) => p.score < 80).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RANKING CON DATATABLE Paginado */}
      <div className="card card-outline card-primary shadow mt-3">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            <i className="fas fa-clipboard-check mr-2"></i>Ranking de Fiabilidad
            Logística
          </h3>
        </div>
        <div className="card-body p-0 card-table-container">
          <div className="table-responsive">
            <table
              id="cumplimiento-table"
              className="table table-hover table-striped m-0"
            >
              <thead className="thead-dark text-center text-sm">
                <tr>
                  <th>Proveedor</th>
                  <th>Órdenes</th>
                  <th>Pedido vs Recibido</th>
                  <th style={{ width: "20%" }}>Cumplimiento</th>
                  <th>Estado BI</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.map((p) => (
                  <tr key={p.id}>
                    <td className="align-middle px-3">
                      <div className="text-bold">{p.proveedor_nombre}</div>
                      <small className="text-muted">{p.contacto}</small>
                    </td>
                    <td className="text-center align-middle">
                      <span className="badge badge-light border">
                        {p.total_pedidos} pedidos
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <span className="text-muted">
                        {p.total_unidades_pedidas}
                      </span>
                      <i className="fas fa-arrow-right mx-2 text-xs opacity-50"></i>
                      <span className="text-bold">
                        {p.total_unidades_recibidas}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <div
                        className="progress progress-xxs mb-1"
                        style={{ height: "6px" }}
                      >
                        <div
                          className={`progress-bar bg-${
                            p.score >= 95
                              ? "success"
                              : p.score >= 80
                                ? "warning"
                                : "danger"
                          }`}
                          style={{ width: `${p.score}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-bold ${p.color}`}
                        style={{ fontSize: "0.9rem" }}
                      >
                        {p.score}%
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge shadow-sm px-3 py-2 ${
                          p.score >= 95
                            ? "badge-success"
                            : p.score >= 80
                              ? "badge-warning"
                              : "badge-danger"
                        }`}
                        style={{ minWidth: "115px" }}
                      >
                        <i className={`fas ${p.icono} mr-1`}></i> {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white">
          <span className="text-xs text-muted font-italic float-right">
            El score se calcula basado en la diferencia entre lo solicitado y lo
            efectivamente ingresado al stock.
          </span>
        </div>
      </div>

      {/* FOOTER ANALÍTICO */}
      <div className="alert bg-dark text-white mt-4 shadow border-left-warning">
        <div className="row align-items-center">
          <div className="col-md-1 text-center">
            <i className="fas fa-robot text-warning fa-2x"></i>
          </div>
          <div className="col-md-11">
            <h5 className="text-warning text-bold mb-1">
              Inteligencia Logística:
            </h5>
            <p className="mb-0 small">
              Los proveedores en <b>ROJO</b> están comprometiendo tu{" "}
              <b>Lucro Cesante</b>. La falta de entrega te obliga a quebrar
              stock y perder ventas reales. Sugerencia BI: Diversificar compras
              de estos productos para no depender de entregas inciertas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemaforoCumplimiento;
