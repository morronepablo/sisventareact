// src/pages/productos/OraculoStock.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const OraculoStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const spanishLanguage = {
    sProcessing: "Calculando proyecciones...",
    sLengthMenu: "Ver _MENU_ registros",
    sZeroRecords: "No hay productos para analizar",
    sEmptyTable: "Sin datos",
    sInfo: "Mostrando _START_ a _END_ de _TOTAL_",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Sig",
      sPrevious: "Ant",
    },
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/productos/bi/oraculo-stock");
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const tableId = "#oraculo-table";
    const $ = window.$;

    if (!loading && data.length > 0) {
      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId)) {
          $(tableId).DataTable().destroy();
        }

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          pageLength: 5,
          // 🟢 ORDENAMIENTO POR COLUMNA 3 (Autonomía) de MENOR a MAYOR
          order: [[3, "asc"]],
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [
            { targets: -1, orderable: false }, // Columna "Ver" no ordenable
            { targets: 3, type: "num" }, // Forzamos tipo numérico para autonomía
          ],
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        if ($.fn.DataTable.isDataTable(tableId)) {
          $(tableId).DataTable().destroy(true);
        }
      };
    }
  }, [loading, data]);

  if (loading) return <LoadingSpinner />;

  const criticos = data.filter((p) => p.diasRestantes <= 3).slice(0, 4);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-10">
            <h1>
              <i className="fas fa-eye text-primary mr-2"></i>
              <b>El Oráculo de Stock</b>
            </h1>
            <p className="text-muted">
              Análisis Predictivo: Lo que se agota primero va arriba.
            </p>
          </div>
        </div>
        <hr />

        {/* CARDS CRÍTICAS */}
        <div className="row">
          {criticos.map((p) => (
            <div className="col-md-3" key={`card-${p.id}`}>
              <div
                className={`small-box shadow-sm ${p.diasRestantes === 0 ? "bg-danger" : "bg-warning"}`}
              >
                <div className="inner">
                  <h5 className="font-weight-bold text-truncate">{p.nombre}</h5>
                  <p className="m-0">
                    {p.diasRestantes === 0 ? (
                      <b>STOCK BAJO EL MÍNIMO</b>
                    ) : (
                      <>
                        Autonomía: <b>{p.diasRestantes} días</b>
                      </>
                    )}
                  </p>
                  <small>
                    Fuga:{" "}
                    {p.fechaQuiebre
                      ? new Date(
                          p.fechaQuiebre + "T00:00:00",
                        ).toLocaleDateString("es-AR")
                      : "N/D"}
                  </small>
                </div>
                <div className="icon">
                  <i
                    className={
                      p.diasRestantes === 0
                        ? "fas fa-exclamation-triangle"
                        : "fas fa-hourglass-half"
                    }
                  ></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card card-outline card-primary shadow-sm mt-3">
          <div className="card-header border-0">
            <h3 className="card-title text-bold">
              Proyección de Quiebre de Stock
            </h3>
          </div>
          <div className="card-body p-0">
            <table
              id="oraculo-table"
              className="table table-hover table-striped table-bordered table-sm w-100 mb-0"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Venta Diaria</th>
                  <th>Autonomía</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={`row-${p.id}`}>
                    <td className="align-middle px-2">
                      <div className="text-bold">{p.nombre}</div>
                      <small className="text-muted">
                        Mín: {p.stock_minimo}
                      </small>
                    </td>
                    <td className="text-center align-middle font-weight-bold">
                      {p.stock}
                    </td>
                    <td className="text-center align-middle text-muted">
                      {p.vDiaria} u.
                    </td>

                    {/* 🟢 EL SECRETO: data-order con el valor numérico real */}
                    <td
                      className="text-center align-middle"
                      data-order={p.diasRestantes}
                    >
                      <span
                        className={`h6 font-weight-bold ${p.diasRestantes <= 3 ? "text-danger" : "text-primary"}`}
                      >
                        {p.diasRestantes === 0
                          ? "ALERTA"
                          : p.diasRestantes >= 999
                            ? "∞"
                            : p.diasRestantes + " días"}
                      </span>
                    </td>

                    <td className="text-center align-middle">
                      {p.diasRestantes === 0 ? (
                        <span className="badge badge-danger p-2 animate__animated animate__flash animate__infinite">
                          URGENTE
                        </span>
                      ) : p.diasRestantes <= 7 ? (
                        <span className="badge badge-warning p-2 text-white">
                          RECOMPRAR
                        </span>
                      ) : (
                        <span className="badge badge-success p-2">SEGURO</span>
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => navigate(`/productos/ver/${p.id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OraculoStock;
