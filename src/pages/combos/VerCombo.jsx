// src/pages/combos/VerCombo.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerCombo = () => {
  const { id } = useParams();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCombo();
  }, [id]);

  const fetchCombo = async () => {
    try {
      const res = await api.get(`/combos/${id}`);
      setCombo(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar el combo:", error);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!combo)
    return <div className="p-5 text-center">Combo no encontrado.</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              Detalles del Combo: <b>{combo.nombre}</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            {/* Replicando el Callout Info de AdminLTE */}
            <div
              className="card shadow-sm border-left-info"
              style={{ borderLeft: "5px solid #117a8b" }}
            >
              <div className="card-header bg-white">
                <h3 className="card-title text-info font-weight-bold">
                  <i className="fas fa-info-circle mr-2"></i> Datos Registrados
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p style={{ fontSize: "1.1rem" }}>
                      <strong>Código:</strong>{" "}
                      <span className="text-muted">{combo.codigo}</span>
                    </p>
                    <p style={{ fontSize: "1.1rem" }}>
                      <strong>Nombre:</strong>{" "}
                      <span className="text-muted">{combo.nombre}</span>
                    </p>
                    <p style={{ fontSize: "1.1rem" }}>
                      <strong>Precio Venta:</strong>{" "}
                      <span
                        className="badge badge-success p-2"
                        style={{ fontSize: "1rem" }}
                      >
                        ${" "}
                        {parseFloat(combo.precio_venta).toLocaleString(
                          "es-AR",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                <hr />
                <h4 className="mb-3 text-secondary">Productos en el Combo</h4>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover">
                    <thead className="thead-light">
                      <tr className="text-center">
                        <th className="text-left">Producto</th>
                        <th style={{ width: "150px" }}>Cantidad en Combo</th>
                        <th style={{ width: "150px" }}>Stock Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combo.productos.map((prod, index) => (
                        <tr key={index}>
                          <td>{prod.nombre}</td>
                          <td className="text-center font-weight-bold">
                            {prod.cantidad} {prod.unidad || "Unidades"}
                          </td>
                          <td
                            className={`text-center ${
                              prod.stock <= 0 ? "text-danger" : ""
                            }`}
                          >
                            {prod.stock}
                          </td>
                        </tr>
                      ))}
                      {combo.productos.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">
                            No hay productos vinculados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <hr />
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between mt-3">
                    <Link
                      to="/combos/listado"
                      className="btn btn-secondary shadow-sm"
                    >
                      <i className="fas fa-reply mr-2"></i> Volver
                    </Link>
                    <Link
                      to={`/combos/editar/${combo.id}`}
                      className="btn btn-success shadow-sm"
                    >
                      <i className="fas fa-edit mr-2"></i> Editar Combo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCombo;
