// src/pages/devoluciones/VerDevolucion.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerDevolucion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devolucion, setDevolucion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevolucion = async () => {
      try {
        const response = await api.get(`/devoluciones/${id}`);
        setDevolucion(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        navigate("/devoluciones/listado");
      }
    };
    fetchDevolucion();
  }, [id]);

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  if (loading) return <LoadingSpinner />;

  const totalCantidad = devolucion.detalles.reduce(
    (acc, d) => acc + parseFloat(d.cantidad),
    0
  );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Detalle de devolución</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-md-12">
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title">Datos registrados</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* TABLA DE ÍTEMS DEVUELTOS */}
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
                          {devolucion.detalles.map((d, i) => (
                            <tr key={i}>
                              <td className="text-center align-middle">
                                {i + 1}
                              </td>
                              <td className="text-center align-middle">
                                {d.producto_codigo ||
                                  d.combo_codigo ||
                                  "(Sin código)"}
                              </td>
                              <td className="text-right align-middle">
                                {d.cantidad}
                              </td>
                              <td className="text-left">
                                <span className="font-weight-bold">
                                  {d.producto_nombre || d.combo_nombre}
                                </span>
                                {d.componentes?.length > 0 && (
                                  <ul className="small mt-1 mb-0 text-muted">
                                    {d.componentes.map((c, idx) => (
                                      <li key={idx}>
                                        {c.nombre} ({c.cantidad} {c.unidad})
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </td>
                              <td className="text-right align-middle">
                                {formatMoney(d.precio_unitario)}
                              </td>
                              <td className="text-right align-middle font-weight-bold">
                                {formatMoney(d.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-light text-bold">
                          <tr>
                            <td colSpan="2" className="text-right">
                              Total Cantidad
                            </td>
                            <td className="text-right text-primary">
                              {totalCantidad}
                            </td>
                            <td colSpan="2" className="text-right">
                              Total Devolución
                            </td>
                            <td className="text-right text-primary">
                              {formatMoney(devolucion.precio_total)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* DATOS DE CABECERA */}
                  <div className="col-md-4">
                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label>
                          <small>Cliente</small>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light"
                          value={devolucion.nombre_cliente || ""}
                          disabled
                        />
                      </div>
                      <div className="col-md-6 form-group">
                        <label>
                          <small>C.U.I.T./D.N.I.</small>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light"
                          value={devolucion.cuil_codigo || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-5 form-group">
                        <label>
                          <small>Fecha de devolución</small>
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm bg-light"
                          value={
                            new Date(devolucion.fecha)
                              .toISOString()
                              .split("T")[0]
                          }
                          disabled
                        />
                      </div>
                      <div className="col-md-7 form-group">
                        <label>
                          <small>Comprobante *</small>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light text-center"
                          value={String(devolucion.id).padStart(8, "0")}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>
                        <small>Precio Total *</small>
                      </label>
                      <input
                        type="text"
                        className="form-control text-right bg-warning font-weight-bold"
                        value={formatMoney(devolucion.precio_total)}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <small>Motivo de la Devolución</small>
                      </label>
                      <textarea
                        className="form-control bg-light"
                        rows="3"
                        value={devolucion.motivo || ""}
                        disabled
                        placeholder="Sin motivo registrado"
                      ></textarea>
                    </div>
                  </div>
                </div>
                <hr />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/devoluciones/listado")}
                >
                  <i className="fas fa-reply mr-1"></i> Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerDevolucion;
