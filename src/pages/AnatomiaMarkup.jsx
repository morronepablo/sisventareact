// src/pages/AnatomiaMarkup.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // AÑADIDO
import api from "../services/api";
import { io } from "socket.io-client"; // 🚀 Importamos Socket.io
import LoadingSpinner from "../components/LoadingSpinner";

// Configuración de URL de Sockets sincronizada con tu Backend
const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://sistema-ventas-backend-3nn3.onrender.com";

const AnatomiaMarkup = () => {
  const navigate = useNavigate(); // AÑADIDO
  const [data, setData] = useState({
    overhead_actual: "0.00",
    total_analizado: 0,
    productos_riesgo: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Función de carga memorizada para poder usarla en el useEffect y el Socket
  const fetchMarkup = useCallback(async () => {
    try {
      const res = await api.get("/oracle/markup-analysis");
      if (res.data) setData(res.data);
    } catch (err) {
      console.error("BI Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Carga inicial
    fetchMarkup();

    // 2. Conexión al Pulso de Sockets
    const socket = io(SOCKET_URL);

    // Escuchamos el evento exacto que emite tu storeVenta: "update-dashboard"
    socket.on("update-dashboard", () => {
      console.log("⚡ [MARKUP BI] Actualización detectada por nueva venta...");
      fetchMarkup(); // Refrescamos la data sin poner el loading en true para que sea fluido
    });

    return () => {
      socket.off("update-dashboard");
      socket.disconnect();
    };
  }, [fetchMarkup]);

  if (loading) return <LoadingSpinner />;

  const totalPages = Math.ceil(data.productos_riesgo.length / itemsPerPage);
  const currentItems = data.productos_riesgo.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Lógica de Paginación Deslizante (1 2 3 ... 80)
  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages = [1, 2, 3, 4, 5, "...", totalPages];
      else if (currentPage >= totalPages - 2)
        pages = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      else
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
    }
    return pages;
  };

  return (
    <div
      style={{
        backgroundColor: "#0a0b10",
        minHeight: "100vh",
        padding: "2rem",
        color: "white",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes alert-flicker { 0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 85, 0.4); border-color: #ff0055; } 50% { box-shadow: 0 0 5px rgba(255, 0, 85, 0.1); border-color: #550022; } }
        .neon-red-alert { animation: alert-flicker 1.5s infinite; background: rgba(255, 0, 85, 0.05) !important; }
        .page-btn { padding: 10px 18px; margin: 0 4px; border: 1px solid #1e293b; background: #0f172a;import { useCallback } from 'react';
 color: #94a3b8; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 13px; }
        .page-btn.active { border-color: #00f3ff; color: #00f3ff; box-shadow: 0 0 10px rgba(0,243,255,0.3); background: rgba(0, 243, 255, 0.05); }
        .page-btn:disabled { cursor: not-allowed; opacity: 0.15; filter: grayscale(1); border-style: dashed; }
        .ellipsis { color: #475569; padding: 0 12px; font-weight: bold; align-self: center; }
        .clickable-title { cursor: pointer; transition: all 0.3s ease; }
        .clickable-title:hover { transform: translateY(-2px); text-shadow: 0 0 20px rgba(0,243,255,0.8); }
      `,
        }}
      />

      {/* HEADER */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "1.5rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          {/* TÍTULO CLICKEABLE - AÑADIDO onClick */}
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              fontStyle: "italic",
              margin: 0,
            }}
            className="clickable-title"
            onClick={() => navigate("/dashboard")} // AÑADIDO
          >
            ANATOMÍA DEL{" "}
            <span
              style={{
                color: "#00f3ff",
                textShadow: "0 0 10px rgba(0,243,255,0.5)",
              }}
            >
              MARKUP REAL
            </span>
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "11px",
              fontWeight: "bold",
              letterSpacing: "2px",
              marginTop: "5px",
            }}
          >
            AUDITORÍA INTEGRAL DE PERFORMANCE (OVERHEAD: {data.overhead_actual}
            %)
          </p>
        </div>
        <div
          style={{
            textAlign: "right",
            background: "rgba(0, 243, 255, 0.05)",
            border: "1px solid rgba(0, 243, 255, 0.3)",
            padding: "10px 20px",
            borderRadius: "12px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "9px",
              fontWeight: "bold",
            }}
          >
            PRODUCTOS AUDITADOS
          </span>
          <span
            style={{
              fontSize: "1.8rem",
              fontWeight: "900",
              color: "#00f3ff",
              fontFamily: "monospace",
            }}
          >
            {data.total_analizado}
          </span>
        </div>
      </header>

      {/* LISTADO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          minHeight: "520px",
          alignContent: "start",
        }}
      >
        {currentItems.map((p) => {
          const utilidad = parseFloat(p.utilidad_neta_real);
          const esCritico = utilidad <= 0;

          // Formateador para moneda argentina (Buenos Aires)
          const formatMoney = (valor) => {
            return new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(valor || 0);
          };

          return (
            <div
              key={p.id}
              className={esCritico ? "neon-red-alert" : ""}
              style={{
                padding: "1.2rem",
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: esCritico ? "#ff0055" : "white",
                      margin: 0,
                    }}
                  >
                    {p.nombre}{" "}
                    <small
                      style={{
                        fontSize: "10px",
                        color: "#475569",
                        marginLeft: "10px",
                      }}
                    >
                      F.C: {p.factor_conversion}
                    </small>
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      marginTop: "12px",
                    }}
                  >
                    <div
                      style={{
                        borderLeft: "3px solid #00f3ff",
                        paddingLeft: "10px",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(0, 243, 255, 0.6)",
                          display: "block",
                          fontSize: "9px",
                        }}
                      >
                        P. VENTA
                      </span>
                      <span
                        style={{
                          color: "#00f3ff",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatMoney(parseFloat(p.precio_venta))}
                      </span>
                    </div>
                    <div
                      style={{
                        borderLeft: "3px solid #ff00ff",
                        paddingLeft: "10px",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255, 0, 255, 0.6)",
                          display: "block",
                          fontSize: "9px",
                        }}
                      >
                        COSTO REP
                      </span>
                      <span
                        style={{
                          color: "#ff00ff",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatMoney(parseFloat(p.costo_reposicion))}
                      </span>
                    </div>
                    <div
                      style={{
                        borderLeft: "3px solid #ffab00",
                        paddingLeft: "10px",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255, 171, 0, 0.6)",
                          display: "block",
                          fontSize: "9px",
                        }}
                      >
                        GASTOS OP
                      </span>
                      <span
                        style={{
                          color: "#ffab00",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatMoney(parseFloat(p.gastos_proyectados))}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "bold",
                      display: "block",
                    }}
                  >
                    RESULTADO NETO
                  </span>
                  <span
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: "900",
                      color: esCritico ? "#ff0055" : "#00f3ff",
                      textShadow: "0 0 10px rgba(0,243,255,0.2)",
                    }}
                  >
                    {formatMoney(utilidad)}
                  </span>
                </div>
              </div>

              {/* LÍNEA DE PERFORMANCE HISTÓRICA */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                {[
                  { label: "VENTA DÍA", val: p.vta_dia, color: "#28a745" },
                  { label: "VENTA MES", val: p.vta_mes, color: "#007bff" },
                  { label: "VENTA AÑO", val: p.vta_anio, color: "#6610f2" },
                  { label: "TOTAL HIST.", val: p.vta_total, color: "#ffc107" },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      padding: "8px",
                      borderRadius: "6px",
                      borderLeft: `2px solid ${s.color}`,
                    }}
                  >
                    <span
                      style={{
                        color: s.color,
                        display: "block",
                        fontSize: "7px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                      }}
                    >
                      {formatMoney(parseFloat(s.val))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINACIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "3rem",
        }}
      >
        <button
          className="page-btn"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i> ANTERIOR
        </button>
        {getPaginationGroup().map((item, index) =>
          item === "..." ? (
            <span key={index} className="ellipsis">
              ...
            </span>
          ) : (
            <button
              key={index}
              className={`page-btn ${currentPage === item ? "active" : ""}`}
              onClick={() => setCurrentPage(item)}
            >
              {item}
            </button>
          ),
        )}
        <button
          className="page-btn"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          SIGUIENTE <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default AnatomiaMarkup;
