// src/pages/unidades/VerUnidad.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

const VerUnidad = () => {
  const { id } = useParams();
  const [unidad, setUnidad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get(`/unidades/${id}`);
      setUnidad(res.data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="content-header">Cargando...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Ver Unidad</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Detalles</h3>
              </div>
              <div className="card-body">
                <p>
                  <strong>Nombre:</strong> {unidad.nombre}
                </p>
                <p>
                  <strong>Descripción:</strong> {unidad.descripcion || "–"}
                </p>
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/unidades/listado")}
                >
                  Volver al listado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerUnidad;
