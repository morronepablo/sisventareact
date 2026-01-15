// src/pages/clientes/ScoringConfianza.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ScoringConfianza = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Analizando...",
    sLengthMenu: "Mostrar _MENU_",
    sZeroRecords: "Sin clientes morosos",
    sInfo: "Clientes: _START_ al _END_",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Sig.",
      sPrevious: "Ant.",
    },
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/clientes/bi/scoring");
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
      const tableId = "#scoring-table";
      const timer = setTimeout(() => {
        if (window.$.fn.DataTable.isDataTable(tableId))
          window.$(tableId).DataTable().destroy();
        window.$(tableId).DataTable({
          paging: true,
          info: true,
          responsive: true,
          pageLength: 10,
          language: spanishLanguage,
          dom: "rtip",
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading) return <LoadingSpinner />;

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  // Filtros para las Cards
  const cat30 = data.filter((c) => c.mora <= 30).length;
  const cat60 = data.filter((c) => c.mora > 30 && c.mora <= 60).length;
  const cat90 = data.filter((c) => c.mora > 60).length;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <i className="fas fa-user-shield text-primary mr-2"></i>
          <b>Scoring de Confianza</b>
        </h1>
        <hr />

        {/* 🚀 NUEVOS CARDS POR TRAMOS DE MORA 🚀 */}
        <div className="row">
          <div className="col-md-4">
            <div className="small-box bg-success shadow-sm">
              <div className="inner">
                <h3>{cat30}</h3>
                <p>Aceptables (0-30 días)</p>
              </div>
              <div className="icon">
                <i className="fas fa-check-double"></i>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="small-box bg-warning shadow-sm">
              <div className="inner">
                <h3 className="text-white">{cat60}</h3>
                <p className="text-white">Riesgo Leve (31-60 días)</p>
              </div>
              <div className="icon">
                <i className="fas fa-clock"></i>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="small-box bg-danger shadow-sm">
              <div className="inner">
                <h3>{cat90}</h3>
                <p>Críticos (+60 días)</p>
              </div>
              <div className="icon">
                <i className="fas fa-skull-crossbones"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-outline card-primary shadow-sm mt-3">
          <div className="card-header">
            <h3 className="card-title text-bold">
              <i className="fas fa-chart-line mr-2"></i>Ranking Crediticio por
              Tramo de Mora
            </h3>
          </div>
          <div className="card-body">
            <table
              id="scoring-table"
              className="table table-hover table-striped table-bordered table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Cliente</th>
                  <th>Escudo</th>
                  <th>Días de Mora</th>
                  <th>Monto Adeudado</th>
                  <th>Recomendación BI</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id}>
                    <td className="align-middle px-3">
                      <b>{c.nombre_cliente}</b>
                      <br />
                      <small className="text-muted">{c.cuil_codigo}</small>
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge p-2 ${
                          c.mora <= 30
                            ? "badge-success"
                            : c.mora <= 60
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >
                        <i className={c.escudo}></i> {c.rango}
                      </span>
                    </td>
                    <td className="text-center align-middle font-weight-bold h5">
                      {c.mora} días
                    </td>
                    <td className="text-right align-middle text-bold">
                      {formatMoney(c.deuda_actual)}
                    </td>
                    <td className="align-middle px-3 text-center">
                      <small className={`font-weight-bold ${c.color}`}>
                        {c.recomendacion}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="alert bg-dark text-white mt-4 shadow border-left-danger">
          <h5>
            <i className="fas fa-info-circle mr-2 text-danger"></i>
            <b>Criterio de Cobrabilidad BI:</b>
          </h5>
          <p className="mb-0">
            En un contexto inflacionario, una deuda de más de 60 días pierde
            aproximadamente el 10% de su valor real.
            <b>
              {" "}
              Clasificar por tramos te permite priorizar a quién llamar primero.
            </b>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoringConfianza;
