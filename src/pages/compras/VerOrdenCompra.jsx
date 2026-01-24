// src/pages/compras/VerOrdenCompra.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerOrdenCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/ordenes-compra/${id}`)
      .then((res) => {
        setOrden(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!orden)
    return (
      <div className="p-4 h4 text-center text-muted">
        Orden de compra no encontrada.
      </div>
    );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="text-bold">
              <i className="fas fa-file-invoice text-info mr-2"></i>
              Detalle de Pedido OC-{String(id).padStart(6, "0")}
            </h1>
          </div>
          <div className="col-sm-6 text-right">
            <button
              className="btn btn-secondary shadow-sm"
              onClick={() => navigate("/compras/ordenes")}
            >
              <i className="fas fa-reply mr-1"></i> Volver al Listado
            </button>
          </div>
        </div>
        <hr />

        <div className="row">
          {/* PANEL DE INFORMACIÓN GENERAL */}
          <div className="col-md-4">
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Información del Pedido</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="text-muted small mb-0 uppercase">
                    Proveedor
                  </label>
                  <div className="h5 text-bold text-primary">
                    {orden.proveedor_nombre || "N/A"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="text-muted small mb-0 uppercase">
                      Fecha
                    </label>
                    <div>
                      {new Date(orden.fecha).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small mb-0 uppercase">
                      Estado
                    </label>
                    <br />
                    <span
                      className={`badge ${orden.estado === "Pendiente" ? "badge-warning" : "badge-success"} px-3 py-2`}
                    >
                      {orden.estado.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mb-0">
                  <label className="text-muted small mb-0 uppercase">
                    Observaciones
                  </label>
                  <p className="bg-light p-2 border rounded">
                    {orden.observaciones || "Sin notas adicionales."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL DE PRODUCTOS */}
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark">
                <h3 className="card-title text-bold">Productos Solicitados</h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-hover table-striped m-0">
                  <thead className="thead-light text-center">
                    <tr>
                      <th className="text-left" style={{ width: "40%" }}>
                        Producto
                      </th>
                      <th style={{ width: "20%" }}>Escala Pedida</th>
                      <th style={{ width: "20%" }}>Cant. Pedida</th>
                      <th style={{ width: "20%" }}>Cant. Recibida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.items.map((it) => (
                      <tr key={it.id}>
                        <td className="align-middle">
                          <div className="text-bold">{it.producto_nombre}</div>
                          {it.es_bulto === 1 && (
                            <small className="text-info font-weight-bold">
                              <i className="fas fa-boxes mr-1"></i>
                              Total Unidades: {it.cantidad_unidades_base}{" "}
                              {it.unidad_base_nombre}
                            </small>
                          )}
                        </td>
                        <td className="text-center align-middle">
                          {it.es_bulto === 1 ? (
                            <span className="badge badge-info px-2">
                              BULTO (x{parseFloat(it.factor_utilizado)})
                            </span>
                          ) : (
                            <span className="badge badge-light border text-muted">
                              UNIDAD
                            </span>
                          )}
                        </td>
                        <td className="text-center align-middle h5 font-weight-bold">
                          {it.cantidad_pedida}
                        </td>
                        <td className="text-center align-middle h5">
                          <span
                            className={
                              it.cantidad_recibida < it.cantidad_unidades_base
                                ? "text-danger font-weight-bold"
                                : "text-success font-weight-bold"
                            }
                          >
                            {it.cantidad_recibida || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-white border-top text-right">
                <span className="text-muted mr-2">
                  Total Estimado de la Orden:
                </span>
                <span className="h4 text-bold text-success">
                  ${" "}
                  {parseFloat(orden.total_estimado || 0).toLocaleString(
                    "es-AR",
                    { minimumFractionDigits: 2 },
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerOrdenCompra;
