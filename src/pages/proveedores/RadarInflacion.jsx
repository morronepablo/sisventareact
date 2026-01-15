// src/pages/proveedores/RadarInflacion.jsx
/* eslint-disable no-unused-vars */
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
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-8">
          <h1>
            <i className="fas fa-chart-line text-danger mr-2"></i>
            <b>Radar Inflacionario</b>
          </h1>
          <p className="text-muted">
            Análisis de aumentos de costos por proveedor (Últimos 90 días).
          </p>
        </div>
      </div>
      <hr />

      <div className="row">
        {data.slice(0, 3).map((p, i) => (
          <div className="col-md-4" key={p.proveedor_id}>
            <div
              className={`small-box ${
                p.estado === "CRÍTICO" ? "bg-danger" : "bg-warning"
              } shadow`}
            >
              <div className="inner">
                <h3>{p.inflacion_promedio}%</h3>
                <p>
                  Aumento: <b>{p.proveedor_nombre}</b>
                </p>
              </div>
              <div className="icon">
                <i className="fas fa-fire"></i>
              </div>
              <div className="small-box-footer">
                Proveedor más agresivo #{i + 1}
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info">
              No hay datos suficientes para calcular variaciones (Se requieren
              al menos 2 compras del mismo producto).
            </div>
          </div>
        )}
      </div>

      <div className="card card-outline card-danger shadow-sm mt-3">
        <div className="card-header">
          <h3 className="card-title text-bold">
            <i className="fas fa-handshake-slash mr-2"></i>Ranking de Variación
            de Costos
          </h3>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="thead-dark text-center">
              <tr>
                <th>Proveedor</th>
                <th>Ítems Analizados</th>
                <th>Variación %</th>
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
                    </small>{" "}
                    {/* 👈 CORREGIDO AQUÍ */}
                  </td>
                  <td className="text-center align-middle">
                    {p.productos_analizados} productos
                  </td>
                  <td className="text-right align-middle font-weight-bold">
                    <span
                      className={
                        p.inflacion_promedio > 10
                          ? "text-danger"
                          : "text-success"
                      }
                    >
                      {p.inflacion_promedio > 0
                        ? `+${p.inflacion_promedio}%`
                        : `${p.inflacion_promedio}%`}
                      <i
                        className={`fas fa-arrow-${
                          p.inflacion_promedio > 0 ? "up" : "down"
                        } ml-1`}
                      ></i>
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span
                      className={`badge p-2 ${
                        p.estado === "CRÍTICO"
                          ? "badge-danger"
                          : p.estado === "ALERTA"
                          ? "badge-warning"
                          : "badge-success"
                      }`}
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
      </div>
    </div>
  );
};

export default RadarInflacion;
