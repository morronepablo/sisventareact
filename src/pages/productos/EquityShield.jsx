// src/pages/productos/EquityShield.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

const EquityShield = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/productos/bi/equity-shield")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const formatMoney = (val, cur = "ARS") =>
    new Intl.NumberFormat(cur === "ARS" ? "es-AR" : "en-US", {
      style: "currency",
      currency: cur === "ARS" ? "ARS" : "USD",
    }).format(val);

  const chartData = {
    labels: data.historico.map((h) => h.etiqueta),
    datasets: [
      {
        label: "Valor de Empresa (USD)",
        data: data.historico.map((h) => h.valor_usd_total),
        fill: true,
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        borderColor: "#28a745",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-8">
          <h1>
            <i className="fas fa-shield-alt text-success mr-2"></i>
            <b>Equity Shield</b>
          </h1>
          <p className="text-muted">
            Valorización real del patrimonio neto en moneda dura (Dólar MEP).
          </p>
        </div>
      </div>
      <hr />

      <div className="row">
        {/* VALOR EN PESOS */}
        <div className="col-md-3">
          <div className="info-box shadow-sm">
            <span className="info-box-icon bg-gray">
              <i className="fas fa-box-open"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text">Capital en Mercadería (ARS)</span>
              <span className="info-box-number h4">
                {formatMoney(data.actual.totalARS)}
              </span>
            </div>
          </div>
        </div>

        {/* COTIZACIÓN */}
        <div className="col-md-3">
          <div className="info-box shadow-sm">
            <span className="info-box-icon bg-info">
              <i className="fas fa-exchange-alt"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text">Cotización Dólar MEP</span>
              <span className="info-box-number h4">
                {formatMoney(data.actual.cotizacionUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* VALOR EN DOLARES */}
        <div className="col-md-3">
          <div className="info-box shadow-lg border border-success">
            <span className="info-box-icon bg-success elevation-2">
              <i className="fas fa-dollar-sign"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text font-weight-bold">
                Patrimonio Real (USD)
              </span>
              <span className="info-box-number h3 text-success font-weight-bold">
                {formatMoney(data.actual.totalUSD, "USD")}
              </span>
            </div>
          </div>
        </div>

        {/* VARIACIÓN */}
        <div className="col-md-3">
          <div
            className={`info-box shadow-sm ${data.actual.diferenciaUSD >= 0 ? "border-success" : "border-danger"}`}
          >
            <div className="info-box-content">
              <span className="info-box-text">Variación vs Ayer (Real)</span>
              <span
                className={`info-box-number h4 ${data.actual.diferenciaUSD >= 0 ? "text-success" : "text-danger"}`}
              >
                {data.actual.diferenciaUSD >= 0 ? "+" : ""}
                {formatMoney(data.actual.diferenciaUSD, "USD")}
                <small className="ml-2">
                  ({data.actual.porcentajeVariacion}%)
                </small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-9">
          <div className="card card-outline card-success shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Curva de Patrimonio Neto (USD)
              </h3>
            </div>
            <div className="card-body">
              <div style={{ height: "350px" }}>
                <Line
                  data={chartData}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark shadow h-100">
            <div className="card-body d-flex flex-column justify-content-center text-center">
              <i
                className={`fas ${data.actual.diferenciaUSD >= 0 ? "fa-chart-line text-success" : "fa-chart-pie text-danger"} fa-5x mb-3`}
              ></i>
              <h3 className="text-bold">Diagnóstico BI</h3>
              <p className="lead">
                {data.actual.diferenciaUSD >= 0
                  ? "Tu negocio está ganando valor real frente a la devaluación. Tu estrategia de reposición es sólida."
                  : "¡Alerta! Tu patrimonio en dólares está cayendo. La inflación está licuando tu capital de trabajo."}
              </p>
              <hr className="border-secondary" />
              <small className="text-muted italic">
                Datos de cotización provistos por DolarApi en tiempo real.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquityShield;
