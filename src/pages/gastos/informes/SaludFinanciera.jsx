// src/pages/gastos/informes/SaludFinanciera.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SaludFinanciera = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/gastos/informes/salud-financiera")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)
    return (
      <div className="p-4 text-center">
        No se pudieron cargar los datos financieros.
      </div>
    );

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  const chartData = {
    labels: ["Comparativa Mensual"],
    datasets: [
      {
        label: "Ingresos (Ventas)",
        data: [data.ingresos],
        backgroundColor: "#28a745",
        borderRadius: 5,
      },
      {
        label: "Egresos Totales",
        data: [data.egresos.totales],
        backgroundColor: "#dc3545",
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${formatMoney(item.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => formatMoney(value) },
      },
    },
  };

  // Cálculo de Eficiencia Financiera (Dato BI)
  const eficiencia =
    data.ingresos > 0
      ? ((data.balanceNeto / data.ingresos) * 100).toFixed(1)
      : 0;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <i className="fas fa-heartbeat text-danger mr-2"></i>
              <b>Monitor de Salud Financiera</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="row">
          {/* INGRESOS */}
          <div className="col-md-4">
            <div className="info-box shadow-sm border-left-success">
              <span className="info-box-icon bg-success elevation-1">
                <i className="fas fa-arrow-up"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text font-weight-bold">
                  Ingresos (Ventas Reales)
                </span>
                <span className="info-box-number h4 text-success">
                  {formatMoney(data.ingresos)}
                </span>
              </div>
            </div>
          </div>

          {/* EGRESOS */}
          <div className="col-md-4">
            <div className="info-box shadow-sm border-left-danger">
              <span className="info-box-icon bg-danger elevation-1">
                <i className="fas fa-arrow-down"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text font-weight-bold">
                  Egresos (Gastos + Compras)
                </span>
                <span className="info-box-number h4 text-danger">
                  {formatMoney(data.egresos.totales)}
                </span>
              </div>
            </div>
          </div>

          {/* BALANCE NETO */}
          <div className="col-md-4">
            <div
              className={`info-box shadow-sm elevation-2 ${
                data.balanceNeto >= 0 ? "bg-success" : "bg-danger"
              } text-white`}
            >
              <span className="info-box-icon">
                <i
                  className={`fas ${
                    data.balanceNeto >= 0 ? "fa-wallet" : "fa-skull-crossbones"
                  }`}
                ></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text font-weight-bold text-uppercase">
                  Balance Neto (Caja Real)
                </span>
                <span className="info-box-number h3">
                  {formatMoney(data.balanceNeto)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          {/* GRÁFICO */}
          <div className="col-md-7">
            <div className="card card-outline card-primary shadow-sm h-100">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-chart-bar mr-2"></i>Flujo de Caja Real
                </h3>
              </div>
              <div className="card-body">
                <div style={{ height: "320px" }}>
                  <Bar data={chartData} options={options} />
                </div>
              </div>
            </div>
          </div>

          {/* DIAGNÓSTICO BI */}
          <div className="col-md-5">
            <div
              className={`card shadow-sm h-100 ${
                data.balanceNeto >= 0 ? "card-success" : "card-danger"
              } card-outline`}
            >
              <div className="card-header">
                <h3 className="card-title text-bold text-uppercase">
                  Diagnóstico del Negocio
                </h3>
              </div>
              <div className="card-body text-center d-flex flex-column justify-content-center">
                {data.balanceNeto < 0 ? (
                  <div className="animate__animated animate__pulse animate__infinite">
                    <i className="fas fa-exclamation-triangle fa-5x text-danger mb-3"></i>
                    <h2 className="text-danger font-weight-bold">
                      ALERTA: QUEMANDO CAPITAL
                    </h2>
                    <p className="lead px-3">
                      Estás gastando e invirtiendo más de lo que ingresa. La
                      pérdida neta operativa es de{" "}
                      <b>{formatMoney(Math.abs(data.balanceNeto))}</b>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-check-circle fa-5x text-success mb-3"></i>
                    <h2 className="text-success font-weight-bold">
                      FLUJO POSITIVO
                    </h2>
                    <p className="lead px-3">
                      Tu negocio es autosustentable. Después de cubrir
                      mercadería y gastos, lograste un excedente de{" "}
                      <b>{formatMoney(data.balanceNeto)}</b>.
                    </p>
                  </div>
                )}

                <hr />

                {/* DATO CLAVE BI */}
                <div className="alert bg-light border text-left py-3 px-4">
                  <h5 className="text-primary">
                    <i className="fas fa-lightbulb mr-2"></i>
                    <b>Eficiencia de Caja</b>
                  </h5>
                  {data.balanceNeto >= 0 ? (
                    <span>
                      Por cada $100 que vendes, <b>{formatMoney(eficiencia)}</b>{" "}
                      quedan como ganancia neta real en tu bolsillo.
                    </span>
                  ) : (
                    <span>
                      Tu nivel de egresos es del{" "}
                      <b>
                        {((data.egresos.totales / data.ingresos) * 100).toFixed(
                          1
                        )}
                        %
                      </b>{" "}
                      sobre tus ventas. ¡Cuidado!
                    </span>
                  )}
                </div>

                <div className="mt-4 text-left px-3">
                  <h6 className="text-muted text-bold uppercase small">
                    Desglose detallado de Egresos:
                  </h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Gastos Operativos:</span>
                    <span className="text-bold">
                      {formatMoney(data.egresos.operativos)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Inversión en Stock:</span>
                    <span className="text-bold">
                      {formatMoney(data.egresos.mercaderia)}
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

export default SaludFinanciera;
