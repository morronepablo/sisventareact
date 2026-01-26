// src/pages/OraclePulse.jsx
import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import NeonCard from "../components/ui/NeonCard";
import LoadingSpinner from "../components/LoadingSpinner";

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://sistema-ventas-backend-3nn3.onrender.com";

const OraclePulse = () => {
  const [data, setData] = useState({
    ventas: {
      hoy: 0,
      ayer: 0,
      tickets: 0,
      velocidad: 0,
      mix: { efectivo: 0, mp: 0, otros: 0 },
    },
    criticos: [],
    deuda: 0,
    gastos_mes: 0,
    mep_referencia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(false);

  const fetchPulse = useCallback(async () => {
    try {
      const res = await api.get("/oracle/pulse");
      if (res.data) {
        setData(res.data);
        setFlash(true);
        setTimeout(() => setFlash(false), 800);
      }
    } catch (err) {
      console.error("Pulse Link Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPulse();
    const socket = io(SOCKET_URL);
    socket.on("update-dashboard", () => fetchPulse());
    return () => socket.disconnect();
  }, [fetchPulse]);

  if (loading) return <LoadingSpinner />;

  const hoy = data.ventas?.hoy || 0;
  const ayer = data.ventas?.ayer || 0;
  const esPositivo = hoy >= ayer;
  const ratio = ayer > 0 ? (hoy / ayer) * 100 : 100;

  return (
    <div
      style={{
        backgroundColor: "#0a0b10",
        minHeight: "100vh",
        width: "100%",
        padding: "1.5rem",
        color: "white",
        fontFamily: "sans-serif",
        position: "relative",
        zIndex: 1050,
        overflowY: "auto",
        boxShadow: flash ? "inset 0 0 60px rgba(0, 243, 255, 0.1)" : "none",
        transition: "box-shadow 0.6s ease",
      }}
    >
      {/* HEADER DINÁMICO */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "1px solid rgba(0,243,255,0.15)",
          paddingBottom: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              fontStyle: "italic",
              margin: 0,
              letterSpacing: "-2px",
            }}
          >
            ORACLE{" "}
            <span style={{ color: "#00f3ff", textShadow: "0 0 15px #00f3ff" }}>
              PULSE
            </span>
          </h1>
          <p
            style={{
              color: "#475569",
              fontSize: "10px",
              fontWeight: "bold",
              margin: "5px 0 0 0",
              letterSpacing: "4px",
            }}
          >
            OPERATIONAL INTELLIGENCE
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div
            style={{
              background: "#0f172a",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              textAlign: "right",
            }}
          >
            <span
              style={{ display: "block", fontSize: "9px", color: "#94a3b8" }}
            >
              SISTEMA ONLINE
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "#00f3ff",
              }}
            >
              ● SYNC
            </span>
          </div>
          <div
            style={{
              background: "#0f172a",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              textAlign: "right",
            }}
          >
            <span
              style={{ display: "block", fontSize: "9px", color: "#94a3b8" }}
            >
              EFICIENCIA DIARIA
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: esPositivo ? "#00f3ff" : "#ff00ff",
              }}
            >
              {ratio.toFixed(1)}% {esPositivo ? "▲" : "▼"}
            </span>
          </div>
        </div>
      </header>

      {/* BLOQUE 1: KPIs MAESTROS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <NeonCard
          title="VENTA BRUTA (HOY)"
          value={`$${hoy.toLocaleString("es-AR")}`}
          unit="TOTAL ARS"
          factor="REAL"
          type="cyan"
        />
        <NeonCard
          title="CENTINELA DE PASIVOS"
          value={`U$D ${(data.deuda / data.mep_referencia).toFixed(2)}`}
          unit="DEUDA PROV"
          factor={`$${data.deuda.toLocaleString()}`}
          type="magenta"
        />
        <NeonCard
          title="DOLAR MEP (REAL)"
          value={`$${data.mep_referencia.toLocaleString()}`}
          unit="Venta Bolsa"
          factor="LIVE"
          type="amber"
        />
        <NeonCard
          title="TICKET PROMEDIO"
          value={`$${(data.ventas.tickets > 0 ? hoy / data.ventas.tickets : 0).toFixed(0)}`}
          unit="VALOR COMPRA"
          factor="BI"
          type="cyan"
        />
      </div>

      {/* BLOQUE 2: EL CORAZÓN DEL NEGOCIO (MIX Y GASTOS) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* MIX DE TESORERIA */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "1.5rem",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h4
            style={{
              fontSize: "11px",
              color: "#00f3ff",
              letterSpacing: "2px",
              marginBottom: "1.5rem",
              fontWeight: "bold",
            }}
          >
            MIX DE TESORERÍA (INGRESOS HOY)
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
          >
            <div>
              <span style={{ fontSize: "20px", fontWeight: "900" }}>
                ${data.ventas.mix.efectivo.toLocaleString()}
              </span>
              <div
                style={{
                  height: "4px",
                  background: "#28a745",
                  width: "100%",
                  marginTop: "5px",
                  boxShadow: "0 0 10px #28a745",
                }}
              ></div>
              <p
                style={{ fontSize: "9px", color: "#64748b", marginTop: "8px" }}
              >
                EFECTIVO EN CAJA
              </p>
            </div>
            <div>
              <span style={{ fontSize: "20px", fontWeight: "900" }}>
                ${data.ventas.mix.mp.toLocaleString()}
              </span>
              <div
                style={{
                  height: "4px",
                  background: "#007bff",
                  width: "100%",
                  marginTop: "5px",
                  boxShadow: "0 0 10px #007bff",
                }}
              ></div>
              <p
                style={{ fontSize: "9px", color: "#64748b", marginTop: "8px" }}
              >
                MERCADO PAGO
              </p>
            </div>
            <div>
              <span style={{ fontSize: "20px", fontWeight: "900" }}>
                ${data.ventas.mix.otros.toLocaleString()}
              </span>
              <div
                style={{
                  height: "4px",
                  background: "#ffc107",
                  width: "100%",
                  marginTop: "5px",
                  boxShadow: "0 0 10px #ffc107",
                }}
              ></div>
              <p
                style={{ fontSize: "9px", color: "#64748b", marginTop: "8px" }}
              >
                TARJETAS / TRANSF.
              </p>
            </div>
          </div>
        </div>

        {/* SALUD OPERATIVA (VELOCIDAD Y GASTOS) */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "1.5rem",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h4
            style={{
              fontSize: "11px",
              color: "#ff00ff",
              letterSpacing: "2px",
              marginBottom: "1.5rem",
              fontWeight: "bold",
            }}
          >
            SINCERAMIENTO (MES)
          </h4>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#ff00ff",
                }}
              >
                ${data.gastos_mes.toLocaleString()}
              </span>
              <p style={{ fontSize: "9px", color: "#64748b" }}>
                GASTOS ACUMULADOS
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "24px", fontWeight: "900" }}>
                {data.ventas.velocidad.toFixed(0)}s
              </span>
              <p style={{ fontSize: "9px", color: "#64748b" }}>
                VELOCIDAD DE CAJA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: RADAR DE REPOSICIÓN */}
      <section style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "11px",
            color: "#ffab00",
            fontWeight: "bold",
            letterSpacing: "4px",
            marginBottom: "1rem",
          }}
        >
          RADAR DE REPOSICIÓN CRÍTICA
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "1rem",
          }}
        >
          {data.criticos.map((p, i) => (
            <NeonCard
              key={i}
              title={p.nombre.substring(0, 18)}
              value={p.stock_base}
              unit={`MIN: ${p.stock_minimo}`}
              factor={p.factor_conversion}
              type="amber"
            />
          ))}
        </div>
      </section>

      {/* BLOQUE 4: ANATOMÍA DEL DÍA */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "5rem",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.2) 100%)",
            padding: "2rem",
            borderRadius: "24px",
            border: "1px solid rgba(0, 243, 255, 0.15)",
          }}
        >
          <h4
            style={{
              fontSize: "10px",
              color: "#00f3ff",
              letterSpacing: "3px",
              marginBottom: "1rem",
              fontWeight: "bold",
            }}
          >
            PULSO TRANSACCIONAL
          </h4>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
            }}
          >
            <span
              style={{
                fontSize: "5rem",
                fontWeight: "900",
                lineHeight: 0.8,
                letterSpacing: "-4px",
              }}
            >
              {data.ventas.tickets}
            </span>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  margin: 0,
                  color: "#00f3ff",
                  fontWeight: "black",
                  fontSize: "14px",
                }}
              >
                TICKETS
              </p>
              <p style={{ fontSize: "10px", color: "#64748b" }}>Emitidos hoy</p>
            </div>
          </div>
        </div>

        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.2) 100%)",
            padding: "2rem",
            borderRadius: "24px",
            border: "1px solid rgba(255, 0, 255, 0.15)",
          }}
        >
          <h4
            style={{
              fontSize: "10px",
              color: "#ff00ff",
              letterSpacing: "3px",
              marginBottom: "1rem",
              fontWeight: "bold",
            }}
          >
            PATRIMONIO EN RIESGO
          </h4>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
            }}
          >
            <span
              style={{
                fontSize: "5rem",
                fontWeight: "900",
                color: "#ff00ff",
                lineHeight: 0.8,
                letterSpacing: "-4px",
              }}
            >
              U$D {(data.deuda / data.mep_referencia).toFixed(0)}
            </span>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  margin: 0,
                  color: "#ff00ff",
                  fontWeight: "black",
                  fontSize: "14px",
                }}
              >
                COBERTURA
              </p>
              <p style={{ fontSize: "10px", color: "#64748b" }}>
                Necesaria para reposición
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "rgba(0,0,0,0.95)",
          padding: "10px",
          borderTop: "2px solid #00f3ff",
          zIndex: 2000,
        }}
      >
        <marquee
          style={{
            color: "#00f3ff",
            fontSize: "11px",
            fontWeight: "900",
            letterSpacing: "3px",
          }}
        >
          +++ ORACLE PULSE v2.5 +++ VENTA: ${hoy.toLocaleString()} +++ TICKETS:{" "}
          {data.ventas.tickets} +++ MEP: ${data.mep_referencia.toLocaleString()}{" "}
          +++ GASTOS MES: ${data.gastos_mes.toLocaleString()} +++ STATUS:
          SINCRONIZADO +++
        </marquee>
      </footer>
    </div>
  );
};

export default OraclePulse;
