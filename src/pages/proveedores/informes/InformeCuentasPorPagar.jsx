// src/pages/proveedores/informes/InformeCuentasPorPagar.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

// --- ESTILOS PARA CORREGIR EL ESPACIADO DEL DATATABLE ---
const dataTableStyles = `
  #cuentas-pagar-table_wrapper .dataTables_info {
    padding: 15px !important;
    font-size: 0.85rem;
    color: #6c757d;
  }
  #cuentas-pagar-table_wrapper .dataTables_paginate {
    padding: 10px 15px !important;
  }
  .card-table-container {
    padding-bottom: 10px;
  }
`;

const InformeCuentasPorPagar = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  const spanishLanguage = {
    processing: "Procesando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ deudas",
    infoEmpty: "Sin deudas",
    infoFiltered: "(filtrado de _MAX_)",
    zeroRecords: "No se encontraron deudas",
    emptyTable: "No existen deudas con proveedores.",
    paginate: {
      first: "Primero",
      previous: "Ant.",
      next: "Sig.",
      last: "Último",
    },
  };

  useEffect(() => {
    api
      .get("/proveedores/informes/cuentas-por-pagar")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#cuentas-pagar-table";
      const $ = window.$;
      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
        $(tableId).DataTable({
          paging: true,
          ordering: true,
          order: [[3, "desc"]],
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 5,
          language: spanishLanguage,
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

  const handlePDF = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${API_URL}/api/proveedores/informes/cuentas-por-pagar-pdf?token=${token}`,
      "_blank",
    );
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      {/* Inyectamos los estilos de corrección */}
      <style>{dataTableStyles}</style>

      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <i className="fas fa-file-invoice-dollar text-primary mr-2"></i>
              <b>Cuentas por Pagar (Proveedores)</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="card card-primary card-outline shadow">
          <div className="card-header">
            <h3 className="card-title text-bold">
              Saldos Adeudados por Proveedor
            </h3>
            <button
              className="btn btn-danger btn-sm float-right shadow-sm"
              onClick={handlePDF}
            >
              <i className="fas fa-file-pdf mr-1"></i> Exportar Informe PDF
            </button>
          </div>

          {/* CAMBIO CLAVE: Quitamos p-0 para manejar el espaciado manualmente */}
          <div className="card-body p-0 card-table-container">
            <div className="table-responsive">
              <table
                id="cuentas-pagar-table"
                className="table table-hover table-striped mb-0"
              >
                <thead className="thead-dark text-center text-sm">
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Proveedor / Marca</th>
                    <th className="text-center">Facturas Pend.</th>
                    <th className="text-right">Monto Total</th>
                    <th className="text-center" style={{ width: "120px" }}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.map((d, i) => (
                    <tr key={i}>
                      <td className="text-center align-middle font-weight-bold">
                        {i + 1}
                      </td>
                      <td className="align-middle text-uppercase">
                        <div className="text-bold">{d.empresa}</div>
                        <span className="badge badge-secondary">
                          {d.marca || "Distribuidora"}
                        </span>
                      </td>
                      <td className="text-center align-middle font-weight-bold">
                        <span className="badge badge-pill badge-warning">
                          {d.facturas_pendientes}
                        </span>
                      </td>
                      <td
                        className="text-right align-middle text-danger font-weight-bold"
                        style={{ fontSize: "1rem" }}
                      >
                        {formatMoney(d.saldo_pendiente)}
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-outline-primary btn-sm btn-block shadow-sm"
                          onClick={() =>
                            (window.location.href = `/proveedores/pagos/${d.id}`)
                          }
                        >
                          <i className="fas fa-hand-holding-usd mr-1"></i> Pagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer bg-white border-top-0">
            <span className="text-xs text-muted font-italic float-right">
              Utilice el buscador para filtrar deudas específicas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformeCuentasPorPagar;
