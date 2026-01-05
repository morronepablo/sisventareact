// src/pages/ajustes/VerAjuste.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerAjuste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ajuste, setAjuste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAjuste = async () => {
      try {
        const response = await api.get(`/ajustes/${id}`);
        setAjuste(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar ajuste:", error);
        navigate("/ajustes/listado");
      }
    };
    fetchAjuste();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Detalles del Ajuste</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-8">
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-info text-bold">
                  Información del Ajuste
                </h3>
              </div>
              <div className="card-body">
                <dl className="row" style={{ fontSize: "1.1rem" }}>
                  <dt className="col-sm-4 text-secondary">Producto:</dt>
                  <dd className="col-sm-8 font-weight-bold">
                    {ajuste.producto_nombre}
                  </dd>

                  <dt className="col-sm-4 text-secondary">Tipo:</dt>
                  <dd className="col-sm-8">
                    <span
                      className={`badge ${
                        ajuste.tipo === "entrada"
                          ? "badge-success"
                          : "badge-danger"
                      }`}
                    >
                      {ajuste.tipo.toUpperCase()}
                    </span>
                  </dd>

                  <dt className="col-sm-4 text-secondary">Cantidad:</dt>
                  <dd className="col-sm-8 font-weight-bold">
                    {parseFloat(ajuste.cantidad).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </dd>

                  <dt className="col-sm-4 text-secondary">Motivo:</dt>
                  <dd className="col-sm-8 text-muted">{ajuste.motivo}</dd>

                  <dt className="col-sm-4 text-secondary">Fecha:</dt>
                  <dd className="col-sm-8">
                    {new Date(ajuste.fecha).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}{" "}
                    hs.
                  </dd>

                  <dt className="col-sm-4 text-secondary">Usuario:</dt>
                  <dd className="col-sm-8">{ajuste.usuario_nombre}</dd>
                </dl>

                <hr />
                <div className="mt-3">
                  <Link
                    to="/ajustes/listado"
                    className="btn btn-secondary shadow-sm"
                  >
                    <i className="fas fa-reply mr-1"></i> Volver al Listado
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerAjuste;
