// src/pages/gastos/VerGasto.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerGasto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gasto, setGasto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/gastos/${id}`)
      .then((res) => {
        setGasto(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!gasto) return <div className="p-3">Gasto no encontrado.</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Detalle del Gasto</b>
        </h1>
        <hr />
        <div className="card card-outline card-info shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Información del Comprobante</h3>
            <button
              className="btn btn-secondary btn-sm float-right"
              onClick={() => navigate("/gastos/listado")}
            >
              <i className="fas fa-reply"></i> Volver al listado
            </button>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 border-right">
                <p>
                  <b>Fecha y Hora:</b>{" "}
                  {new Date(gasto.fecha).toLocaleString("es-AR")}
                </p>
                <p>
                  <b>Categoría:</b>{" "}
                  <span className="badge badge-info">
                    {gasto.categoria_nombre}
                  </span>
                </p>
                <p>
                  <b>Descripción:</b> {gasto.descripcion}
                </p>
              </div>
              <div className="col-md-6 pl-4">
                <p>
                  <b>Monto Registrado:</b> <br />
                  <span className="text-danger h3 font-weight-bold">
                    - ${" "}
                    {parseFloat(gasto.monto).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </p>
                <p>
                  <b>Método de Pago:</b>{" "}
                  <span className="text-capitalize">{gasto.metodo_pago}</span>
                </p>
                <p>
                  <b>Usuario que registró:</b> {gasto.usuario_nombre}
                </p>
                {gasto.arqueo_id && (
                  <p className="text-muted small">
                    ID de Arqueo vinculado: #{gasto.arqueo_id}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="card-footer bg-white text-muted small">
            Gasto registrado el{" "}
            {new Date(gasto.created_at || gasto.fecha).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerGasto;
