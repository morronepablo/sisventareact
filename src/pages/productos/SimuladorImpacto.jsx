// src/pages/productos/SimuladorImpacto.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Bar } from "react-chartjs-2";

const SimuladorImpacto = () => {
  const [categorias, setCategorias] = useState([]);
  const [catSelected, setCatSelected] = useState("");
  const [porcentaje, setPorcentaje] = useState(5);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const simular = async () => {
    if (!catSelected) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/productos/simulador-precios?categoria_id=${catSelected}&porcentaje_ajuste=${porcentaje}`
      );
      setResultado(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
            backgroundColor: ["#6c757d", "#28a745"],
          },
        ],
      }
    : null;

  return (
    <div className="container-fluid pt-3 pb-5">
      <h1 className="text-bold">
        <i className="fas fa-vial text-info mr-2"></i> Laboratorio de Precios
      </h1>
      <p className="text-muted">
        Simula el impacto de un ajuste de precios antes de aplicarlo.
      </p>

      <div className="row">
        {/* PANEL DE CONTROL */}
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
                <label>Porcentaje de Cambio (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                />
                <small className="text-muted">
                  Use valores negativos para rebajas.
                </small>
              </div>
              <button
                className="btn btn-info btn-block text-bold"
                onClick={simular}
                disabled={loading}
              >
                {loading ? "Calculando..." : "SIMULAR IMPACTO"}
              </button>
            </div>
          </div>

          {resultado && (
            <div className="card bg-gradient-warning shadow">
              <div className="card-body text-center text-dark">
                <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
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

        {/* RESULTADOS */}
        <div className="col-md-8">
          {resultado ? (
            <>
              <div className="row">
                <div className="col-md-6">
                  <div className="info-box shadow">
                    <span className="info-box-icon bg-success">
                      <i className="fas fa-chart-line"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">
                        Incremento Mensual Est.
                      </span>
                      <span className="info-box-number text-xl text-success">
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
                  <div style={{ height: "300px" }}>
                    <Bar
                      data={chartData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card h-100 shadow d-flex align-items-center justify-content-center text-muted">
              <div className="text-center p-5">
                <i className="fas fa-microscope fa-5x mb-3 opacity-2"></i>
                <h4>Esperando simulación...</h4>
                <p>
                  Ajuste las variables y toque el botón para ver proyecciones.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimuladorImpacto;
