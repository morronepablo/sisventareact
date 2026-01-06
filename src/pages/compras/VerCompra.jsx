// src/pages/compras/VerCompra.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompra = async () => {
    try {
      const res = await api.get(`/compras/${id}`);
      setCompra(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar la compra", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompra();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!compra)
    return (
      <div className="p-4 text-center">
        <h4>Compra no encontrada.</h4>
      </div>
    );

  // --- CÁLCULOS SEGUROS PARA EL FOOTER ---
  const totalCantidad = compra.detalles?.reduce(
    (acc, d) => acc + Number(d.cantidad || 0),
    0
  );

  const totalCompraCalculado = compra.detalles?.reduce(
    (acc, d) => acc + Number(d.cantidad || 0) * Number(d.precio_compra || 0),
    0
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Detalle de compra</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-info shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-bold">Datos registrados</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* TABLA DE PRODUCTOS */}
              <div className="col-md-8">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered table-hover table-sm">
                    <thead className="thead-dark text-center">
                      <tr>
                        <th>Nro.</th>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Producto</th>
                        <th>Costo</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compra.detalles?.map((detalle, index) => {
                        const costo = Number(detalle.precio_compra || 0);
                        const cant = Number(detalle.cantidad || 0);
                        return (
                          <tr key={detalle.id || index}>
                            <td className="text-center align-middle">
                              {index + 1}
                            </td>
                            <td className="text-center align-middle">
                              {detalle.producto_codigo}
                            </td>
                            <td className="text-center align-middle">{cant}</td>
                            <td className="align-middle">
                              {detalle.producto_nombre}
                            </td>
                            <td className="text-right align-middle">
                              {formatMoney(costo)}
                            </td>
                            <td className="text-right align-middle font-weight-bold">
                              {formatMoney(cant * costo)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-light text-bold">
                      <tr>
                        <td colSpan="2" className="text-right">
                          Total Cantidad
                        </td>
                        <td className="text-center text-primary">
                          {totalCantidad}
                        </td>
                        <td colSpan="2" className="text-right">
                          Total Compra
                        </td>
                        <td className="text-right text-primary">
                          {formatMoney(compra.precio_total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* DATOS DE CABECERA */}
              <div className="col-md-4">
                <div className="form-group">
                  <label className="text-muted">
                    <small>Proveedor</small>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light font-weight-bold"
                    value={compra.proveedor_nombre || "N/A"}
                    disabled
                  />
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-5">
                    <div className="form-group">
                      <label className="text-muted">
                        <small>Fecha</small>
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light text-center"
                        value={new Date(compra.fecha).toLocaleDateString(
                          "es-AR"
                        )}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className="form-group">
                      <label className="text-muted">
                        <small>Comprobante</small>
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light text-center"
                        value={compra.comprobante}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-muted">
                    <small>Precio Total *</small>
                  </label>
                  <input
                    type="text"
                    className="form-control text-right bg-warning font-weight-bold"
                    style={{ fontSize: "1.3rem" }}
                    value={formatMoney(compra.precio_total)}
                    disabled
                  />
                </div>
              </div>
            </div>

            <hr />
            <div className="row">
              <div className="col-md-12">
                <button
                  className="btn btn-secondary btn-sm shadow-sm"
                  onClick={() => navigate("/compras/listado")}
                >
                  <i className="fas fa-reply mr-1"></i> Volver al listado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCompra;
