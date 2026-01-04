// src/pages/Dashboard.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCounts, fetchChartData } from "../services/dashboardService";
import LoadingSpinner from "../components/LoadingSpinner";
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
import { Bar, Line, Doughnut, PolarArea } from "react-chartjs-2";

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countsRes, chartsRes] = await Promise.all([
        fetchCounts(),
        fetchChartData(selectedMonth),
      ]);
      setCounts(countsRes);
      setCharts(chartsRes);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

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

  const formatARS = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  // --- COMPONENTES UI ---
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
        <div className="info-box zoomP shadow-sm">
          <Link to={link} className={`info-box-icon ${color}`}>
            <span>
              <i className={icon}></i>
            </span>
          </Link>
          <div className="info-box-content">
            <span
              className="info-box-text text-dark"
              style={{ fontWeight: "600" }}
            >
              {title}
            </span>
            <div className="d-flex justify-content-between align-items-baseline">
              <span
                className="info-box-number"
                style={{ fontSize: "1.1rem", fontWeight: "800" }}
              >
                {count || 0} <small className="text-muted">{label}</small>
              </span>
              {extraInfo}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SmallBox = ({ color, title, value, icon, link }) => (
    <div className="col-lg-3 col-6">
      <div className={`small-box ${color} shadow-sm zoomP`}>
        <div className="inner text-white">
          <h3>{value}</h3>
          <p
            style={{
              textTransform: "uppercase",
              fontSize: "0.8rem",
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

  // --- VALIDACIÓN DE CARGA ---
  if (loading || !charts) return <LoadingSpinner />;

  // --- PREPARACIÓN DE DATOS (Solo se ejecuta si charts no es null) ---
  const dataG9 = {
    labels: mesesLabels,
    datasets: [
      {
        label: "Ganancias por Mes",
        data: mesesLabels.map((_, i) =>
          charts.gananciasRaw
            .filter((r) => r.mes === i + 1)
            .reduce((acc, curr) => acc + parseFloat(curr.ganancia), 0)
        ),
        backgroundColor: "#3c8dbc",
      },
    ],
  };

  const dataG10 = {
    labels: mesesLabels,
    datasets: charts.categoriasLista.map((cat, idx) => ({
      label: cat,
      data: mesesLabels.map(
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
        .small-box { min-height: 145px; margin-bottom: 20px; } .small-box > .inner { padding: 10px; height: 110px; }
        .productos-scroll { height: 88px; overflow-y: auto; padding-right: 5px; }
        .productos-scroll::-webkit-scrollbar { width: 4px; } .productos-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
        .product-badge { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; }
        .zoomP { transition: transform .2s; } .zoomP:hover { transform: scale(1.02); }
      `}</style>

      <h1>
        <b>Bienvenido Admin</b>
      </h1>
      <hr />

      {/* FILAS 1-5 DE INDICADORES */}
      <div className="row">
        <InfoBox
          permission="ver_roles"
          link="/roles/listado"
          color="bg-info"
          icon="fas fa-user-check"
          title="Roles registrados"
          count={counts.roles}
          label="roles"
        />
        <InfoBox
          permission="ver_usuarios"
          link="/usuarios/listado"
          color="bg-primary"
          icon="fas fa-users"
          title="Usuarios registrados"
          count={counts.usuarios}
          label="usuarios"
        />
        <InfoBox
          permission="ver_categorias"
          link="/categorias/listado"
          color="bg-success"
          icon="fas fa-tags"
          title="Categorías registradas"
          count={counts.categorias}
          label="categorías"
        />
        <InfoBox
          permission="ver_unidades"
          link="/unidades/listado"
          color="bg-warning"
          icon="fas fa-weight-hanging"
          title="Unidades registradas"
          count={counts.unidades}
          label="unidades"
        />
        <InfoBox
          permission="ver_productos"
          link="/productos/listado"
          color="bg-danger"
          icon="fas fa-boxes"
          title="Productos registrados"
          count={counts.productos}
          label="productos"
        />
        <InfoBox
          permission="ver_proveedores"
          link="/proveedores/listado"
          color="bg-dark"
          icon="fas fa-truck"
          title="Proveedores registrados"
          count={counts.proveedores}
          label="proveedores"
          extraInfo={
            <span
              className="text-danger"
              style={{ fontWeight: "700", fontSize: "0.75rem" }}
            >
              Deuda: {formatARS(counts.proveedoresDeuda)}
            </span>
          }
        />
        <InfoBox
          permission="ver_compras"
          link="/compras/listado"
          color="bg-purple"
          icon="fas fa-shopping-cart"
          title="Compras registradas"
          count={counts.compras}
          label="compras"
          extraInfo={
            <span
              className="text-success"
              style={{ fontWeight: "700", fontSize: "0.75rem" }}
            >
              {counts.comprasAnio || 0} año actual
            </span>
          }
        />
        <InfoBox
          permission="ver_clientes"
          link="/clientes/listado"
          color="bg-secondary"
          icon="fas fa-user-friends"
          title="Clientes registrados"
          count={counts.clientes}
          label="clientes"
          extraInfo={
            <span
              className="text-danger"
              style={{ fontWeight: "700", fontSize: "0.75rem" }}
            >
              Deuda: {formatARS(counts.clientesDeuda)}
            </span>
          }
        />
        <InfoBox
          permission="ver_ventas"
          link="/ventas/listado"
          color="bg-orange"
          icon="fas fa-cash-register"
          title="Ventas registradas"
          count={counts.ventas}
          label="ventas"
          extraInfo={
            <span
              className="text-success"
              style={{ fontWeight: "700", fontSize: "0.75rem" }}
            >
              {counts.ventasAnio || 0} año actual
            </span>
          }
        />
        <InfoBox
          permission="ver_arqueos"
          link="/arqueos/listado"
          color="bg-pink"
          icon="fas fa-money-bill"
          title="Arqueos registrados"
          count={counts.arqueos}
          label="Arqueos"
          extraInfo={
            <span
              className="text-success"
              style={{ fontWeight: "700", fontSize: "0.75rem" }}
            >
              {counts.arqueosAnio || 0} año actual
            </span>
          }
        />
        <InfoBox
          permission="ver_combos"
          link="/combos/listado"
          color="bg-teal"
          icon="fas fa-volleyball-ball"
          title="Combos registrados"
          count={counts.combos}
          label="Combos"
        />
        <InfoBox
          permission="ver_empresa"
          link="/configuracion/empresa"
          color="bg-fuchsia"
          icon="fas fa-building"
          title="Empresas registradas"
          count={counts.empresas}
          label="Empresas"
        />
      </div>

      <div className="row mt-3">
        <SmallBox
          color="bg-info"
          title="Ventas del día"
          value={formatARS(counts.ventas_dia)}
          icon="fas fa-calendar-day"
          link="/ventas/listado"
        />
        <SmallBox
          color="bg-success"
          title="Ventas del mes"
          value={formatARS(counts.ventas_mes)}
          icon="fas fa-calendar-alt"
          link="/ventas/listado"
        />
        <SmallBox
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
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "85%",
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
                          : i === 2
                          ? "bg-warning text-dark"
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
              style={{ letterSpacing: "1px", fontSize: "0.8rem" }}
            >
              TOP MAS VENDIDOS{" "}
              <i className="fas fa-arrow-circle-right ml-1"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <SmallBox
          color="bg-primary"
          title="Ganancia del día"
          value={formatARS(counts.ganancia_dia)}
          icon="fas fa-calendar-day"
          link="/ventas/listado"
        />
        <SmallBox
          color="bg-warning"
          title="Ganancia del mes"
          value={formatARS(counts.ganancia_mes)}
          icon="fas fa-calendar-alt"
          link="/ventas/listado"
        />
        <SmallBox
          color="bg-teal"
          title="Ganancia del año"
          value={formatARS(counts.ganancia_anio)}
          icon="fas fa-calendar"
          link="/ventas/listado"
        />
        <SmallBox
          color="bg-maroon"
          title="Deuda general"
          value={formatARS(counts.clientesDeuda)}
          icon="fas fa-hand-holding-usd"
          link="/clientes/listado"
        />
      </div>

      <div className="row">
        <SmallBox
          color="bg-danger"
          title="Devoluciones del día"
          value={formatARS(counts.devoluciones_dia)}
          icon="fas fa-undo-alt"
          link="/devoluciones/listado"
        />
        <SmallBox
          color="bg-orange"
          title="Devoluciones del mes"
          value={formatARS(counts.devoluciones_mes)}
          icon="fas fa-undo-alt"
          link="/devoluciones/listado"
        />
        <SmallBox
          color="bg-dark"
          title="Devoluciones del año"
          value={formatARS(counts.devoluciones_anio)}
          icon="fas fa-undo-alt"
          link="/devoluciones/listado"
        />
        <SmallBox
          color="bg-secondary"
          title="Total devoluciones"
          value={counts.devoluciones || 0}
          icon="fas fa-list-ol"
          link="/devoluciones/listado"
        />
      </div>

      <div className="row">
        <SmallBox
          color="bg-lightblue"
          title="Compras del día"
          value={formatARS(counts.compras_dia)}
          icon="fas fa-calendar-day"
          link="/compras/listado"
        />
        <SmallBox
          color="bg-olive"
          title="Compras del mes"
          value={formatARS(counts.compras_mes)}
          icon="fas fa-calendar-alt"
          link="/compras/listado"
        />
        <SmallBox
          color="bg-indigo"
          title="Compras del año"
          value={formatARS(counts.compras_anio)}
          icon="fas fa-calendar"
          link="/compras/listado"
        />
        <SmallBox
          color="bg-pink"
          title="TOTAL INVENTARIO VALORIZADO"
          value={formatARS(counts.total_inventario)}
          icon="fas fa-boxes-stacked"
          link="/productos/listado"
        />
      </div>

      <div className="row mt-4 mb-3">
        <div className="col-md-3">
          <label>
            <b>Seleccionar Mes:</b>
          </label>
          <select
            className="form-control"
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

      {/* FILAS DE GRÁFICOS REPLICADAS */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-primary shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">Ganancias del Año</h3>
            </div>
            <div className="card-body">
              <Bar data={dataG9} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-primary shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Ganancias por Mes y Categoría
              </h3>
            </div>
            <div className="card-body">
              <Bar
                data={dataG10}
                options={{
                  scales: { x: { stacked: true }, y: { stacked: true } },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-warning shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Total cantidad de compras
              </h3>
            </div>
            <div className="card-body">
              <Line
                data={{
                  labels: mesesLabels,
                  datasets: [
                    {
                      label: "Compras",
                      data: charts.statsMensuales.map((s) => s.c_cant),
                      backgroundColor: "rgba(255, 193, 7, 0.2)",
                      borderColor: "#ffc107",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-success shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Total de compras monetizadas
              </h3>
            </div>
            <div className="card-body">
              <Bar
                data={{
                  labels: mesesLabels,
                  datasets: [
                    {
                      label: "Monto ($)",
                      data: charts.statsMensuales.map((s) => s.c_total),
                      backgroundColor: "#28a745",
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-primary shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">Total cantidad de ventas</h3>
            </div>
            <div className="card-body">
              <Line
                data={{
                  labels: mesesLabels,
                  datasets: [
                    {
                      label: "Ventas",
                      data: charts.statsMensuales.map((s) => s.v_cant),
                      backgroundColor: "rgba(0, 123, 255, 0.2)",
                      borderColor: "#007bff",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-purple shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Total de ventas monetizadas
              </h3>
            </div>
            <div className="card-body">
              <Bar
                data={{
                  labels: mesesLabels,
                  datasets: [
                    {
                      label: "Monto ($)",
                      data: charts.statsMensuales.map((s) => s.v_total),
                      backgroundColor: "#605ca8",
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-info shadow-sm text-center">
            <div className="card-header">
              <h3 className="card-title text-bold">Compras por Categoría</h3>
            </div>
            <div className="card-body">
              <div style={{ maxWidth: "350px", margin: "auto" }}>
                <Doughnut
                  data={{
                    labels: charts.catCompras.map((c) => c.nombre),
                    datasets: [
                      {
                        data: charts.catCompras.map((c) => c.total),
                        backgroundColor: generateColors(
                          charts.catCompras.length
                        ),
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-danger shadow-sm text-center">
            <div className="card-header">
              <h3 className="card-title text-bold">Ventas por Categoría</h3>
            </div>
            <div className="card-body">
              <div style={{ maxWidth: "350px", margin: "auto" }}>
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-success shadow-sm text-center">
            <div className="card-header">
              <h3 className="card-title text-bold">Compras Diarias (Monto)</h3>
            </div>
            <div className="card-body">
              <div style={{ maxWidth: "400px", margin: "auto" }}>
                <PolarArea
                  data={{
                    labels: charts.diarios.map((d) => `Día ${d.dia}`),
                    datasets: [
                      {
                        data: charts.diarios.map((d) => d.c_monto),
                        backgroundColor: generateColors(charts.diarios.length),
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card card-outline card-primary shadow-sm text-center">
            <div className="card-header">
              <h3 className="card-title text-bold">Ventas Diarias (Monto)</h3>
            </div>
            <div className="card-body">
              <div style={{ maxWidth: "400px", margin: "auto" }}>
                <PolarArea
                  data={{
                    labels: charts.diarios.map((d) => `Día ${d.dia}`),
                    datasets: [
                      {
                        data: charts.diarios.map((d) => d.v_monto),
                        backgroundColor: generateColors(charts.diarios.length),
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
