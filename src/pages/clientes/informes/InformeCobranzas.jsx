// src/pages/clientes/informes/InformeCobranzas.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../../components/LoadingSpinner";

// --- ESTILOS DE ARQUITECTURA PARA DATATABLE (Sincronizados con el resto del sistema) ---
const dataTableStyles = `
  #cobranzas-table_wrapper .dataTables_info {
    padding: 15px !important;
    font-size: 0.85rem;
    color: #6c757d;
  }
  #cobranzas-table_wrapper .dataTables_paginate {
    padding: 10px 15px !important;
  }
  .card-table-container {
    padding-bottom: 10px;
  }
`;

const InformeCobranzas = () => {
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
    info: "Mostrando _START_ a _END_ de _TOTAL_ deudores",
    infoEmpty: "Sin deudores",
    infoFiltered: "(filtrado de _MAX_)",
    zeroRecords: "No se encontraron clientes en mora",
    emptyTable: "No existen saldos pendientes de clientes.",
    paginate: {
      first: "Primero",
      previous: "Ant.",
      next: "Sig.",
      last: "Último",
    },
  };

  useEffect(() => {
    api
      .get("/clientes/informes/cobranzas")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- INICIALIZACIÓN DE DATATABLE CON CONFIGURACIÓN DE 5 FILAS ---
  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#cobranzas-table";
      const $ = window.$;

      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          order: [[3, "desc"]], // Ordenar por Saldo Pendiente de mayor a menor
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 5, // <--- Configuración solicitada
          language: spanishLanguage,
          dom: "rtip", // Diseño limpio
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, data]);

  const handleReclamar = async (id) => {
    Swal.fire({
      title: "Enviando reclamo...",
      text: "Por favor espere mientras el bot procesa el envío por WhatsApp.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await api.post(`/clientes/reclamar-deuda/${id}`);
      Swal.fire("¡Enviado!", res.data.message, "success");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Error al conectar con el bot de WhatsApp.";
      Swal.fire("Error", msg, "error");
    }
  };

  const handlePDF = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${API_URL}/api/clientes/informes/cobranzas-pdf?token=${token}`,
      "_blank",
    );
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      {/* Inyectamos los estilos para corregir márgenes del Datatable */}
      <style>{dataTableStyles}</style>

      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <i className="fas fa-hand-holding-usd text-danger mr-2"></i>
              <b>Cuentas por Cobrar (Deudores)</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="card card-danger card-outline shadow">
          <div className="card-header">
            <h3 className="card-title text-bold">
              Ranking de Clientes en Mora
            </h3>
            <button
              className="btn btn-danger btn-sm float-right shadow-sm"
              onClick={handlePDF}
            >
              <i className="fas fa-file-pdf mr-1"></i> Exportar PDF
            </button>
          </div>

          <div className="card-body p-0 card-table-container">
            <div className="table-responsive">
              <table
                id="cobranzas-table"
                className="table table-hover table-striped mb-0"
              >
                <thead className="thead-dark text-center text-sm">
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Cliente</th>
                    <th className="text-center">Días de Mora</th>
                    <th className="text-right">Saldo Pendiente</th>
                    <th className="text-center" style={{ width: "180px" }}>
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
                      <td className="align-middle">
                        <div className="text-bold text-uppercase">
                          {d.nombre_cliente}
                        </div>
                        <small className="text-muted">
                          <i className="fab fa-whatsapp mr-1"></i>
                          {d.telefono}
                        </small>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`badge px-3 py-2 shadow-sm ${d.dias_mora > 15 ? "badge-danger" : "badge-warning"}`}
                        >
                          <i className="fas fa-clock mr-1"></i> {d.dias_mora}{" "}
                          días
                        </span>
                      </td>
                      <td
                        className="text-right align-middle text-danger font-weight-bold"
                        style={{ fontSize: "1rem" }}
                      >
                        {formatMoney(d.saldo_pend)}
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-success btn-sm btn-block shadow-sm"
                          onClick={() => handleReclamar(d.id)}
                        >
                          <i className="fab fa-whatsapp mr-1"></i> Reclamar
                          Deuda
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
              Ranking actualizado según las últimas ventas a cuenta corriente.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformeCobranzas;
