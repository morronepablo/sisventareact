// src/pages/productos/SimuladorImpacto.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";
import { Bar } from "react-chartjs-2";

const SimuladorImpacto = () => {
  const [categorias, setCategorias] = useState([]);
  const [catSelected, setCatSelected] = useState("");
  const [porcentajeVenta, setPorcentajeVenta] = useState(5);
  const [porcentajeCosto, setPorcentajeCosto] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const simular = async () => {
    if (!catSelected)
      return Swal.fire("Atención", "Seleccioná una categoría", "warning");
    setLoading(true);
    try {
      const res = await api.get(
        `/productos/simulador-precios?categoria_id=${catSelected}&porcentaje_ajuste=${porcentajeVenta}&porcentaje_costo=${porcentajeCosto}`
      );
      setResultado(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAplicarPrecios = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Ejecutar Ajuste Real?",
      text: `Esta acción aplicará un ${porcentajeVenta}% de aumento al COSTO y recalculará los precios de venta según la ficha de cada producto.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffc107", // Color naranja igual que tu módulo masivo
      confirmButtonText: "SÍ, APLICAR AJUSTE",
      cancelButtonText: "Cancelar",
    });

    if (isConfirmed) {
      setLoading(true);
      try {
        // 🚀 LLAMAMOS A TU ENDPOINT EXISTENTE 🚀
        const res = await api.post("/productos/update-masivo", {
          categoria_id: catSelected,
          porcentaje: porcentajeVenta, // Tu backend espera "porcentaje"
        });

        if (res.data.success) {
          Swal.fire("¡Éxito!", res.data.message, "success");
          setResultado(null);
        }
      } catch (err) {
        Swal.fire(
          "Error",
          "No se pudo realizar la actualización masiva.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const formatARS = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  const chartData = resultado
    ? {
        labels: ["Utilidad Actual", "Utilidad Proyectada"],
        datasets: [
          {
            label: "Ganancia Mensual Est. ($)",
            data: [resultado.actual.utilidad, resultado.proyectado.utilidad],
            backgroundColor: [
              "#6c757d",
              parseFloat(resultado.proyectado.incremento_neto) >= 0
                ? "#28a745"
                : "#dc3545",
            ],
          },
        ],
      }
    : null;

  if (loading && !resultado) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3 pb-5">
      <h1 className="text-bold">
        <i className="fas fa-flask text-info mr-2"></i> Laboratorio de Precios
      </h1>
      <p className="text-muted">
        Simula el impacto de aumentos reales incluyendo ventas por unidad y
        combos.
      </p>
      <hr />

      <div className="row">
        <div className="col-md-4">
          <div className="card card-primary card-outline shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">Variables de Ajuste</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Seleccionar Categoría</label>
                <select
                  className="form-control"
                  value={catSelected}
                  onChange={(e) => setCatSelected(e.target.value)}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="text-danger">
                  Aumento del Proveedor (Costo %)
                </label>
                <input
                  type="number"
                  className="form-control border-danger"
                  value={porcentajeCosto}
                  onChange={(e) => setPorcentajeCosto(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-success">Tu Ajuste de Venta (%)</label>
                <input
                  type="number"
                  className="form-control border-success"
                  value={porcentajeVenta}
                  onChange={(e) => setPorcentajeVenta(e.target.value)}
                />
              </div>
              <button
                className="btn btn-info btn-block text-bold shadow"
                onClick={simular}
                disabled={loading}
              >
                {loading ? "Calculando..." : "SIMULAR IMPACTO"}
              </button>
            </div>
          </div>

          {resultado && (
            <div
              className={`card shadow ${
                parseFloat(resultado.proyectado.incremento_neto) < 0
                  ? "bg-danger"
                  : "bg-warning"
              }`}
            >
              <div className="card-body text-center">
                <h5 className="text-bold">RIESGO DE PÉRDIDA</h5>
                <h3 className="text-bold">
                  {resultado.proyectado.riesgo_cliente}%
                </h3>
                <p className="mb-0 small">
                  Estimación de fuga de clientes por el aumento.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-8">
          {resultado ? (
            <>
              <div className="row">
                <div className="col-md-6">
                  <div
                    className={`info-box shadow border-left ${
                      parseFloat(resultado.proyectado.incremento_neto) < 0
                        ? "border-danger"
                        : "border-success"
                    }`}
                  >
                    <span
                      className={`info-box-icon ${
                        parseFloat(resultado.proyectado.incremento_neto) < 0
                          ? "bg-danger"
                          : "bg-success"
                      }`}
                    >
                      <i className="fas fa-chart-line"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Impacto en Utilidad</span>
                      <span className="info-box-number text-xl">
                        {formatARS(resultado.proyectado.incremento_neto)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-box shadow">
                    <span className="info-box-icon bg-info">
                      <i className="fas fa-wallet"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">
                        Nueva Utilidad Mensual
                      </span>
                      <span className="info-box-number text-xl">
                        {formatARS(resultado.proyectado.utilidad)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow mt-2">
                <div className="card-body">
                  <div style={{ height: "250px" }}>
                    <Bar
                      data={chartData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                  <hr />
                  <div className="alert bg-dark text-white p-3 mb-0">
                    <h5>
                      <i className="fas fa-gavel text-warning mr-2"></i>
                      <b>Ejecutar Sentencia BI</b>
                    </h5>
                    <p>
                      Si la proyección es positiva, podés actualizar los precios
                      de toda la categoría ahora.
                    </p>
                    <button
                      className="btn btn-warning btn-block font-weight-bold shadow-sm"
                      onClick={handleAplicarPrecios}
                    >
                      <i className="fas fa-rocket mr-1"></i> APLICAR AUMENTO A
                      LA BASE DE DATOS
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card h-100 shadow d-flex align-items-center justify-content-center text-muted">
              <div className="text-center p-5">
                <i className="fas fa-microscope fa-5x mb-3 opacity-2"></i>
                <h4>Esperando simulación...</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimuladorImpacto;
