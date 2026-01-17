// src/pages/ventas/VelocidadCaja.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VelocidadCaja = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/ventas/bi/velocidad-caja")
      .then((res) => {
        setData(res.data);
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
            <i className="fas fa-tachometer-alt text-primary mr-2"></i>
            <b>Semáforo de Velocidad de Caja</b>
          </h1>
          <p className="text-muted">
            Métricas de eficiencia en el punto de venta (Últimos 30 días).
          </p>
        </div>
      </div>
      <hr />

      <div className="row">
        {data.map((u, i) => (
          <div className="col-md-4" key={i}>
            <div className="card shadow-sm border-0">
              <div className={`card-header ${u.semaforo} text-white`}>
                <h3 className="card-title text-bold">{u.usuario_nombre}</h3>
                <span className="float-right badge badge-light text-dark">
                  {u.estado}
                </span>
              </div>
              <div className="card-body text-center">
                <div className="row">
                  <div className="col-6 border-right">
                    <h1 className={`font-weight-bold ${u.color}`}>
                      {u.promedio}s
                    </h1>
                    <p className="text-muted small uppercase">
                      Promedio x Ticket
                    </p>
                  </div>
                  <div className="col-6">
                    <h1 className="font-weight-bold text-dark">
                      {u.total_tickets}
                    </h1>
                    <p className="text-muted small uppercase">
                      Tickets Atendidos
                    </p>
                  </div>
                </div>
                <hr />
                <div className="d-flex justify-content-between px-3">
                  <small>
                    Récord: <b className="text-success">{u.ticket_record}s</b>
                  </small>
                  <small>
                    Más lento: <b className="text-danger">{u.ticket_lento}s</b>
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert bg-dark text-white mt-4 shadow-sm border-left-info">
        <h5>
          <i className="fas fa-bolt text-warning mr-2"></i>
          <b>Análisis de Productividad:</b>
        </h5>
        Un cajero rápido no solo mejora la experiencia del cliente, sino que
        permite procesar hasta un <b>40% más de ventas</b> en horas pico.
        <br />
        <b>Referencia:</b>{" "}
        <span className="text-success text-bold">Verde: 0-45s</span> |{" "}
        <span className="text-warning text-bold">Amarillo: 45-90s</span> |{" "}
        <span className="text-danger text-bold">Rojo: +90s</span>.
      </div>
    </div>
  );
};

export default VelocidadCaja;
