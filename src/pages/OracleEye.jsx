// src/pages/OracleEye.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from "react";
import { Line, Doughnut, Radar, Bar, Pie } from "react-chartjs-2";
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

  useEffect(() => {
    const timer = setInterval(() => setHoraReal(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchGodModeData = useCallback(async () => {
    try {
      setIsUpdating(true);
      const res = await api.get("/dashboard/god-mode");
      setData(res.data);
      setTimeout(() => setIsUpdating(false), 800);
    } catch (err) {
      console.error("Error Oracle Eye:", err);
      setIsUpdating(false);
    }
  }, []);

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
      <div className="bg-black text-white vh-100 d-flex align-items-center justify-content-center">
        SINCRONIZANDO CEREBRO BI...
      </div>
    );

  const ingresos = parseFloat(data.profit?.ingresos_brutos || 0);
  const costos = parseFloat(data.profit?.costo_mercaderia || 0);
  const gastosReales = parseFloat(data.gastos_mes || 0);
  const gananciaNeta = ingresos - costos - gastosReales;

  return (
    <div
      className={`bg-black text-white px-2 ${isUpdating ? "neon-flicker" : ""}`}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 1. HEADER (Con ícono de SEÑAL y Efecto Latido) */}
      <style>{`
        .pulse-live {
          animation: pulse-live 2s infinite;
          box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
        }
        @keyframes pulse-live {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 15px 10px rgba(40, 167, 69, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }
        .pulse-sync {
          animation: pulse-sync 0.5s infinite;
        }
        @keyframes pulse-sync {
          0% { background-color: #ffc107; box-shadow: 0 0 5px #ffc107; }
          50% { background-color: #fd7e14; box-shadow: 0 0 20px #fd7e14; }
          100% { background-color: #ffc107; box-shadow: 0 0 5px #ffc107; }
        }
        .neon-flicker { animation: flicker 0.3s ease-in-out; }
        @keyframes flicker { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }
      `}</style>

      <div
        className="d-flex justify-content-between align-items-center px-2 border-bottom border-secondary"
        style={{ height: "60px" }}
      >
        <div>
          <h1
            className="text-bold m-0"
            style={{
              letterSpacing: "2px",
              color: "#00f2fe",
              fontSize: "1.6rem",
            }}
          >
            <i
              className={`fas fa-brain mr-2 ${isUpdating ? "text-warning" : ""}`}
            ></i>{" "}
            EL OJO DEL ORÁCULO
          </h1>
          <small
            className="text-muted text-uppercase"
            style={{ fontSize: "0.6rem" }}
          >
            Inteligencia Comercial Morrone BI
          </small>
        </div>
        <div className="text-right">
          <div className="h4 m-0 text-bold text-white font-monospace">
            {horaReal.toLocaleTimeString("es-AR", { hour12: false })}
          </div>
          <span
            className={`badge ${isUpdating ? "pulse-sync" : "pulse-live bg-success"} px-3 py-1 shadow-sm`}
            style={{
              fontSize: "0.65rem",
              borderRadius: "10px",
              color: isUpdating ? "#000" : "#fff",
            }}
          >
            <i
              className={`fas ${isUpdating ? "fa-sync-alt fa-spin" : "fa-signal"} mr-1`}
            ></i>
            {isUpdating ? "SINCRONIZANDO..." : "SISTEMAS ONLINE"}
          </span>
        </div>
      </div>

      <div
        className="d-flex flex-column p-1"
        style={{ height: "calc(100vh - 95px)", gap: "8px" }}
      >
        {/* FILA 1: RENDIMIENTO | LIQUIDEZ */}
        <div className="row m-0" style={{ height: "33%" }}>
          <div className="col-lg-7 p-1 h-100">
            <div className="card bg-dark border-secondary h-100 m-0 shadow-sm">
              <div className="card-header border-0 bg-transparent py-1">
                <h6 className="text-bold m-0 text-info text-xs text-uppercase">
                  Rendimiento: Hoy vs Ayer
                </h6>
              </div>
              <div className="card-body p-1" style={{ position: "relative" }}>
                <Line
                  data={{
                    labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
                    datasets: [
                      {
                        label: "Hoy",
                        data: Array.from(
                          { length: 24 },
                          (_, i) =>
                            data.hoy.find((h) => h.hora === i)?.total || 0,
                        ),
                        borderColor: "#00f2fe",
                        backgroundColor: "rgba(0, 242, 254, 0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: (ctx) => (ctx.raw > 0 ? 4 : 0),
                        borderWidth: 2,
                      },
                      {
                        label: "Ayer",
                        data: Array.from(
                          { length: 24 },
                          (_, i) =>
                            data.ayer.find((h) => h.hora === i)?.total || 0,
                        ),
                        borderColor: "rgba(255, 0, 127, 0.6)",
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: (ctx) => (ctx.raw > 0 ? 3 : 0),
                        pointBackgroundColor: "#ff007f",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    scales: {
                      y: {
                        grid: { color: "#222" },
                        ticks: { color: "#555", font: { size: 8 } },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: "#555", font: { size: 8 } },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-5 p-1 h-100">
            <div className="card bg-dark border-secondary h-100 m-0 shadow-sm">
              <div className="card-header border-0 bg-transparent py-1 text-warning text-center">
                <h6 className="text-bold m-0 text-xs text-uppercase">
                  Distribución de Ingresos (Hoy)
                </h6>
              </div>
              <div
                className="card-body p-1 d-flex justify-content-center"
                style={{ position: "relative" }}
              >
                <Pie
                  data={{
                    labels: data.pagosMix?.map((p) => p.label) || [],
                    datasets: [
                      {
                        data: data.pagosMix?.map((p) => p.value) || [],
                        backgroundColor: [
                          "#28a745",
                          "#007bff",
                          "#ffc107",
                          "#6610f2",
                          "#e83e8c",
                        ],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          color: "#ccc",
                          font: { size: 10, weight: "bold" },
                          boxWidth: 10,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FILA 2: CATEGORÍAS | CAJAS | MARGEN */}
        <div className="row m-0" style={{ height: "30%" }}>
          <div className="col-lg-3 p-1 h-100">
            <div className="card bg-dark border-secondary h-100 m-0 shadow-sm">
              <div className="card-header border-0 bg-transparent text-warning text-xs text-bold py-1 text-uppercase">
                Top Categorías (Hoy)
              </div>
              <div className="card-body py-1 px-3 d-flex flex-column justify-content-center">
                {data.categorias.map((c, i) => (
                  <div key={i} className="mb-2">
                    <div className="d-flex justify-content-between mb-0">
                      <span
                        className="text-bold"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {c.nombre.substring(0, 15)}
                      </span>
                      <span
                        className="text-info"
                        style={{ fontSize: "0.6rem" }}
                      >
                        $ {Math.round(c.total).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="progress bg-black shadow-inset"
                      style={{ height: "3px" }}
                    >
                      <div
                        className="progress-bar bg-gradient-info"
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
          <div className="col-lg-6 p-1 h-100">
            <div className="card bg-dark border-secondary h-100 m-0 shadow-sm">
              <div className="card-header border-0 bg-transparent text-success text-xs text-center text-bold py-1 text-uppercase">
                Performance Terminales (Monto vs Tickets)
              </div>
              <div className="card-body p-1" style={{ position: "relative" }}>
                <Bar
                  data={{
                    labels: data.cajas?.map((c) => `C${c.caja_id}`) || [],
                    datasets: [
                      {
                        label: "$",
                        data: data.cajas?.map((c) => c.monto) || [],
                        backgroundColor: "rgba(40, 167, 69, 0.6)",
                        xAxisID: "x",
                      },
                      {
                        label: "Tks",
                        data: data.cajas?.map((c) => c.tickets) || [],
                        backgroundColor: "rgba(255, 235, 59, 0.7)",
                        xAxisID: "x1",
                      },
                    ],
                  }}
                  options={{
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        grid: { color: "#222" },
                        ticks: { color: "#28a745", font: { size: 8 } },
                      },
                      x1: {
                        position: "top",
                        grid: { display: false },
                        ticks: { color: "#ffeb3b", font: { size: 8 } },
                      },
                      y: {
                        ticks: { color: "#fff", font: { size: 8 } },
                        grid: { display: false },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-3 p-1 h-100">
            <div className="card bg-dark border-secondary h-100 m-0 shadow-sm">
              <div className="card-header border-0 bg-transparent py-1 text-center text-xs text-success text-bold text-uppercase">
                Anatomía del Margen
              </div>
              <div
                className="card-body d-flex flex-column align-items-center justify-content-center p-1"
                style={{ position: "relative" }}
              >
                <div style={{ width: "90px", height: "90px" }}>
                  <Doughnut
                    data={{
                      labels: ["G", "C", "GF"],
                      datasets: [
                        {
                          data: [
                            Math.max(0, gananciaNeta),
                            costos,
                            gastosReales,
                          ],
                          backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      cutout: "70%",
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <h6
                    className="text-success text-bold mb-0"
                    style={{ fontSize: "0.9rem" }}
                  >
                    $ {Math.round(gananciaNeta).toLocaleString()}
                  </h6>
                  <small className="text-muted" style={{ fontSize: "0.5rem" }}>
                    GANANCIA NETO
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILA 3: SALUD | SEMANAL */}
        <div className="row m-0" style={{ height: "33%" }}>
          <div className="col-lg-6 p-1 h-100">
            <div className="card bg-dark border-secondary h-100 m-0 shadow-sm">
              <div className="card-header border-0 bg-transparent text-danger text-center text-xs text-bold py-1 text-uppercase">
                Salud Operativa General
              </div>
              <div
                className="card-body p-1 d-flex justify-content-center"
                style={{ position: "relative" }}
              >
                <Radar
                  data={{
                    labels: [
                      "Rotación",
                      "Margen",
                      "Stock",
                      "Fidelidad",
                      "Tickets",
                    ],
                    datasets: [
                      {
                        label: "Nivel",
                        data: [85, 92, 70, 75, 88],
                        backgroundColor: "rgba(0, 242, 254, 0.2)",
                        borderColor: "#00f2fe",
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        grid: { color: "#333" },
                        angleLines: { color: "#333" },
                        pointLabels: { color: "#aaa", font: { size: 8 } },
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
          <div className="col-lg-6 p-1 h-100">
            <div className="card bg-dark border-secondary h-100 m-0 shadow-sm">
              <div className="card-header border-0 bg-transparent text-info text-center text-xs text-bold py-1 text-uppercase">
                Inercia Semanal (7 Días)
              </div>
              <div className="card-body p-1" style={{ position: "relative" }}>
                <Bar
                  data={{
                    labels: data.semanal?.map((s) => s.dia) || [],
                    datasets: [
                      {
                        label: "Ventas ($)",
                        data: data.semanal?.map((s) => s.total) || [],
                        backgroundColor: "rgba(0, 242, 254, 0.5)",
                        borderColor: "#00f2fe",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        grid: { color: "#222" },
                        ticks: { color: "#777", font: { size: 8 } },
                      },
                      x: {
                        grid: { display: false },
                        ticks: {
                          color: "#fff",
                          font: { size: 8, weight: "bold" },
                        },
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

      {/* TICKER */}
      <div
        className="bg-info py-1 border-top border-dark"
        style={{ height: "35px" }}
      >
        <marquee
          className="text-black text-bold text-uppercase pt-1"
          scrollamount="6"
          style={{ fontSize: "0.7rem" }}
        >
          +++ INFLACIÓN REAL (30D): {data.inflacion_real}% +++ MEP VENTA: $
          {data.dolar_mep} +++ EQUITY SHIELD: USD{" "}
          {parseFloat(data.patrimonio_usd).toLocaleString("es-AR")} +++ FLUJO
          HOY: {data.tickets_hoy} TICKETS +++ LÍDER: {data.top_hoy} +++
        </marquee>
      </div>
    </div>
  );
};

export default OracleEye;
