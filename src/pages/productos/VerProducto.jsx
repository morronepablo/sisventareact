// src/pages/productos/VerProducto.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VerProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [historiaPrecios, setHistoriaPrecios] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  const fetchData = async () => {
    try {
      const [resProd, resHist] = await Promise.all([
        api.get(`/productos/${id}`),
        api.get(`/productos/${id}/historial-precios`),
      ]);

      setProducto(resProd.data);
      setHistoriaPrecios(resHist.data);
    } catch (error) {
      console.error("Error al cargar datos del producto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!producto) return <div className="p-3">Producto no encontrado.</div>;

  const formatFecha = (fecha) => {
    if (!fecha || fecha === "0000-00-00") return "Sin fecha";
    return fecha.split("T")[0];
  };

  const getColorForStock = (stock, stockMinimo) => {
    const diferencia = stock - stockMinimo;
    if (diferencia <= 0) {
      return {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
        color: "rgb(200, 0, 0)",
      };
    } else if (diferencia <= 10) {
      return {
        backgroundColor: "rgba(233, 231, 16, 0.15)",
        color: "rgb(180, 160, 0)",
      };
    } else {
      return {
        backgroundColor: "rgba(0, 255, 0, 0.15)",
        color: "rgb(0, 150, 0)",
      };
    }
  };

  // --- 📊 CONFIGURACIÓN DEL GRÁFICO (VENTA VS COSTO) 📊 ---
  const dataChart = {
    labels: historiaPrecios.map((h) => h.fecha),
    datasets: [
      {
        label: "Precio de Venta ($)",
        data: historiaPrecios.map((h) => h.precio),
        borderColor: "#28a745", // Verde
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "#28a745",
        pointRadius: 5,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Costo de Compra ($)", // 👈 NUEVA LÍNEA DE COSTO
        data: historiaPrecios.map((h) => h.costo),
        borderColor: "#dc3545", // Rojo
        backgroundColor: "transparent",
        borderWidth: 3,
        pointBackgroundColor: "#dc3545",
        pointRadius: 5,
        fill: false,
        tension: 0.4,
        borderDash: [5, 5], // Línea punteada para diferenciar del PVP
      },
    ],
  };

  const optionsChart = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `$ ${value.toLocaleString("es-AR")}`,
        },
      },
    },
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1 className="mb-3">
          <b>Detalle del Producto</b>
        </h1>

        <div className="card card-outline card-info shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-info text-bold">
              Datos Registrados
            </h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-4 form-group">
                    <label>Categoría</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.categoria_nombre}
                      disabled
                    />
                  </div>
                  <div className="col-md-4 form-group">
                    <label>Código</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.codigo}
                      disabled
                    />
                  </div>
                  <div className="col-md-4 form-group">
                    <label>Producto</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.nombre}
                      disabled
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3 form-group">
                    <label>Nombre Corto</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.nombre_corto || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Unidad Medida</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.unidad_nombre}
                      disabled
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Descripción</label>
                    <textarea
                      className="form-control bg-light"
                      rows="1"
                      value={producto.descripcion || ""}
                      disabled
                    ></textarea>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-2 form-group">
                    <label>Stock Actual</label>
                    <input
                      type="text"
                      className="form-control"
                      value={producto.stock}
                      disabled
                      style={{
                        ...getColorForStock(
                          producto.stock,
                          producto.stock_minimo
                        ),
                        fontWeight: "bold",
                      }}
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Precio Compra</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={`$ ${parseFloat(
                        producto.precio_compra
                      ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
                      disabled
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Precio Venta</label>
                    <input
                      type="text"
                      className="form-control bg-light font-weight-bold text-primary"
                      value={`$ ${parseFloat(
                        producto.precio_venta
                      ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
                      disabled
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Fecha Ingreso</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={formatFecha(producto.fecha_ingreso)}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 text-center border-left">
                <label className="d-block text-muted small">
                  Imagen del Producto
                </label>
                {producto.imagen ? (
                  <img
                    src={
                      producto.imagen.startsWith("http")
                        ? producto.imagen
                        : `${API_URL}${producto.imagen}`
                    }
                    alt={producto.nombre}
                    className="img-fluid rounded shadow-sm border p-1 bg-white"
                    style={{ maxHeight: "180px", objectFit: "contain" }}
                  />
                ) : (
                  <div
                    className="border d-flex align-items-center justify-content-center bg-light rounded"
                    style={{ height: "160px" }}
                  >
                    <span className="text-muted small">SIN IMAGEN</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card card-outline card-success shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-success text-bold">
                  <i className="fas fa-chart-line mr-2"></i> Evolución
                  Histórica: Margen vs Inflación
                </h3>
              </div>
              <div className="card-body">
                {historiaPrecios.length > 0 ? (
                  <div style={{ height: "350px", position: "relative" }}>
                    <Line data={dataChart} options={optionsChart} />
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-info-circle text-muted fa-2x mb-2"></i>
                    <p className="text-muted">
                      No se han registrado variaciones para este producto
                      todavía.
                    </p>
                  </div>
                )}
              </div>
              <div className="card-footer bg-white">
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">
                      * El gráfico muestra cómo evoluciona tu precio de venta
                      respecto al costo que te cobra el proveedor.
                    </small>
                  </div>
                  <div className="col-md-6 text-right">
                    <span className="badge badge-success mr-2">
                      ● Precio Venta
                    </span>
                    <span
                      className="badge badge-danger"
                      style={{
                        border: "1px dashed #dc3545",
                        backgroundColor: "transparent",
                        color: "#dc3545",
                      }}
                    >
                      - - Costo Compra
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary shadow-sm"
          >
            <i className="fas fa-reply"></i> Volver al listado
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerProducto;
