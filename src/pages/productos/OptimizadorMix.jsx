// src/pages/productos/OptimizadorMix.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const OptimizadorMix = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para el DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/productos/analitica-bcg");
        setData(res.data);
      } catch (err) {
        console.error("Error cargando BCG", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Función para asignar colores según categoría
  const getColor = (categoria) => {
    switch (categoria) {
      case "ESTRELLA":
        return "rgba(255, 193, 7, 0.8)"; // Amarillo/Oro
      case "VACA LECHERA":
        return "rgba(0, 123, 255, 0.8)"; // Azul
      case "INCÓGNITA":
        return "rgba(23, 162, 184, 0.8)"; // Teal/Cian
      case "PERRO":
        return "rgba(108, 117, 125, 0.8)"; // Gris
      default:
        return "rgba(0, 0, 0, 0.5)";
    }
  };

  const chartData = {
    datasets: [
      {
        label: "Productos",
        data: data.productos.map((p) => ({
          x: parseFloat(p.rotacion),
          y: parseFloat(p.margen),
          r: Math.min(parseFloat(p.valor_stock) / 1000, 25), // Tamaño burbuja por capital
          nombre: p.nombre,
          categoria: p.categoria,
          stock: p.valor_stock,
        })),
        // MAGIA DE COLORES: Mapeamos cada burbuja a su color de categoría
        backgroundColor: data.productos.map((p) => getColor(p.categoria)),
        borderColor: data.productos.map((p) =>
          getColor(p.categoria).replace("0.8", "1"),
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: "Margen de Ganancia (%)",
          font: { weight: "bold" },
        },
        min: 0,
        suggestedMax: 100,
      },
      x: {
        title: {
          display: true,
          text: "Rotación (Ventas 30 días)",
          font: { weight: "bold" },
        },
        min: 0,
      },
    },
    plugins: {
      legend: { display: false }, // Ocultamos leyenda porque los colores ya dicen mucho
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const p = ctx.raw;
            return [
              `Producto: ${p.nombre}`,
              `Categoría: ${p.categoria}`,
              `Rotación: ${p.x} un.`,
              `Margen: ${p.y}%`,
              `Capital Inmovilizado: $${parseFloat(p.stock).toLocaleString("es-AR")}`,
            ];
          },
        },
      },
    },
  };

  // Lógica de Filtrado y Paginación del DataTable
  const filteredActionPlan = data.productos
    .filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.categoria === "PERRO" ? -1 : 1)); // Priorizamos mostrar Perros e Incógnitas

  const totalPages = Math.ceil(filteredActionPlan.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredActionPlan.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-3">
        <div className="col-sm-6">
          <h1 className="m-0 text-bold">
            <i className="fas fa-chart-pie text-primary mr-2"></i>
            Optimizador de Mix de Ventas (BCG)
          </h1>
        </div>
      </div>

      <div className="row">
        {/* GRÁFICO ESTRATÉGICO COLORIZADO */}
        <div className="col-lg-8">
          <div className="card card-outline card-primary shadow">
            <div className="card-header border-0">
              <h3 className="card-title text-bold">
                Mapa Estratégico de Portfolio
              </h3>
            </div>
            <div className="card-body">
              <div style={{ height: "450px" }}>
                <Bubble data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* LEYENDA Y DIAGNÓSTICO */}
        <div className="col-lg-4">
          <div className="card card-dark shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Diagnóstico del Consultor
              </h3>
            </div>
            <div className="card-body p-0">
              {[
                {
                  cat: "ESTRELLAS",
                  color: "warning",
                  desc: "Protege estos productos. Asegura stock y estabilidad.",
                },
                {
                  cat: "VACAS LECHERAS",
                  color: "primary",
                  desc: "Tus ganchos. Úsalos para atraer tráfico al local.",
                },
                {
                  cat: "INCÓGNITAS",
                  color: "info",
                  desc: "Tienen margen pero no rotan. ¡Hacé combos ya!",
                },
                {
                  cat: "PERROS",
                  color: "secondary",
                  desc: "Peligro de capital muerto. Liquidar y reinvertir.",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 border-bottom bg-light">
                  <span className={`badge badge-${item.color} px-2 mb-1`}>
                    {item.cat}
                  </span>
                  <p className="small mb-0 text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DATATABLE CON PAGINACIÓN */}
      <div className="card shadow mt-3">
        <div className="card-header bg-navy d-flex justify-content-between align-items-center">
          <h3 className="card-title text-bold">Plan de Acción Sugerido</h3>
          <div className="card-tools">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="card-body p-0 table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead>
              <tr className="text-sm">
                <th>Producto</th>
                <th className="text-center">Categoría</th>
                <th>Acción Recomendada</th>
                <th className="text-center">Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => (
                <tr key={p.id}>
                  <td className="align-middle text-bold">{p.nombre}</td>
                  <td className="text-center align-middle">
                    <span
                      className={`badge shadow-sm px-2 py-1 bg-${getColor(p.categoria).includes("255, 193, 7") ? "warning" : getColor(p.categoria).includes("0, 123, 255") ? "primary" : getColor(p.categoria).includes("23, 162, 184") ? "info" : "secondary"}`}
                    >
                      {p.categoria}
                    </span>
                  </td>
                  <td className="align-middle">
                    {p.categoria === "PERRO" &&
                      "Liquidación agresiva / Descontinuar"}
                    {p.categoria === "INCÓGNITA" &&
                      "Promoción en Redes / Crear Combo"}
                    {p.categoria === "ESTRELLA" &&
                      "Mantenimiento de stock crítico"}
                    {p.categoria === "VACA LECHERA" &&
                      "Producto gancho: Publicitar precio"}
                  </td>
                  <td className="text-center align-middle">
                    <span
                      className={`text-bold ${p.categoria === "PERRO" || p.categoria === "ESTRELLA" ? "text-danger" : "text-muted"}`}
                    >
                      <i
                        className={`fas fa-arrow-${p.categoria === "PERRO" || p.categoria === "ESTRELLA" ? "up" : "right"} mr-1`}
                      ></i>
                      {p.categoria === "PERRO" || p.categoria === "ESTRELLA"
                        ? "ALTA"
                        : "MEDIA"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* PAGINACIÓN */}
        <div className="card-footer clearfix bg-white">
          <ul className="pagination pagination-sm m-0 float-right">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                &laquo;
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                &raquo;
              </button>
            </li>
          </ul>
          <span className="small text-muted">
            Mostrando {currentItems.length} de {filteredActionPlan.length}{" "}
            registros
          </span>
        </div>
      </div>
    </div>
  );
};

export default OptimizadorMix;
