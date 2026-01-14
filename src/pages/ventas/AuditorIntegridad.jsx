// src/pages/ventas/AuditorIntegridad.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const AuditorIntegridad = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auditoria/integridad")
      .then((res) => setDatos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <h1 className="text-bold">
        <i className="fas fa-user-shield text-navy mr-2"></i> Auditoría de
        Integridad de Tickets
      </h1>
      <p className="text-muted">
        Detección de patrones sospechosos y prevención de robo interno.
      </p>

      <div className="card card-outline card-navy shadow">
        <div className="card-header">
          <h3 className="card-title text-bold">
            Ranking de Riesgo por Operador
          </h3>
        </div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead className="bg-navy">
              <tr className="text-center">
                <th>Usuario</th>
                <th>Nivel de Riesgo</th>
                <th>Items Borrados del Carrito</th>
                <th>Tickets en $0</th>
                <th>Descuentos {">"} 20%</th>
                <th>Puntaje Incidencia</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((u, i) => (
                <tr key={i}>
                  <td className="align-middle">
                    <b>{u.usuario}</b>
                  </td>
                  <td className="text-center align-middle">
                    <span
                      className={`badge badge-${u.color} p-2 px-3`}
                      style={{ fontSize: "0.9rem" }}
                    >
                      {u.riesgo}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span className="text-bold">{u.borrados}</span> <br />
                    <small className="text-danger">
                      ($ {parseFloat(u.monto_borrados).toLocaleString()})
                    </small>
                  </td>
                  <td className="text-center align-middle text-bold">
                    {u.tickets_cero}
                  </td>
                  <td className="text-center align-middle text-bold">
                    {u.descuentos_altos}
                  </td>
                  <td className="text-center align-middle">
                    <div className="progress progress-xs">
                      <div
                        className={`progress-bar bg-${u.color}`}
                        style={{ width: `${Math.min(u.puntos, 100)}%` }}
                      ></div>
                    </div>
                    <small>{u.puntos} pts</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <i className="fas fa-info-circle mr-1"></i> El sistema asigna puntos
          por cada acción inusual. Un puntaje alto sugiere revisar cámaras.
        </div>
      </div>
    </div>
  );
};

export default AuditorIntegridad;
