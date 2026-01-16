// src/pages/productos/OraculoStock.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const OraculoStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && data.length >= 0) {
      const tableId = "#oraculo-table";
      if (window.$.fn.DataTable.isDataTable(tableId))
        window.$(tableId).DataTable().destroy();
      window.$(tableId).DataTable({
        paging: true,
        ordering: true,
        info: true,
        responsive: true,
        pageLength: 5, // 👈 5 filas por página
        language: spanishLanguage,
        dom: "rtip",
        columnDefs: [{ targets: -1, orderable: false }],
      });
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
              Análisis Predictivo: Stock Mínimo + Ventas Directas + Ventas en
              Combos
            </p>
          </div>
        </div>
        <hr />

        {/* CARDS DE AVISO */}
        <div className="row">
          {criticos.map((p) => (
            <div className="col-md-3" key={p.id}>
              <div
                className={`small-box shadow-sm ${
                  p.diasRestantes === 0 ? "bg-danger" : "bg-warning"
                }`}
              >
                <div className="inner">
                  <h5 className="font-weight-bold text-truncate">{p.nombre}</h5>
                  <p className="m-0">
                    {p.diasRestantes === 0 ? (
                      <b>STOCK BAJO EL MÍNIMO</b>
                    ) : (
                      <>
                        Quedan: <b>{p.diasRestantes} días</b>
                      </>
                    )}
                  </p>
                  <small>
                    {p.diasRestantes === 0
                      ? `Actual: ${p.stock} / Mín: ${p.stock_minimo}`
                      : `Fuga estimada: ${new Date(
                          p.fechaQuiebre + "T00:00:00"
                        ).toLocaleDateString("es-AR")}`}
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
          <div className="card-header">
            <h3 className="card-title text-bold">
              Proyección de Inventario (Híbrida)
            </h3>
          </div>
          <div className="card-body">
            <table
              id="oraculo-table"
              className="table table-hover table-striped table-bordered table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Salida Diaria (Prom)</th>
                  <th>Autonomía</th>
                  <th>Estado del Oráculo</th>
                  <th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id}>
                    <td className="align-middle px-2">
                      <b>{p.nombre}</b>
                      <br />
                      <small className="text-muted">
                        Umbral Mínimo: {p.stock_minimo}
                      </small>
                    </td>
                    <td className="text-center align-middle">{p.stock}</td>
                    <td className="text-center align-middle text-muted">
                      {p.vDiaria} / día
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`h5 font-weight-bold ${
                          p.diasRestantes <= 3 ? "text-danger" : "text-primary"
                        }`}
                      >
                        {p.diasRestantes === 0
                          ? "ALERTA"
                          : p.diasRestantes >= 999
                          ? "∞"
                          : p.diasRestantes + " d"}
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
                        className="btn btn-outline-primary btn-xs"
                        onClick={() =>
                          (window.location.href = `/productos/ver/${p.id}`)
                        }
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
