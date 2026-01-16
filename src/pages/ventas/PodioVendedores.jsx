// src/pages/ventas/PodioVendedores.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const PodioVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/ventas/bi/podio-vendedores")
      .then((res) => {
        setVendedores(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  // Separamos el Top 3
  const oro = vendedores[0];
  const plata = vendedores[1];
  const bronce = vendedores[2];
  const resto = vendedores.slice(3);

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-6">
          <h1>
            <i className="fas fa-trophy text-warning mr-2"></i>
            <b>Podio de Vendedores</b>
          </h1>
          <p className="text-muted">Ranking de productividad del mes actual.</p>
        </div>
      </div>
      <hr />

      {/* 🚀 EL PODIO VISUAL 🚀 */}
      <div className="row d-flex align-items-end justify-content-center mb-5 mt-4">
        {/* PLATA (#2) */}
        {plata && (
          <div className="col-md-3 text-center animate__animated animate__fadeInUp animate__delay-1s">
            <div
              className="p-3 bg-light border shadow-sm mb-2"
              style={{
                borderRadius: "15px 15px 0 0",
                borderBottom: "5px solid #C0C0C0 !important",
              }}
            >
              <i
                className="fas fa-medal fa-3x"
                style={{ color: "#C0C0C0" }}
              ></i>
              <h4 className="mt-2 font-weight-bold">{plata.usuario_nombre}</h4>
              <span className="badge badge-secondary">
                {formatMoney(plata.total_monto)}
              </span>
            </div>
            <div className="bg-secondary p-2 text-white">#2 PLATA</div>
          </div>
        )}

        {/* ORO (#1) */}
        {oro && (
          <div className="col-md-4 text-center animate__animated animate__bounceInDown">
            <div
              className="p-4 bg-white border shadow-lg mb-2"
              style={{
                borderRadius: "20px 20px 0 0",
                borderBottom: "8px solid #FFD700 !important",
                transform: "scale(1.1)",
                zIndex: 10,
              }}
            >
              <i className="fas fa-crown fa-5x text-warning"></i>
              <h2 className="mt-2 font-weight-bold text-dark">
                {oro.usuario_nombre}
              </h2>
              <h4 className="text-success font-weight-bold">
                {formatMoney(oro.total_monto)}
              </h4>
              <small className="text-muted">Líder en ventas del mes</small>
            </div>
            <div className="bg-warning p-3 text-dark font-weight-bold h4">
              #1 CAMPEÓN
            </div>
          </div>
        )}

        {/* BRONCE (#3) */}
        {bronce && (
          <div className="col-md-3 text-center animate__animated animate__fadeInUp animate__delay-2s">
            <div
              className="p-3 bg-light border shadow-sm mb-2"
              style={{
                borderRadius: "15px 15px 0 0",
                borderBottom: "5px solid #CD7F32 !important",
              }}
            >
              <i
                className="fas fa-medal fa-3x"
                style={{ color: "#CD7F32" }}
              ></i>
              <h4 className="mt-2 font-weight-bold">{bronce.usuario_nombre}</h4>
              <span className="badge badge-info">
                {formatMoney(bronce.total_monto)}
              </span>
            </div>
            <div
              className="p-2 text-white"
              style={{ backgroundColor: "#CD7F32" }}
            >
              #3 BRONCE
            </div>
          </div>
        )}
      </div>

      {/* MÉTRICAS DETALLADAS */}
      <div className="card card-outline card-primary shadow-sm">
        <div className="card-header">
          <h3 className="card-title text-bold">
            Analítica de Rendimiento Individual
          </h3>
        </div>
        <div className="card-body p-0">
          <table className="table table-striped table-hover m-0 text-center">
            <thead className="thead-dark">
              <tr>
                <th>Vendedor</th>
                <th>Total Facturado</th>
                <th>Tickets</th>
                <th>Ticket Promedio</th>
                <th>Eficiencia (Items/Venta)</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((v, i) => (
                <tr key={i}>
                  <td className="text-left px-4">
                    {i < 3 ? (
                      <i className="fas fa-star text-warning mr-2"></i>
                    ) : null}
                    <b>{v.usuario_nombre}</b>
                  </td>
                  <td className="text-bold text-primary">
                    {formatMoney(v.total_monto)}
                  </td>
                  <td>{v.cantidad_ventas}</td>
                  <td>
                    <span className="badge badge-success p-2">
                      {formatMoney(v.ticket_promedio)}
                    </span>
                  </td>
                  <td>
                    <b className="text-info">
                      {(parseFloat(v.items_promedio) || 0).toFixed(2)}
                    </b>{" "}
                    ítems/cli
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

export default PodioVendedores;
