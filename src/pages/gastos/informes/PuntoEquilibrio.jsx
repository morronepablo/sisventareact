// src/pages/gastos/informes/PuntoEquilibrio.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const PuntoEquilibrio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/gastos/informes/punto-equilibrio")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Si la API falla o no hay datos
  if (!data || data.success === false) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger shadow-sm">
          <h5>
            <i className="fas fa-exclamation-circle"></i> Error en el servidor
          </h5>
          <p>
            No se pudo calcular el punto de equilibrio. Por favor, verifica que
            tengas ventas y gastos registrados.
          </p>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <i className="fas fa-scale-balanced mr-2"></i>
          <b>Calculadora de Punto de Equilibrio</b>
        </h1>
        <hr />

        <div className="row">
          {/* GASTOS TOTALES */}
          <div className="col-md-4">
            <div className="info-box shadow-sm">
              <span className="info-box-icon bg-danger">
                <i className="fas fa-file-invoice-dollar"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Gastos Totales del Mes
                </span>
                <span className="info-box-number h4">
                  {formatMoney(data.gastosTotales)}
                </span>
              </div>
            </div>
          </div>
          {/* MARGEN PROMEDIO */}
          <div className="col-md-4">
            <div className="info-box shadow-sm">
              <span className="info-box-icon bg-warning">
                <i className="fas fa-percentage"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Margen Bruto Promedio
                </span>
                <span className="info-box-number h4">
                  {data.margenPromedio}%
                </span>
              </div>
            </div>
          </div>
          {/* PUNTO DE EQUILIBRIO */}
          <div className="col-md-4">
            <div className="info-box shadow-sm bg-primary text-white">
              <span className="info-box-icon">
                <i className="fas fa-bullseye"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Punto de Equilibrio (Meta)
                </span>
                <span className="info-box-number h4">
                  {formatMoney(data.puntoEquilibrio)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-12">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-chart-line mr-2"></i>Estado de
                  Supervivencia del Negocio
                </h3>
              </div>
              <div className="card-body">
                <div className="row text-center mb-4">
                  <div className="col-md-4 border-right">
                    <h6 className="text-muted">Llevas Vendido</h6>
                    <h3 className="text-success font-weight-bold">
                      {formatMoney(data.ventasActuales)}
                    </h3>
                  </div>
                  <div className="col-md-4 border-right">
                    <h6 className="text-muted">
                      Falta Vender para cubrir gastos
                    </h6>
                    <h3 className="text-danger font-weight-bold">
                      {formatMoney(data.faltante)}
                    </h3>
                  </div>
                  <div className="col-md-4">
                    <h6 className="text-muted">Objetivo Alcanzado</h6>
                    <h3 className="text-primary font-weight-bold">
                      {data.porcentajeAlcanzado}%
                    </h3>
                  </div>
                </div>

                <div
                  className="progress mb-4"
                  style={{ height: "40px", borderRadius: "20px" }}
                >
                  <div
                    className={`progress-bar progress-bar-striped progress-bar-animated ${
                      data.porcentajeAlcanzado >= 100
                        ? "bg-success"
                        : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(data.porcentajeAlcanzado, 100)}%`,
                    }}
                  >
                    <span className="h5 mt-2">{data.porcentajeAlcanzado}%</span>
                  </div>
                </div>

                <div className="alert bg-light border p-4">
                  <h4 className="text-primary font-weight-bold">
                    <i className="fas fa-brain mr-2"></i> Diagnóstico BI
                  </h4>
                  <p className="lead">
                    Para cubrir tus gastos actuales de{" "}
                    <b>{formatMoney(data.gastosTotales)}</b>, con un margen de
                    ganancia del <b>{data.margenPromedio}%</b>, necesitás vender
                    un mínimo de <b>{formatMoney(data.puntoEquilibrio)}</b>.
                  </p>
                  <hr />
                  {data.faltante > 0 ? (
                    <h5 className="text-danger">
                      <i className="fas fa-exclamation-circle"></i> Todavía te
                      faltan <b>{formatMoney(data.faltante)}</b> de venta para
                      llegar al punto donde empezás a ganar dinero real.
                    </h5>
                  ) : (
                    <h5 className="text-success">
                      <i className="fas fa-trophy"></i> ¡Felicidades! Ya pasaste
                      el punto de equilibrio. Todo lo que vendas a partir de
                      ahora (descontando el costo de mercadería) es{" "}
                      <b>ganancia neta para tu bolsillo</b>.
                    </h5>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuntoEquilibrio;
