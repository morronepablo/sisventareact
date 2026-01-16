// src/pages/gastos/OraculoFinanciero.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const OraculoFinanciero = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/gastos/informes/oraculo-financiero")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-3">Error al cargar la proyección.</div>;

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  const chartData = {
    labels: data.proyeccion.map((p) => p.semana),
    datasets: [
      {
        label: "Saldo de Caja Proyectado",
        data: data.proyeccion.map((p) => p.saldo),
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-crystal-ball text-purple mr-2"></i>
        <b>El Oráculo Financiero</b>
      </h1>
      <p className="text-muted">
        Proyección de Flujo de Caja (Cash Flow) a 30 días.
      </p>
      <hr />

      <div className="row">
        <div className="col-md-3">
          <div className="info-box shadow-sm">
            <span className="info-box-icon bg-info">
              <i className="fas fa-wallet"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text">Saldo de Caja Hoy</span>
              <span className="info-box-number">
                {formatMoney(data.saldoActual)}
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-box shadow-sm">
            <span className="info-box-icon bg-success">
              <i className="fas fa-hand-holding-usd"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text">A Cobrar (Clientes)</span>
              <span className="info-box-number">
                {formatMoney(data.totalCobrar)}
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-box shadow-sm">
            <span className="info-box-icon bg-danger">
              <i className="fas fa-file-invoice-dollar"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text">A Pagar (Proveedores)</span>
              <span className="info-box-number">
                {formatMoney(data.totalPagar)}
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className={`info-box shadow-sm ${
              data.riesgo === "ALTO" ? "bg-danger" : "bg-success"
            } text-white`}
          >
            <span className="info-box-icon">
              <i className="fas fa-shield-alt"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text text-bold">
                Riesgo de Liquidez
              </span>
              <span className="info-box-number h4">{data.riesgo}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-8">
          <div className="card card-outline card-primary shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Curva de Disponibilidad de Fondos
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

        {/* COLUMNA DERECHA: PREDICCIÓN DETALLADA */}
        <div className="col-md-4">
          <div
            className="card shadow-sm border-0"
            style={{
              backgroundColor: "#1e1e2d",
              color: "#fff",
              borderRadius: "10px",
            }}
          >
            <div className="card-header border-secondary">
              <h3 className="card-title text-bold">
                <i className="fas fa-magic mr-2 text-warning"></i> Proyección
                Semanal
              </h3>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {data.proyeccion.map((p, i) => (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-secondary py-3"
                  >
                    <div className="d-flex flex-column">
                      <span
                        className="text-white font-weight-bold"
                        style={{ fontSize: "1.1rem" }}
                      >
                        {p.semana}
                      </span>
                      <small
                        className="text-muted text-uppercase"
                        style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                      >
                        Tendencia de flujo
                      </small>
                    </div>
                    <div className="text-right">
                      <span
                        className={`h5 font-weight-bold m-0 ${
                          parseFloat(p.saldo) < 0
                            ? "text-danger"
                            : "text-success"
                        }`}
                      >
                        {formatMoney(p.saldo)}
                      </span>
                      <br />
                      <small
                        className="text-muted"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Balance neto proyectado
                      </small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-footer bg-transparent border-top border-secondary">
              <div
                className="alert bg-rgba-warning p-2 mb-0"
                style={{
                  backgroundColor: "rgba(255,193,7,0.1)",
                  border: "1px dashed #ffc107",
                }}
              >
                <small className="text-warning">
                  <i className="fas fa-info-circle mr-1"></i>
                  <b>Nota BI:</b> El Oráculo asume una cobranza del 20% de la
                  deuda activa y la continuidad de tu promedio de ventas.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OraculoFinanciero;
