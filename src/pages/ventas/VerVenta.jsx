// src/pages/ventas/VerVenta.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerVenta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenta = async () => {
      try {
        const response = await api.get(`/ventas/${id}`);
        setVenta(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        navigate("/ventas/listado");
      }
    };
    fetchVenta();
  }, [id]);

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  if (loading)
    return <div className="p-5 text-center">Cargando detalle de venta...</div>;

  const totalCantidad = venta.detalles.reduce(
    (acc, d) => acc + parseFloat(d.cantidad),
    0
  );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Detalle de venta</b>
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
                  {/* COLUMNA IZQUIERDA: TABLA DE PRODUCTOS */}
                  <div className="col-md-8">
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
                        {venta.detalles.map((d, i) => (
                          <tr key={i}>
                            <td className="text-center">{i + 1}</td>
                            <td className="text-center">
                              {d.producto_codigo ||
                                d.combo_codigo ||
                                "(Sin código)"}
                            </td>
                            <td className="text-right">{d.cantidad}</td>
                            <td className="text-left">
                              {d.producto_nombre || d.combo_nombre}
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
                            <td className="text-right">
                              {formatMoney(d.precio_unitario)}
                            </td>
                            <td className="text-right">
                              {formatMoney(d.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="text-bold">
                          <td colSpan="2" className="text-right">
                            Total Cantidad
                          </td>
                          <td className="text-right text-primary">
                            {totalCantidad}
                          </td>
                          <td colSpan="2" className="text-right">
                            Total Compra
                          </td>
                          <td className="text-right text-primary">
                            {formatMoney(venta.precio_total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* COLUMNA DERECHA: DATOS CLIENTE Y VENTA */}
                  <div className="col-md-4">
                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label>Cliente</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={venta.nombre_cliente || ""}
                          disabled
                        />
                      </div>
                      <div className="col-md-6 form-group">
                        <label>C.U.I.T./D.N.I.</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={venta.cuil_codigo || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4 form-group">
                        <label>Fecha</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={new Date(venta.fecha).toLocaleDateString(
                            "es-AR"
                          )}
                          disabled
                        />
                      </div>
                      <div className="col-md-8 form-group">
                        <label>Comprobante</label>
                        <input
                          type="text"
                          className="form-control bg-light text-center"
                          value={`T ${String(venta.id).padStart(8, "0")}`}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Precio Total *</label>
                      <input
                        type="text"
                        className="form-control text-right bg-warning font-weight-bold"
                        value={formatMoney(venta.precio_total)}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/ventas/listado")}
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

export default VerVenta;
