// src/pages/Dashboard.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCounts, fetchChartData } from "../services/dashboardService";
import LoadingSpinner from "../components/LoadingSpinner";
import { io } from "socket.io-client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [counts, setCounts] = useState({ topProductos: [] });
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";
  const mesesLabels = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const loadDashboardData = async () => {
    if (!charts) setLoading(true);
    try {
      const [countsRes, chartsRes] = await Promise.all([
        fetchCounts(),
        fetchChartData(selectedMonth),
      ]);
      setCounts(countsRes);
      setCharts(chartsRes);
    } catch (error) {
      console.error("Error Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on("update-dashboard", () => {
      loadDashboardData();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const formatARS = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  const generateColors = (count) => {
    const colors = [
      "#f56954",
      "#00a65a",
      "#f39c12",
      "#00c0ef",
      "#3c8dbc",
      "#d2d6de",
      "#605ca8",
      "#ff851b",
      "#D81B60",
      "#39CCCC",
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const InfoBox = ({
    permission,
    link,
    color,
    icon,
    title,
    count,
    label,
    extraInfo,
  }) => {
    if (!hasPermission(permission)) return null;
    return (
      <div className="col-md-3 col-sm-6 col-12 mb-3">
        <div className="info-box zoomP shadow-sm" style={{ minHeight: "80px" }}>
          <Link
            to={link}
            className={`info-box-icon ${color}`}
            style={{ width: "60px", fontSize: "1.2rem" }}
          >
            <span>
              <i className={icon}></i>
            </span>
          </Link>
          <div className="info-box-content" style={{ padding: "5px 10px" }}>
            <span
              className="info-box-text text-dark small"
              style={{ fontWeight: "600" }}
            >
              {title}
            </span>
            <div className="d-flex justify-content-between align-items-baseline">
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span
                  className="info-box-number"
                  style={{ fontSize: "1.1rem", fontWeight: "700" }}
                >
                  {count || 0}
                </span>
                <small
                  className="text-muted ml-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  {label}
                </small>
              </div>
              {extraInfo}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SmallBox = ({ permission, color, title, value, icon, link }) => {
    if (!hasPermission(permission)) return null;
    return (
      <div className="col-lg-3 col-6">
        <div className={`small-box ${color} shadow-sm zoomP`}>
          <div className="inner text-white">
            <h3 style={{ fontSize: "1.6rem" }}>{value}</h3>
            <p
              style={{
                textTransform: "uppercase",
                fontSize: "0.7rem",
                fontWeight: "bold",
              }}
            >
              {title}
            </p>
          </div>
          <div className="icon">
            <i className={icon}></i>
          </div>
          <Link to={link} className="small-box-footer">
            Más info <i className="fas fa-arrow-circle-right"></i>
          </Link>
        </div>
      </div>
    );
  };

  if (loading || !charts) return <LoadingSpinner />;

  // --- 📊 DEFINICIÓN DE TODOS LOS OBJETOS DE DATOS PARA GRÁFICOS 📊 ---

  const dataComparativa = {
    labels: charts.comparativaDiaria.map((d) => d.dia),
    datasets: [
      {
        label: "Mes Actual",
        data: charts.comparativaDiaria.map((d) => d.actual),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Mes Anterior",
        data: charts.comparativaDiaria.map((d) => d.anterior),
        borderColor: "#d2d6de",
        borderDash: [5, 5],
        backgroundColor: "transparent",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const dataUtilidadNeta = {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "Utilidad Neta Real",
        data: charts.balanceMensual.map(
          (b) => parseFloat(b.ganancia_bruta) - parseFloat(b.g_total)
        ),
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const dataVentasHora = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}hs`),
    datasets: [
      {
        label: "Facturación por Hora ($)",
        data: Array.from({ length: 24 }, (_, i) => {
          const item = charts.ventasPorHora.find(
            (vh) => parseInt(vh.hora) === i
          );
          return item ? parseFloat(item.total) : 0;
        }),
        backgroundColor: "rgba(255, 193, 7, 0.7)",
        borderColor: "#ffc107",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const dataBalance = {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "Ventas",
        data: charts.balanceMensual.map((b) => b.v_total),
        backgroundColor: "#007bff",
      },
      {
        label: "Compras + Gastos",
        data: charts.balanceMensual.map(
          (b) => parseFloat(b.c_total) + parseFloat(b.g_total)
        ),
        backgroundColor: "#dc3545",
      },
    ],
  };

  const dataGananciaCat = {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: charts.categoriasLista.map((cat, idx) => ({
      label: cat,
      data: Array.from(
        { length: 12 },
        (_, i) =>
          charts.gananciasRaw.find(
            (r) => r.mes === i + 1 && r.categoria === cat
          )?.ganancia || 0
      ),
      backgroundColor: generateColors(charts.categoriasLista.length)[idx],
    })),
  };

  return (
    <div className="container-fluid pt-3 pb-5">
      <style>{`
        .bg-purple { background-color: #605ca8 !important; } .bg-navy { background-color: #001f3f !important; }
        .bg-maroon { background-color: #d81b60 !important; } .bg-olive { background-color: #3d9970 !important; }
        .bg-indigo { background-color: #6610f2 !important; } .bg-pink { background-color: #e83e8c !important; }
        .bg-fuchsia { background-color: #f012be !important; } .bg-teal { background-color: #39cccc !important; }
        .small-box { min-height: 140px; margin-bottom: 20px; } .small-box > .inner { padding: 10px; height: 105px; }
        .productos-scroll { height: 75px; overflow-y: auto; padding-right: 5px; margin-top: 5px; }
        .productos-scroll::-webkit-scrollbar { width: 3px; } .productos-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); }
        .product-badge { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; }
        .zoomP { transition: transform .2s; } .zoomP:hover { transform: scale(1.01); }
      `}</style>

      <h1>
        <b>Panel de Control - {user.name}</b>
      </h1>
      <hr />

      {/* FILAS INFOBOXES (LAS 13 ORIGINALES) */}
      <div className="row">
        <InfoBox
          permission="ver_roles"
          link="/roles/listado"
          color="bg-info"
          icon="fas fa-user-check"
          title="Roles"
          count={counts.roles}
          label="roles"
        />
        <InfoBox
          permission="ver_usuarios"
          link="/usuarios/listado"
          color="bg-primary"
          icon="fas fa-users"
          title="Usuarios"
          count={counts.usuarios}
          label="usuarios"
        />
        <InfoBox
          permission="ver_categorias"
          link="/categorias/listado"
          color="bg-success"
          icon="fas fa-tags"
          title="Categorías"
          count={counts.categorias}
          label="categorías"
        />
        <InfoBox
          permission="ver_unidades"
          link="/unidades/listado"
          color="bg-warning"
          icon="fas fa-weight-hanging"
          title="Unidades"
          count={counts.unidades}
          label="unidades"
        />
      </div>
      <div className="row">
        <InfoBox
          permission="ver_productos"
          link="/productos/listado"
          color="bg-danger"
          icon="fas fa-boxes"
          title="Productos"
          count={counts.productos}
          label="productos"
        />
        <InfoBox
          permission="ver_proveedores"
          link="/proveedores/listado"
          color="bg-dark"
          icon="fas fa-truck"
          title="Proveedores"
          count={counts.proveedores}
          label="proveedores"
          extraInfo={
            <span className="text-danger font-weight-bold small">
              Deuda: {formatARS(counts.proveedoresDeuda)}
            </span>
          }
        />
        <InfoBox
          permission="ver_compras"
          link="/compras/listado"
          color="bg-purple"
          icon="fas fa-shopping-cart"
          title="Compras"
          count={counts.compras}
          label="compras"
          extraInfo={
            <span className="text-success font-weight-bold small">
              {counts.comprasAnio} este año
            </span>
          }
        />
        <InfoBox
          permission="ver_clientes"
          link="/clientes/listado"
          color="bg-secondary"
          icon="fas fa-user-friends"
          title="Clientes"
          count={counts.clientes}
          label="clientes"
          extraInfo={
            <span className="text-danger font-weight-bold small">
              Deuda: {formatARS(counts.clientesDeuda)}
            </span>
          }
        />
      </div>
      <div className="row">
        <InfoBox
          permission="ver_ventas"
          link="/ventas/listado"
          color="bg-orange"
          icon="fas fa-cash-register"
          title="Ventas"
          count={counts.ventas}
          label="ventas"
          extraInfo={
            <span className="text-success font-weight-bold small">
              {counts.ventasAnio} este año
            </span>
          }
        />
        <InfoBox
          permission="ver_arqueos"
          link="/arqueos/listado"
          color="bg-pink"
          icon="fas fa-money-bill"
          title="Arqueos"
          count={counts.arqueos}
          label="arqueos"
          extraInfo={
            <span className="text-success font-weight-bold small">
              {counts.arqueosAnio} este año
            </span>
          }
        />
        <InfoBox
          permission="ver_combos"
          link="/combos/listado"
          color="bg-teal"
          icon="fas fa-volleyball-ball"
          title="Combos"
          count={counts.combos}
          label="combos"
        />
        <InfoBox
          permission="ver_empresa"
          link="/configuracion/empresa"
          color="bg-fuchsia"
          icon="fas fa-building"
          title="Empresas"
          count={counts.empresas}
          label="empresas"
        />
      </div>
      <div className="row">
        <InfoBox
          permission="ver_productos"
          link="/productos/reposicion"
          color={counts.productosBajoStock > 0 ? "bg-danger" : "bg-success"}
          icon="fas fa-truck-loading"
          title="Necesitan Reposición"
          count={counts.productosBajoStock}
          label="artículos"
        />
      </div>

      <hr />

      {/* FILAS SMALLBOXES FINANZAS (LAS 16 ORIGINALES) */}
      <div className="row">
        <SmallBox
          permission="ver_ventas"
          color="bg-info"
          title="Ventas del día"
          value={formatARS(counts.ventas_dia)}
          icon="fas fa-calendar-day"
          link="/ventas/listado"
        />
        <SmallBox
          permission="ver_ventas"
          color="bg-success"
          title="Ventas del mes"
          value={formatARS(counts.ventas_mes)}
          icon="fas fa-calendar-alt"
          link="/ventas/listado"
        />
        <SmallBox
          permission="ver_ventas"
          color="bg-purple"
          title="Ventas del año"
          value={formatARS(counts.ventas_anio)}
          icon="fas fa-calendar"
          link="/ventas/listado"
        />
        <div className="col-lg-3 col-6">
          <div className="small-box bg-navy shadow-sm">
            <div className="inner text-white">
              <div className="productos-scroll">
                {counts.topProductos?.map((p, i) => (
                  <div
                    key={i}
                    className="d-flex justify-content-between align-items-center mb-1"
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "80%",
                      }}
                    >
                      {p.nombre}
                    </span>
                    <span
                      className={`product-badge ${
                        i === 0
                          ? "bg-info"
                          : i === 1
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {p.veces_vendido}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="icon">
              <i className="fas fa-boxes-stacked"></i>
            </div>
            <div
              className="small-box-footer text-bold"
              style={{ fontSize: "0.7rem" }}
            >
              TOP MAS VENDIDOS
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <SmallBox
          permission="ver_ventas"
          color="bg-primary"
          title="Ganancia del día"
          value={formatARS(counts.ganancia_dia)}
          icon="fas fa-calendar-day"
          link="/ventas/listado"
        />
        <SmallBox
          permission="ver_ventas"
          color="bg-warning"
          title="Ganancia del mes"
          value={formatARS(counts.ganancia_mes)}
          icon="fas fa-calendar-alt"
          link="/ventas/listado"
        />
        <SmallBox
          permission="ver_ventas"
          color="bg-teal"
          title="Ganancia del año"
          value={formatARS(counts.ganancia_anio)}
          icon="fas fa-calendar"
          link="/ventas/listado"
        />
        <SmallBox
          permission="ver_clientes"
          color="bg-maroon"
          title="Deuda General"
          value={formatARS(counts.clientesDeuda)}
          icon="fas fa-hand-holding-usd"
          link="/clientes/listado"
        />
      </div>
      <div className="row">
        <SmallBox
          permission="ver_devoluciones"
          color="bg-danger"
          title="Devoluciones del día"
          value={formatARS(counts.devoluciones_dia)}
          icon="fas fa-undo-alt"
          link="/devoluciones/listado"
        />
        <SmallBox
          permission="ver_devoluciones"
          color="bg-orange"
          title="Devoluciones del mes"
          value={formatARS(counts.devoluciones_mes)}
          icon="fas fa-undo-alt"
          link="/devoluciones/listado"
        />
        <SmallBox
          permission="ver_devoluciones"
          color="bg-dark"
          title="Devoluciones del año"
          value={formatARS(counts.devoluciones_anio)}
          icon="fas fa-undo-alt"
          link="/devoluciones/listado"
        />
        <SmallBox
          permission="ver_devoluciones"
          color="bg-secondary"
          title="Total devoluciones"
          value={counts.devoluciones || 0}
          icon="fas fa-list-ol"
          link="/devoluciones/listado"
        />
      </div>
      <div className="row">
        <SmallBox
          permission="ver_compras"
          color="bg-lightblue"
          title="Compras del día"
          value={formatARS(counts.compras_dia)}
          icon="fas fa-calendar-day"
          link="/compras/listado"
        />
        <SmallBox
          permission="ver_compras"
          color="bg-olive"
          title="Compras del mes"
          value={formatARS(counts.compras_mes)}
          icon="fas fa-calendar-alt"
          link="/compras/listado"
        />
        <SmallBox
          permission="ver_compras"
          color="bg-indigo"
          title="Compras del año"
          value={formatARS(counts.compras_anio)}
          icon="fas fa-calendar"
          link="/compras/listado"
        />
        <SmallBox
          permission="ver_compras"
          color="bg-pink"
          title="Inventario Valorizado"
          value={formatARS(counts.total_inventario)}
          icon="fas fa-boxes-stacked"
          link="/productos/listado"
        />
      </div>

      <hr />

      {/* SELECTOR DE MES */}
      <div className="row mt-4 mb-3 align-items-center">
        <div className="col-md-3">
          <label>
            <b>Analizar Mes:</b>
          </label>
          <select
            className="form-control shadow-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {mesesLabels.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BLOQUE GRÁFICOS 1 */}
      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card card-outline card-primary shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">Rendimiento Diario</h3>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                <Line
                  data={dataComparativa}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card card-outline card-danger shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">Estructura de Gastos</h3>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                <Doughnut
                  data={{
                    labels: charts.catGastos.map((g) => g.nombre),
                    datasets: [
                      {
                        data: charts.catGastos.map((g) => g.total),
                        backgroundColor: generateColors(
                          charts.catGastos.length
                        ),
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAPA DE CALOR HORARIO */}
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card card-outline card-warning shadow-sm border-warning">
            <div className="card-header">
              <h3 className="card-title text-bold">
                <i className="fas fa-bolt text-warning mr-2"></i>Mapa de Flujo:
                Ventas por Hora
              </h3>
            </div>
            <div className="card-body" style={{ height: "300px" }}>
              <Bar
                data={dataVentasHora}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE GRÁFICOS 2: CAJAS Y UTILIDAD */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-navy shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">Guerra de Cajas</h3>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                <Bar
                  data={{
                    labels: charts.ventasPorCaja.map(
                      (c) => `Caja ${c.caja_id}`
                    ),
                    datasets: [
                      {
                        label: "Total Ventas",
                        data: charts.ventasPorCaja.map((c) => c.total),
                        backgroundColor: "#605ca8",
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-info shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Evolución Utilidad Neta Real
              </h3>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                <Line
                  data={dataUtilidadNeta}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE GRÁFICOS 3: CATEGORÍAS */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-primary shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">Ventas por Categoría</h3>
            </div>
            <div className="card-body">
              <div style={{ height: "350px" }}>
                <Doughnut
                  data={{
                    labels: charts.catVentas.map((c) => c.nombre),
                    datasets: [
                      {
                        data: charts.catVentas.map((c) => c.total),
                        backgroundColor: generateColors(
                          charts.catVentas.length
                        ),
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-warning shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold text-dark">
                Ganancia Bruta por Categoría
              </h3>
            </div>
            <div className="card-body">
              <div style={{ height: "350px" }}>
                <Bar
                  data={dataGananciaCat}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { x: { stacked: true }, y: { stacked: true } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BALANCE ANUAL FINAL */}
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card card-outline card-success shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Balance Anual: Ingresos vs Egresos
              </h3>
            </div>
            <div className="card-body" style={{ height: "320px" }}>
              <Bar
                data={dataBalance}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
