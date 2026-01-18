// src/pages/OracleEye.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from "react";
import { Line, Doughnut, Radar } from "react-chartjs-2";
import api from "../services/api";
import { io } from "socket.io-client";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://sistema-ventas-backend-3nn3.onrender.com";

const OracleEye = () => {
  const [data, setData] = useState(null);
  const [horaReal, setHoraReal] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // 🕒 1. RELOJ EN TIEMPO REAL
  useEffect(() => {
    const timer = setInterval(() => setHoraReal(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 📡 2. CARGA DE DATOS (Memorizada para Sockets)
  const fetchGodModeData = useCallback(async () => {
    try {
      setIsUpdating(true);
      const res = await api.get("/dashboard/god-mode");
      setData(res.data);
      setTimeout(() => setIsUpdating(false), 600);
    } catch (err) {
      console.error("Error Oracle Eye:", err);
      setIsUpdating(false);
    }
  }, []);

  // 🔌 3. INTEGRACIÓN SOCKET.IO
  useEffect(() => {
    fetchGodModeData();
    const socket = io(SOCKET_URL);
    socket.on("update-dashboard", () => fetchGodModeData());
    return () => {
      socket.off("update-dashboard");
      socket.disconnect();
    };
  }, [fetchGodModeData]);

  if (!data)
    return (
      <div className="bg-black text-white vh-100 d-flex flex-column align-items-center justify-content-center">
        <i className="fas fa-eye fa-spin fa-3x mb-3 text-info"></i>
        <h4 className="text-bold">SINCRONIZANDO INTELIGENCIA...</h4>
      </div>
    );

  const ingresos = parseFloat(data.profit?.ingresos_brutos || 0);
  const costos = parseFloat(data.profit?.costo_mercaderia || 0);
  const gastosReales = parseFloat(data.gastos_mes || 0);
  const gananciaNeta = ingresos - costos - gastosReales;
  const horasLabels = Array.from({ length: 24 }, (_, i) => `${i}hs`);
  const ventasHoyMap = horasLabels.map(
    (_, i) => data.hoy.find((h) => h.hora === i)?.total || 0,
  );
  const ventasAyerMap = horasLabels.map(
    (_, i) => data.ayer.find((h) => h.hora === i)?.total || 0,
  );

  // --- CONFIGURACIÓN DE GRÁFICOS ---
  const lineData = {
    labels: horasLabels,
    datasets: [
      {
        label: "Ventas Hoy",
        data: ventasHoyMap,
        borderColor: "#00f2fe",
        backgroundColor: "rgba(0, 242, 254, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: (ctx) => (ctx.raw > 0 ? 6 : 0),
        pointBackgroundColor: "#00f2fe",
        borderWidth: 3,
      },
      {
        label: "Ventas Ayer",
        data: ventasAyerMap,
        borderColor: "rgba(255, 0, 127, 0.5)",
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        // ✅ RECUPERADOS: Puntos sutiles para permitir el hover y ver valores de ayer
        pointRadius: (ctx) => (ctx.raw > 0 ? 4 : 0),
        pointBackgroundColor: "#ff007f",
        pointHoverRadius: 7,
        borderWidth: 2,
      },
    ],
  };

  const doughnutData = {
    labels: ["Ganancia Neta", "Costo Reposición", "Gastos Fijos"],
    datasets: [
      {
        data: [Math.max(0, gananciaNeta), costos, gastosReales],
        backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
        hoverOffset: 15,
        borderWidth: 0,
      },
    ],
  };

  const radarData = {
    labels: ["Rotación", "Margen %", "Stock", "Fidelidad", "Ticket Prom."],
    datasets: [
      {
        label: "Nivel",
        data: [85, 92, 70, 75, 88],
        backgroundColor: "rgba(0, 242, 254, 0.2)",
        borderColor: "#00f2fe",
        pointBackgroundColor: "#00f2fe",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div
      className={`min-vh-100 bg-black text-white p-4 ${isUpdating ? "neon-flicker" : ""}`}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start mb-4 border-bottom border-secondary pb-3">
        <div>
          <h1
            className="text-bold m-0"
            style={{
              letterSpacing: "3px",
              color: "#00f2fe",
              fontSize: "2.5rem",
            }}
          >
            <i
              className={`fas fa-microchip mr-3 ${isUpdating ? "text-warning" : ""}`}
            ></i>
            EL OJO DEL ORÁCULO
          </h1>
          <p className="text-uppercase text-muted m-0 small">
            Inteligencia Comercial Morrone BI
          </p>
        </div>
        <div className="text-right">
          <div className="h3 m-0 text-bold text-white font-monospace">
            {horaReal.toLocaleTimeString("es-AR", { hour12: false })}
          </div>
          <span
            className={`badge ${isUpdating ? "badge-warning" : "badge-success"} px-3 shadow-sm pulse-animation`}
          >
            <i
              className={`fas ${isUpdating ? "fa-sync fa-spin" : "fa-signal"} mr-1`}
            ></i>{" "}
            &nbsp;
            {isUpdating ? "SINCRONIZANDO..." : "SISTEMAS ONLINE"}
          </span>
        </div>
      </div>

      {/* FILA 1: RENDIMIENTO Y ANATOMÍA */}
      <div className="row d-flex align-items-stretch mb-4">
        <div className="col-lg-8">
          <div
            className="card bg-dark border-secondary shadow-lg h-100"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-header border-0 bg-transparent py-3 d-flex justify-content-between align-items-center">
              <h5 className="text-bold m-0 text-info">
                <i className="fas fa-chart-line mr-2"></i>Rendimiento en Vivo
                (Hoy vs Ayer)
              </h5>
              <div className="small">
                <span className="mr-3">
                  <i className="fas fa-circle text-info mr-1"></i> HOY
                </span>
                <span>
                  <i
                    className="fas fa-circle mr-1"
                    style={{ color: "#ff007f" }}
                  ></i>{" "}
                  AYER
                </span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: "350px" }}>
                <Line
                  data={lineData}
                  options={{
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false }, // Mejora la lectura de ambas líneas
                    scales: {
                      y: {
                        grid: { color: "#222" },
                        ticks: { color: "#888" },
                        beginAtZero: true,
                      },
                      x: { grid: { display: false }, ticks: { color: "#888" } },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div
            className="card bg-dark border-secondary shadow-lg h-100"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-header border-0 bg-transparent py-3 text-center">
              <h5 className="text-bold m-0 text-success">
                <i className="fas fa-chart-pie mr-2"></i>Anatomía del Margen
              </h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <div style={{ width: "230px", height: "230px" }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    cutout: "75%",
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-success text-bold mb-0">
                  $ {gananciaNeta.toLocaleString("es-AR")}
                </h2>
                <small className="text-muted text-uppercase">
                  Ganancia Mensual Proyectada
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILA 2: CATEGORÍAS Y RADAR */}
      <div className="row d-flex align-items-stretch">
        <div className="col-md-6">
          <div
            className="card bg-dark border-secondary shadow-lg h-100"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-header border-0 bg-transparent text-bold py-3 text-warning">
              <i className="fas fa-medal mr-2"></i> TOP CATEGORÍAS (Facturación)
            </div>
            <div className="card-body">
              {data.categorias.map((c, i) => (
                <div key={i} className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-uppercase small text-bold">
                      {c.nombre}
                    </span>
                    <span className="text-bold text-info">
                      $ {parseFloat(c.total).toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div
                    className="progress bg-black shadow-inset"
                    style={{ height: "10px", borderRadius: "5px" }}
                  >
                    <div
                      className="progress-bar bg-gradient-info shadow-sm"
                      style={{
                        width: `${(c.total / data.categorias[0].total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div
            className="card bg-dark border-secondary shadow-lg h-100"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-header border-0 bg-transparent text-bold py-3 text-danger">
              <i className="fas fa-microchip mr-2"></i> Salud Operativa General
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <div style={{ height: "360px", width: "100%", padding: "10px" }}>
                <Radar
                  data={radarData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        grid: { color: "#333" },
                        angleLines: { color: "#333" },
                        pointLabels: {
                          color: "#aaa",
                          font: { size: 13, weight: "bold" },
                        },
                        ticks: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100,
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER TICKER "BLOOMBERG EDITION" */}
      <div
        className="fixed-bottom bg-info py-1 shadow-lg border-top border-dark"
        style={{ height: "35px" }}
      >
        <marquee
          className="text-black text-bold text-uppercase pt-1"
          scrollamount="6"
        >
          <span className="mx-4">
            <i className="fas fa-microchip mr-2"></i>ESTADO:{" "}
            {isUpdating ? "SINCRONIZANDO CEREBRO..." : "SISTEMA OPERATIVO"}
          </span>

          <span className="mx-4">
            <i className="fas fa-chart-line mr-2"></i>INFLACIÓN INTERNA (30D):
            <span
              className={
                data.inflacion_real > 0 ? "text-danger" : "text-success"
              }
            >
              {" "}
              {data.inflacion_real}%
            </span>
          </span>

          <span className="mx-4 text-warning">
            <i className="fas fa-dollar-sign mr-1"></i>COTIZACIÓN MEP:{" "}
            <b>${data.dolar_mep}</b>
          </span>

          <span className="mx-4">
            <i className="fas fa-shield-alt mr-2"></i>EQUITY SHIELD:
            <span className="text-danger">
              {" "}
              USD {parseFloat(data.patrimonio_usd).toLocaleString("es-AR")}
            </span>
          </span>

          <span className="mx-4">
            <i className="fas fa-receipt mr-2"></i>TRACCIÓN HOY:{" "}
            {data.tickets_hoy} TICKETS EMITIDOS
          </span>

          <span className="mx-4">
            <i className="fas fa-fire mr-2"></i>LÍDER DEL DÍA:{" "}
            <span className="text-white">{data.top_hoy}</span>
          </span>

          <span className="mx-4">
            <i className="fas fa-exclamation-triangle mr-2"></i>ALERTA
            REPOSICIÓN: {data.stock_critico} ÍTEMS EN RIESGO
          </span>

          <span className="mx-4">
            --- ARQUITECTURA MORRONE BI --- VERSIÓN 3.0 --- LICENCIA ACTIVA ---
          </span>
        </marquee>
      </div>

      <style>{`
        .bg-gradient-info { background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%); }
        .shadow-inset { box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .pulse-animation { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        .neon-flicker { animation: flicker 0.6s ease-in-out; }
        @keyframes flicker { 0% { opacity: 1; } 50% { opacity: 0.9; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default OracleEye;
