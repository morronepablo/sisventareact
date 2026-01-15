// src/pages/gastos/informes/CirujanoCostos.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CirujanoCostos = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/gastos/informes/cirujano");
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar el cirujano de costos", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)
    return (
      <div className="p-3 text-center">
        No hay datos suficientes para el diagnóstico en este mes.
      </div>
    );

  const { fijos, variables, ventas_totales } = data.totales;
  const porcentajeFijosVentas =
    ventas_totales > 0 ? ((fijos / ventas_totales) * 100).toFixed(1) : 0;

  // Lógica de Diagnóstico BI
  const getDiagnostico = () => {
    const totalGastos = fijos + variables;
    const pesoTotal =
      ventas_totales > 0
        ? ((totalGastos / ventas_totales) * 100).toFixed(1)
        : 0;

    return {
      color: "text-primary",
      icon: "fa-chart-line",
      mensaje: "Análisis de Carga Operativa",
      recomendacion: `Tus gastos totales (fijos y variables combinados) representan el ${pesoTotal}% de tus ventas. En este contexto, lo más importante es que tu margen de ganancia promedio supere este porcentaje para que el negocio sea rentable.`,
    };
  };

  const diag = getDiagnostico();

  const chartData = {
    labels: ["Costos Fijos", "Costos Variables"],
    datasets: [
      {
        data: [fijos, variables],
        backgroundColor: ["#dc3545", "#ffc107"],
        hoverBackgroundColor: ["#a71d2a", "#e0a800"],
        borderWidth: 1,
      },
    ],
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-8">
            <h1>
              <i className="fas fa-cut mr-2"></i>
              <b>El Cirujano de Costos</b>{" "}
              <small className="text-muted text-sm">
                Análisis de Egresos BI
              </small>
            </h1>
          </div>
        </div>
        <hr />

        {/* FILA 1: TARJETAS DE INDICADORES CLAVE (KPIs) */}
        <div className="row">
          <div className="col-md-3">
            <div className="info-box shadow-sm border-left-danger">
              <span className="info-box-icon bg-danger elevation-1">
                <i className="fas fa-building"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">Costos Fijos</span>
                <span className="info-box-number text-danger h4">
                  {formatMoney(fijos)}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box shadow-sm border-left-warning">
              <span className="info-box-icon bg-warning elevation-1">
                <i className="fas fa-microchip"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Costos Variables
                </span>
                <span className="info-box-number text-warning h4">
                  {formatMoney(variables)}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box shadow-sm border-left-info">
              <span className="info-box-icon bg-info elevation-1">
                <i className="fas fa-cash-register"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">Ventas del Mes</span>
                <span className="info-box-number text-info h4">
                  {formatMoney(ventas_totales)}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box shadow-sm border-left-dark">
              <span className="info-box-icon bg-dark elevation-1">
                <i className="fas fa-percent"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Peso de Fijos s/ Ventas
                </span>
                <span className="info-box-number h4">
                  {porcentajeFijosVentas}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          {/* GRÁFICO DE ESTRUCTURA */}
          <div className="col-md-4">
            <div className="card card-outline card-primary shadow-sm h-100">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-chart-pie mr-1"></i> Estructura de
                  Egresos
                </h3>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center">
                <div style={{ width: "100%", height: "300px" }}>
                  <Pie
                    data={chartData}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DIAGNÓSTICO INTELIGENTE */}
          <div className="col-md-8">
            <div className="card card-outline card-danger shadow-sm h-100">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-stethoscope mr-1"></i> Diagnóstico del
                  Cirujano
                </h3>
              </div>
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <i className={`fas ${diag.icon} fa-5x ${diag.color} mb-3`}></i>
                <h2 className={`font-weight-bold ${diag.color}`}>
                  {diag.mensaje}
                </h2>
                <p className="lead px-5">{diag.recomendacion}</p>

                <div className="alert bg-light border mt-3 mb-0 mx-4">
                  <h5>
                    <i className="fas fa-info-circle text-primary mr-2"></i>
                    <b>Dato Clave</b>
                  </h5>
                  Por cada <b>$1.000</b> que vendes,{" "}
                  <b>
                    {formatMoney(
                      ventas_totales > 0 ? (fijos / ventas_totales) * 1000 : 0
                    )}
                  </b>{" "}
                  se destinan únicamente a pagar costos fijos (gastos que tienes
                  aunque no abras el local).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILA 2: DESGLOSE DETALLADO POR CATEGORÍA */}
        <div className="row mt-4">
          {/* TABLA DE COSTOS FIJOS */}
          <div className="col-md-6">
            <div className="card shadow-sm border-left-danger">
              <div className="card-header bg-danger text-white">
                <h3 className="card-title text-bold">
                  <i className="fas fa-building mr-2"></i> Detalle de Costos
                  Fijos
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped m-0">
                  <thead className="bg-light text-center">
                    <tr>
                      <th className="text-left px-3">Categoría</th>
                      <th className="text-right px-3">Inversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.desglose.fijos.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3">{item.categoria}</td>
                        <td className="text-right font-weight-bold px-3">
                          {formatMoney(item.total_categoria)}
                        </td>
                      </tr>
                    ))}
                    {data.desglose.fijos.length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center text-muted p-3">
                          No hay registros de costos fijos este mes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TABLA DE COSTOS VARIABLES */}
          <div className="col-md-6">
            <div className="card shadow-sm border-left-warning">
              <div className="card-header bg-warning">
                <h3 className="card-title text-bold">
                  <i className="fas fa-random mr-2"></i> Detalle de Costos
                  Variables
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped m-0">
                  <thead className="bg-light text-center">
                    <tr>
                      <th className="text-left px-3">Categoría</th>
                      <th className="text-right px-3">Inversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.desglose.variables.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3">{item.categoria}</td>
                        <td className="text-right font-weight-bold px-3">
                          {formatMoney(item.total_categoria)}
                        </td>
                      </tr>
                    ))}
                    {data.desglose.variables.length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center text-muted p-3">
                          No hay registros de costos variables este mes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {/* FIN DESGLOSE */}
      </div>
    </div>
  );
};

export default CirujanoCostos;
