// src/pages/compras/RecibirOrdenCompra.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const RecibirOrdenCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/ordenes-compra/${id}`)
      .then((res) => {
        const itemsEditados = res.data.items.map((it) => ({
          ...it,
          cantidad_llegó: it.cantidad_pedida,
        }));
        setOrden({ ...res.data, items: itemsEditados });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleConfirmar = async () => {
    const result = await Swal.fire({
      title: "¿Confirmar Recepción?",
      text: "Esto guardará las cantidades recibidas para auditar al proveedor. Recordá registrar la factura en el módulo de Compras para afectar stock y caja.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar conteo",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/ordenes-compra/${id}/recibir`, { items: orden.items });
        Swal.fire(
          "¡Auditado!",
          "Cantidades guardadas. La orden se marcó como recibida.",
          "success"
        );
        navigate("/compras/ordenes");
      } catch (error) {
        Swal.fire("Error", "No se pudo procesar la auditoría", "error");
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!orden)
    return <div className="p-4 text-center">Orden no encontrada.</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <i className="fas fa-clipboard-check mr-2 text-primary"></i>
              <b>Auditoría de Recepción</b>
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
        <p className="text-muted">
          Comparando pedido <b>OC-{String(id).padStart(6, "0")}</b> de{" "}
          <b>{orden.proveedor_nombre}</b>
        </p>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  ¿Qué llegó en el camión?
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-striped table-hover m-0">
                  <thead className="bg-light text-center">
                    <tr>
                      <th className="text-left">Producto</th>
                      <th>Cantidad Pedida</th>
                      <th style={{ width: "200px" }}>Cantidad Real Recibida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.items.map((it, index) => (
                      <tr key={it.id}>
                        <td className="align-middle">
                          <b>{it.producto_nombre}</b>
                        </td>
                        <td className="text-center align-middle h5">
                          <span className="badge badge-secondary">
                            {it.cantidad_pedida}
                          </span>
                        </td>
                        <td className="align-middle">
                          <input
                            type="number"
                            className="form-control text-center font-weight-bold border-primary"
                            style={{ fontSize: "1.2rem" }}
                            value={it.cantidad_llegó}
                            onChange={(e) => {
                              const newItems = [...orden.items];
                              newItems[index].cantidad_llegó = e.target.value;
                              setOrden({ ...orden, items: newItems });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-white border-top">
                <button
                  className="btn btn-primary float-right btn-lg shadow"
                  onClick={handleConfirmar}
                >
                  <i className="fas fa-save mr-2"></i> FINALIZAR AUDITORÍA DE
                  PEDIDO
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecibirOrdenCompra;
