// src/pages/arqueos/VerArqueo.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

// --- ESTILOS DE ARQUITECTURA VISUAL (MÁRGENES Y TOTALES) ---
const dataTableStyles = `
  .dataTables_info { padding: 10px 15px !important; font-size: 0.82rem; color: #6c757d; }
  .dataTables_paginate { padding: 5px 15px !important; }
  .card-table-container { padding-bottom: 5px; }
  .card-footer-custom { padding: 10px 15px; border-top: 1px solid #dee2e6; background-color: rgba(0,0,0,.03); }
`;

const VerArqueo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_",
    sZeroRecords: "Sin registros",
    sEmptyTable: "Sin movimientos",
    sInfo: "Mostrando _START_ a _END_ de _TOTAL_",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Sig.",
      sPrevious: "Ant.",
    },
  };

  const fetchDetalle = async () => {
    try {
      const response = await api.get(`/arqueos/${id}`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, [id]);

  useEffect(() => {
    if (!loading && data) {
      const $ = window.$;
      const timer = setTimeout(() => {
        // 1. Tabla de Movimientos
        if (data.movimientos?.length > 0) {
          if ($.fn.DataTable.isDataTable("#movimientos-table"))
            $("#movimientos-table").DataTable().destroy();
          $("#movimientos-table").DataTable({
            paging: true,
            ordering: true,
            order: [[0, "desc"]],
            info: true,
            responsive: true,
            pageLength: 5,
            language: spanishLanguage,
            dom: "rtip",
            columnDefs: [{ targets: 0, visible: false }],
          });
        }
        // 2. Tabla de Retiros
        if (data.retiros?.length > 0) {
          if ($.fn.DataTable.isDataTable("#retiros-table"))
            $("#retiros-table").DataTable().destroy();
          $("#retiros-table").DataTable({
            paging: true,
            ordering: true,
            order: [[0, "desc"]],
            info: true,
            responsive: true,
            pageLength: 5,
            language: spanishLanguage,
            dom: "rtip",
            columnDefs: [{ targets: 0, visible: false }],
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading) return <LoadingSpinner />;
  if (!data || !data.arqueo)
    return (
      <div className="p-4 text-center text-danger">
        No se encontró el arqueo.
      </div>
    );

  const arqueo = data.arqueo;
  const movimientos = data.movimientos || [];
  const retiros = data.retiros || [];

  const m_inicial = parseFloat(arqueo.monto_inicial || 0);
  const m_final = parseFloat(arqueo.monto_final || 0);

  const totalIngreso = movimientos
    .filter((m) => m.tipo === "Ingreso")
    .reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0);
  const totalEgreso = movimientos
    .filter((m) => m.tipo === "Egreso")
    .reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0);
  const totalRetiros = retiros.reduce(
    (acc, curr) => acc + parseFloat(curr.monto || 0),
    0,
  );

  const saldoEsperado = m_inicial + totalIngreso - totalEgreso - totalRetiros;
  const diferencia = m_final - saldoEsperado;

  return (
    <div className="content-header">
      <style>{dataTableStyles}</style>
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-sm-12">
            <h1 className="m-0 text-dark text-bold">
              Detalle del Arqueo{" "}
              <small className="text-muted">| Caja N° {arqueo.caja_id}</small>
            </h1>
            <hr />
          </div>
        </div>

        <div className="row">
          {/* INFO GENERAL */}
          <div className="col-md-3">
            <div className="card card-outline card-info shadow-sm h-100">
              <div className="card-header border-0">
                <h3 className="card-title text-bold">Información General</h3>
              </div>
              <div className="card-body">
                <label className="text-xs text-uppercase text-muted">
                  Cajero Responsable
                </label>
                <p className="text-bold mb-3">
                  {arqueo.usuario_nombre || "Admin"}
                </p>
                <div className="form-group mb-2">
                  <label className="text-xs text-uppercase text-muted">
                    Fecha Apertura
                  </label>
                  <div className="form-control form-control-sm bg-light">
                    {formatDateTime(arqueo.fecha_apertura)}
                  </div>
                </div>
                <div className="form-group mb-2">
                  <label className="text-xs text-uppercase text-muted">
                    Monto Inicial
                  </label>
                  <div className="form-control form-control-sm bg-light text-right text-bold">
                    {formatMoney(m_inicial)}
                  </div>
                </div>
                <div className="form-group mb-2">
                  <label className="text-xs text-uppercase text-muted">
                    Monto Real Declarado (Cierre)
                  </label>
                  <div className="form-control form-control-sm bg-light text-right text-bold text-primary">
                    {formatMoney(m_final)}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-block shadow-sm mt-4"
                  onClick={() => navigate("/arqueos/listado")}
                >
                  <i className="fas fa-arrow-left mr-1"></i> Volver al Listado
                </button>
              </div>
            </div>
          </div>

          {/* MOVIMIENTOS CON TOTALES EN FOOTER */}
          <div className="col-md-5">
            <div className="card card-outline card-success shadow-sm h-100">
              <div className="card-header border-0">
                <h3 className="card-title text-bold text-success">
                  Ingresos y Egresos Manuales
                </h3>
              </div>
              <div className="card-body p-0 card-table-container">
                <table
                  id="movimientos-table"
                  className="table table-hover table-striped mb-0 w-100"
                >
                  <thead className="thead-dark text-xs">
                    <tr>
                      <th>HIDDEN_ID</th>
                      <th className="text-center">TIPO</th>
                      <th>DETALLE</th>
                      <th className="text-right">MONTO</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {movimientos.map((m) => (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td className="text-center align-middle">
                          <span
                            className={`badge ${m.tipo === "Ingreso" ? "badge-success" : "badge-danger"}`}
                          >
                            {m.tipo}
                          </span>
                        </td>
                        <td className="align-middle">{m.descripcion}</td>
                        <td className="text-right align-middle text-bold">
                          {formatMoney(m.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* ✅ PIE DE CARD CON TOTALES DE MOVIMIENTOS ✅ */}
              <div className="card-footer-custom text-right">
                <div className="text-xs text-muted">
                  Total Ingresos:{" "}
                  <span className="text-success text-bold">
                    {formatMoney(totalIngreso)}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  Total Egresos:{" "}
                  <span className="text-danger text-bold">
                    {formatMoney(totalEgreso)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RETIROS CON TOTAL RESTAURADO */}
          <div className="col-md-4">
            <div className="card card-outline card-warning shadow-sm h-100">
              <div className="card-header border-0">
                <h3 className="card-title text-bold text-warning">
                  Retiros de Seguridad
                </h3>
              </div>
              <div className="card-body p-0 card-table-container">
                <table
                  id="retiros-table"
                  className="table table-hover table-striped mb-0 w-100"
                >
                  <thead className="bg-warning text-dark text-xs">
                    <tr>
                      <th>HIDDEN_ID</th>
                      <th className="text-center">HORA</th>
                      <th>MOTIVO</th>
                      <th className="text-right">MONTO</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {retiros.map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td className="text-center align-middle">
                          {new Date(r.fecha).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="align-middle">{r.motivo}</td>
                        <td className="text-right align-middle text-bold text-danger">
                          -{formatMoney(r.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* ✅ PIE DE CARD CON TOTAL RETIRADO RESTAURADO ✅ */}
              <div className="card-footer-custom text-right">
                <span className="text-bold text-danger">
                  Total Retirado: {formatMoney(totalRetiros)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BALANCE BI */}
        <div className="row mt-4 mb-5">
          <div className="col-md-12">
            <div
              className={`card ${diferencia < 0 ? "card-danger" : "card-success"} card-outline shadow`}
            >
              <div className="card-body py-3 text-center">
                <div className="row align-items-center">
                  <div className="col-md-3 border-right text-muted">
                    <label className="text-xs text-uppercase d-block">
                      Saldo Esperado
                    </label>
                    <span className="h4 text-bold">
                      {formatMoney(saldoEsperado)}
                    </span>
                  </div>
                  <div className="col-md-3 border-right text-primary">
                    <label className="text-xs text-uppercase d-block">
                      Monto Real Declarado
                    </label>
                    <span className="h4 text-bold">{formatMoney(m_final)}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted text-xs text-uppercase d-block">
                      Resultado de Auditoría (Diferencia)
                    </label>
                    <span
                      className={`h2 text-bold ${diferencia < 0 ? "text-danger" : "text-success"}`}
                    >
                      {diferencia === 0
                        ? "CAJA PERFECTA"
                        : formatMoney(diferencia)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerArqueo;
