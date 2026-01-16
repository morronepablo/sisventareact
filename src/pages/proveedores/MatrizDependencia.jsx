// src/pages/proveedores/MatrizDependencia.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MatrizDependencia = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/proveedores/bi/dependencia")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-3">Sin datos suficientes.</div>;

  const chartData = {
    labels: data.proveedores.map((p) => p.proveedor_nombre),
    datasets: [
      {
        data: data.proveedores.map((p) => p.porcentaje),
        backgroundColor: [
          "#dc3545",
          "#ffc107",
          "#28a745",
          "#17a2b8",
          "#6610f2",
          "#e83e8c",
        ],
      },
    ],
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-shield-virus text-primary mr-2"></i>
        <b>Matriz de Dependencia</b>
      </h1>
      <p className="text-muted">
        Análisis de riesgo: ¿Qué porcentaje de tu utilidad depende de cada
        proveedor?
      </p>
      <hr />

      <div className="row">
        <div className="col-md-5">
          <div className="card card-outline card-primary shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Concentración de Utilidad
              </h3>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                <Doughnut
                  data={chartData}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card card-outline card-danger shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Semáforo de Riesgo Estratégico
              </h3>
            </div>
            <div className="card-body p-0">
              <table className="table table-striped m-0">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th className="text-center">% Dependencia</th>
                    <th>Nivel de Riesgo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.proveedores.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <b>{p.proveedor_nombre}</b>
                      </td>
                      <td className="text-center">
                        <div className="progress progress-xs">
                          <div
                            className={`progress-bar bg-${
                              p.riesgo === "CRÍTICO"
                                ? "danger"
                                : p.riesgo === "MEDIO"
                                ? "warning"
                                : "success"
                            }`}
                            style={{ width: `${p.porcentaje}%` }}
                          ></div>
                        </div>
                        <b>{p.porcentaje}%</b>
                      </td>
                      <td>
                        <span
                          className={`badge p-2 ${
                            p.riesgo === "CRÍTICO"
                              ? "badge-danger"
                              : p.riesgo === "MEDIO"
                              ? "badge-warning"
                              : "badge-success"
                          }`}
                        >
                          {p.riesgo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="alert bg-dark text-white mt-4 shadow border-left-danger">
        <h5>
          <i className="fas fa-exclamation-triangle text-danger mr-2"></i>
          <b>Diagnóstico de supervivencia BI:</b>
        </h5>
        {data.proveedores.some((p) => p.riesgo === "CRÍTICO")
          ? "¡Peligro! Tenés proveedores con más del 50% de peso en tu ganancia. Si uno de ellos falla, tu negocio entra en colapso. Es urgente diversificar marcas."
          : "Tu cartera de proveedores está diversificada. Ningún proveedor tiene el poder de comprometer tu operación por sí solo."}
      </div>
    </div>
  );
};

export default MatrizDependencia;
