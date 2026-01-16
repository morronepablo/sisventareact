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
  if (!orden) return <div className="p-4">Orden no encontrada.</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Detalle de Pedido OC-{String(id).padStart(6, "0")}</b>
            </h1>
          </div>
          <div className="col-sm-6 text-right">
            <button
              className="btn btn-secondary shadow-sm"
              onClick={() => navigate("/compras/ordenes")}
            >
              <i className="fas fa-reply mr-1"></i> Volver
            </button>
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-md-4">
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Información General</h3>
              </div>
              <div className="card-body">
                <p>
                  <b>Proveedor:</b> {orden.proveedor_nombre || "N/A"}
                </p>
                <p>
                  <b>Fecha de Pedido:</b>{" "}
                  {new Date(orden.fecha).toLocaleDateString()}
                </p>
                <p>
                  <b>Estado:</b>{" "}
                  <span
                    className={`badge ${
                      orden.estado === "Pendiente"
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {orden.estado}
                  </span>
                </p>
                <p>
                  <b>Observaciones:</b>
                  <br /> {orden.observaciones || "Sin notas"}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                <h3 className="card-title">Productos Solicitados</h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-striped m-0">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cant. Pedida</th>
                      <th className="text-center">Cant. Recibida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.producto_nombre}</td>
                        <td className="text-center">{it.cantidad_pedida}</td>
                        <td className="text-center">
                          <span
                            className={
                              it.cantidad_recibida < it.cantidad_pedida
                                ? "text-danger font-weight-bold"
                                : "text-success"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerOrdenCompra;
