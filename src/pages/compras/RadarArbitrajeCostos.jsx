// src/pages/compras/RadarArbitrajeCostos.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
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
  Legend,
);

// --- ESTILOS DE ARQUITECTURA (Sincronizados) ---
const dataTableStyles = `
  #arbitraje-table_wrapper .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  #arbitraje-table_wrapper .dataTables_paginate { padding: 10px 15px !important; }
`;

const RadarArbitrajeCostos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/compras/bi/matriz-arbitraje")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#arbitraje-table";
      const $ = window.$;
      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
        $(tableId).DataTable({
          paging: true,
          pageLength: 5,
          language: {
            info: "Mostrando _START_ a _END_ de _TOTAL_ productos analizados",
            paginate: { previous: "Ant.", next: "Sig." },
          },
          dom: "rtip",
        });
      }, 300);
      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, data]);

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  // --- LÓGICA DE PROCESAMIENTO PARA EL GRÁFICO GLOBAL ---
  const productosComparables = data.filter((p) => p.comparativa.length > 1);
  const chartLabels = [];
  const chartValues = [];
  const chartColors = [];

  productosComparables.forEach((p) => {
    p.comparativa.forEach((comp) => {
      chartLabels.push(
        `${p.nombre.substring(0, 10)}.. (${comp.proveedor.substring(0, 8)})`,
      );
      chartValues.push(comp.costo);
      if (comp.costo === p.minCosto) chartColors.push("rgba(40, 167, 69, 0.7)");
      else if (comp.costo === p.maxCosto)
        chartColors.push("rgba(220, 53, 69, 0.7)");
      else chartColors.push("rgba(108, 117, 125, 0.5)");
    });
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Costo por Proveedor",
        data: chartValues,
        backgroundColor: chartColors,
        borderColor: "#444",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `Costo: ${formatMoney(ctx.raw)}` },
      },
    },
    scales: {
      x: { ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 } },
      y: { ticks: { callback: (v) => "$" + v.toLocaleString() } },
    },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{dataTableStyles}</style>

      <h1 className="text-bold">
        <i className="fas fa-balance-scale text-warning mr-2"></i>Radar de
        Arbitraje
      </h1>
      <p className="text-muted text-uppercase small font-weight-bold">
        Optimización de compras: Matriz de competitividad multi-proveedor
      </p>
      <hr />

      {/* 1. TABLA DE AUDITORÍA */}
      <div className="card card-outline card-warning shadow mb-2">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            Diferencial de Costos Detectado
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table id="arbitraje-table" className="table table-hover mb-0">
              <thead className="thead-dark text-xs text-center">
                <tr>
                  <th>Producto Analizado</th>
                  <th>Fuentes</th>
                  <th className="text-right">Mínimo</th>
                  <th className="text-right">Máximo</th>
                  <th>Brecha %</th>
                  <th className="text-right bg-navy">Ahorro en Stock</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.map((p, i) => (
                  <tr key={i}>
                    <td className="align-middle text-bold">{p.nombre}</td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${p.comparativa.length > 1 ? "badge-info" : "badge-light border"}`}
                      >
                        {p.comparativa.length} fuentes
                      </span>
                    </td>
                    <td className="text-right align-middle text-success font-weight-bold">
                      {formatMoney(p.minCosto)}
                    </td>
                    <td className="text-right align-middle text-danger font-weight-bold">
                      {formatMoney(p.maxCosto)}
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${parseFloat(p.brecha) > 10 ? "badge-danger" : "badge-warning"}`}
                      >
                        {p.brecha}%
                      </span>
                    </td>
                    <td className="text-right align-middle bg-light text-bold text-primary">
                      {formatMoney(p.ahorro_potencial)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. EXPLICACIÓN DE MÉTRICAS (Ubicada debajo de la tabla como pediste) */}
      <div className="alert bg-white shadow-sm border-left-warning mb-4 py-2">
        <div className="row align-items-center">
          <div className="col-md-1 text-center">
            <i className="fas fa-lightbulb text-warning fa-2x"></i>
          </div>
          <div className="col-md-11">
            <h6 className="text-bold mb-1">¿Cómo leer esta matriz?</h6>
            <p className="small mb-0 text-muted">
              El <b>Ahorro en Stock</b> representa cuánto dinero "está sobre la
              mesa". Es la diferencia entre tu costo más caro y el más barato
              multiplicada por las unidades que tenés hoy. Si la <b>Brecha %</b>{" "}
              es alta, significa que tenés proveedores desactualizados o
              abusivos. ¡Momento de renegociar!
            </p>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICO COMPARATIVO GLOBAL */}
      <div className="row">
        <div className="col-12">
          <div className="card card-dark shadow">
            <div className="card-header">
              <h3 className="card-title text-bold text-uppercase">
                <i className="fas fa-chart-bar mr-2"></i> Mapa de Dispersión:
                Mejores vs Peores Precios
              </h3>
            </div>
            <div className="card-body">
              <div style={{ height: "400px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="d-flex justify-content-center mt-3">
                <span className="badge badge-success px-3 py-2 mr-2">
                  <i className="fas fa-check mr-1"></i> Mejor Opción
                </span>
                <span className="badge badge-danger px-3 py-2 mr-2">
                  <i className="fas fa-times mr-1"></i> Sobreprecio
                </span>
                <span className="badge badge-secondary px-3 py-2">
                  <i className="fas fa-info-circle mr-1"></i> Intermedio
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER DE INTELIGENCIA DE AHORRO TOTAL */}
      <div className="alert bg-navy mt-2 shadow border-left-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <span>
            <i className="fas fa-hand-holding-usd mr-2 text-success"></i>{" "}
            <b>POTENCIAL DE RE-NEGOCIACIÓN TOTAL:</b>
          </span>
          <h4 className="mb-0 text-bold text-success">
            {formatMoney(
              data.reduce((acc, p) => acc + parseFloat(p.ahorro_potencial), 0),
            )}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default RadarArbitrajeCostos;
