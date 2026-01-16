// src/pages/DashboardWallStreet.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import api from "../services/api";
import Swal from "sweetalert2";

const socket = io(
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://sistema-ventas-backend-3nn3.onrender.com"
);

const DashboardWallStreet = () => {
  const [metrics, setMetrics] = useState({
    ventas_dia: 0,
    ganancia_mes: 0,
    productosBajoStock: 0,
  });
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [reloj, setReloj] = useState(new Date().toLocaleTimeString());

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  // 🚀 FUENTE DINÁMICA: Ajusta el tamaño según la cantidad de dígitos
  const getFontSize = (value) => {
    const text = formatMoney(value);
    if (text.length > 16) return "4.5rem";
    if (text.length > 13) return "5.5rem";
    if (text.length > 10) return "7.5rem";
    return "9rem";
  };

  const fetchMetrics = async () => {
    try {
      const [resMetrics, resEmpresa] = await Promise.all([
        api.get("/ventas/dashboard-metrics"),
        api.get("/empresas/1"),
      ]);
      setMetrics(resMetrics.data);
      if (resEmpresa.data.logo) {
        setLogoUrl(`http://localhost:3001/assets/img/${resEmpresa.data.logo}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const timer = setInterval(
      () => setReloj(new Date().toLocaleTimeString()),
      1000
    );

    socket.on("wall-street-new-sale", (data) => {
      setUltimaVenta(data);
      fetchMetrics();
      if (data.esVentaOro) {
        Swal.fire({
          title: "🔥 VENTA DE ORO 🔥",
          html: `<h1 style="font-size: 5rem; color: #ffc107">$ ${data.monto.toLocaleString()}</h1><p style="font-size: 1.5rem">${
            data.cliente
          }</p>`,
          background: "#000",
          color: "#fff",
          timer: 5000,
          showConfirmButton: false,
          showClass: { popup: "animate__animated animate__zoomIn" },
        });
      }
    });

    return () => {
      clearInterval(timer);
      socket.off("wall-street-new-sale");
    };
  }, []);

  return (
    <div
      className="container-fluid p-0 bg-black text-white"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary"
        style={{ backgroundColor: "#111" }}
      >
        <h2 className="text-bold m-0">
          <i className="fas fa-chart-line text-success mr-2"></i>WALL STREET
          MODE
        </h2>
        <h1
          className="text-bold m-0 text-warning"
          style={{ fontFamily: "monospace", fontSize: "3.5rem" }}
        >
          {reloj}
        </h1>
      </div>

      <div className="p-4">
        {/* INDICADORES PRINCIPALES */}
        <div className="row">
          <div className="col-md-6">
            <div
              className="p-4 rounded shadow-lg text-center"
              style={{
                background: "#0a0a0a",
                border: "2px solid #28a745",
                height: "320px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h2 className="text-muted text-uppercase mb-0">Ventas del Día</h2>
              <span
                style={{
                  fontSize: getFontSize(metrics.ventas_dia),
                  transition: "font-size 0.5s ease",
                }}
                className="font-weight-bold text-success animate__animated animate__pulse animate__infinite"
              >
                {formatMoney(metrics.ventas_dia)}
              </span>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="p-4 rounded shadow-lg text-center"
              style={{
                background: "#0a0a0a",
                border: "2px solid #17a2b8",
                height: "320px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h2 className="text-muted text-uppercase mb-0">
                Ganancia Neta Mes
              </h2>
              <span
                style={{
                  fontSize: getFontSize(metrics.ganancia_mes),
                  transition: "font-size 0.5s ease",
                }}
                className="font-weight-bold text-info"
              >
                {formatMoney(metrics.ganancia_mes)}
              </span>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          {/* ÚLTIMA OPERACIÓN CON SPINNER RESTAURADO */}
          <div className="col-md-4">
            <div
              className="card bg-dark border-warning shadow-lg h-100"
              style={{ minHeight: "280px" }}
            >
              <div className="card-header border-warning text-center">
                <h2 className="card-title text-bold text-warning float-none">
                  Última Operación
                </h2>
              </div>
              <div className="card-body text-center d-flex flex-column justify-content-center">
                {ultimaVenta ? (
                  <div className="animate__animated animate__backInUp">
                    <h1 style={{ fontSize: "4rem" }} className="text-white">
                      {formatMoney(ultimaVenta.monto)}
                    </h1>
                    <p className="h2 text-muted">{ultimaVenta.cliente}</p>
                    <span className="badge badge-warning p-2 h4 mt-2">
                      {ultimaVenta.hora} hs
                    </span>
                  </div>
                ) : (
                  <div className="animate__animated animate__fadeIn">
                    {/* 🚀 SPINNER GIRATORIO RESTAURADO 🚀 */}
                    <i className="fas fa-sync fa-spin fa-4x text-muted mb-4"></i>
                    <h2 className="text-muted">Esperando actividad...</h2>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className={`card ${
                metrics.productosBajoStock > 0 ? "bg-danger" : "bg-success"
              } shadow-lg h-100`}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <i
                  className={`fas ${
                    metrics.productosBajoStock > 0
                      ? "fa-exclamation-triangle"
                      : "fa-check-circle"
                  } fa-6x mb-2`}
                ></i>
                <h1
                  style={{ fontSize: "7rem" }}
                  className="font-weight-bold m-0"
                >
                  {metrics.productosBajoStock}
                </h1>
                <p className="h3 text-uppercase">Stock en Riesgo</p>
              </div>
            </div>
          </div>

          <div className="col-md-4 text-center d-flex align-items-center justify-content-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                style={{
                  maxWidth: "85%",
                  maxHeight: "250px",
                  filter: "drop-shadow(0 0 20px rgba(255,255,255,0.15))",
                }}
                alt="Logo"
              />
            ) : (
              <i className="fas fa-building fa-8x text-muted opacity-25"></i>
            )}
          </div>
        </div>
      </div>

      {/* TICKER INFERIOR */}
      <div
        className="fixed-bottom bg-primary p-3"
        style={{ height: "85px", borderTop: "4px solid #fff" }}
      >
        <marquee className="h2 mb-0 text-white font-weight-bold">
          💰 ÚLTIMA VENTA:{" "}
          {ultimaVenta
            ? `${ultimaVenta.cliente} por ${formatMoney(ultimaVenta.monto)}`
            : "ESPERANDO ACTIVIDAD..."}{" "}
          --- ⚠️ ALERTA: {metrics.productosBajoStock} PRODUCTOS EN RIESGO DE
          STOCK --- 🚀 UTILIDAD REAL ACUMULADA:{" "}
          {formatMoney(metrics.ganancia_mes)} --- 🏢 MORRONE VENTAS BI
        </marquee>
      </div>
    </div>
  );
};

export default DashboardWallStreet;
