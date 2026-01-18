// src/pages/proveedores/RadarInflacion.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const RadarInflacion = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/proveedores/bi/radar-inflacion")
      .then((res) => {
        // 🚀 FILTRO BI: Solo permitimos proveedores con aumentos reales (> 0)
        const inflacionReal = res.data.filter(
          (p) => parseFloat(p.inflacion_promedio) > 0,
        );
        setData(inflacionReal);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-8">
          <h1>
            <i className="fas fa-fire-alt text-danger mr-2"></i>
            <b>Radar Inflacionario</b>
          </h1>
          <p className="text-muted">
            Detección de aumentos de costos (Solo proveedores con variaciones
            positivas).
          </p>
        </div>
      </div>
      <hr />

      {/* 📊 INDICADORES DE IMPACTO (SMALL BOXES) */}
      <div className="row">
        {data.length > 0 ? (
          data.slice(0, 3).map((p, i) => (
            <div className="col-md-4" key={p.proveedor_id}>
              <div
                className={`small-box ${p.estado === "CRÍTICO" ? "bg-danger" : "bg-warning"} shadow`}
              >
                <div className="inner">
                  <h3>{p.inflacion_promedio}%</h3>
                  <p>
                    Aumento: <b>{p.proveedor_nombre}</b>
                  </p>
                </div>
                <div className="icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="small-box-footer">
                  Proveedor más agresivo #{i + 1}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-success shadow-sm border-0">
              <h5>
                <i className="fas fa-check-circle mr-2"></i>
                <b>Mercado Estable:</b>
              </h5>
              No se detectaron aumentos de precios en los proveedores analizados
              durante los últimos 90 días.
            </div>
          </div>
        )}
      </div>

      {/* 📈 RANKING SI HAY DATOS */}
      {data.length > 0 && (
        <div className="card card-outline card-danger shadow-sm mt-3">
          <div className="card-header">
            <h3 className="card-title text-bold text-danger">
              <i className="fas fa-exclamation-triangle mr-2"></i>Ranking de
              Impacto en Costos
            </h3>
          </div>
          <div className="card-body p-0">
            <table className="table table-hover table-striped m-0">
              <thead className="thead-dark text-center">
                <tr>
                  <th>Proveedor</th>
                  <th>Ítems con Alza</th>
                  <th>Variación Promedio</th>
                  <th>Estado</th>
                  <th>Última Factura</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.proveedor_id}>
                    <td className="align-middle px-3">
                      <b>{p.proveedor_nombre}</b>
                      <br />
                      <small className="text-muted">
                        Contacto: {p.contacto}
                      </small>
                    </td>
                    <td className="text-center align-middle">
                      {p.productos_analizados} productos
                    </td>
                    <td className="text-right align-middle font-weight-bold">
                      <span className="text-danger">
                        +{p.inflacion_promedio}%
                        <i className="fas fa-arrow-up ml-1"></i>
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge p-2 shadow-sm ${p.estado === "CRÍTICO" ? "badge-danger" : "badge-warning"}`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      {new Date(p.ultima_factura).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer bg-white">
            <small className="text-muted font-italic">
              * El sistema ignora automáticamente a los proveedores que
              mantuvieron sus precios estables.
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarInflacion;
