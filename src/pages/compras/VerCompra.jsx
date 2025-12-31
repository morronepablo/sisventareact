// src/pages/productos/VerCompra.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchCompra();
  }, [id]);

  if (loading)
    return (
      <div className="p-4 text-center">
        <h4>Cargando detalle...</h4>
      </div>
    );
  if (!compra) return <div className="p-4">Compra no encontrada.</div>;

  // Cálculos para el footer de la tabla
  const totalCantidad = compra.detalles?.reduce(
    (acc, d) => acc + parseFloat(d.cantidad),
    0
  );
  const totalCompraCalculado = compra.detalles?.reduce(
    (acc, d) => acc + d.cantidad * d.precio_compra,
    0
  );

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
        <div className="card card-outline card-info">
          <div className="card-header">
            <h3 className="card-title">Datos registrados</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* COLUMNA IZQUIERDA: TABLA DE PRODUCTOS */}
              <div className="col-md-8">
                <table className="table table-striped table-bordered table-hover table-sm">
                  <thead className="thead-dark">
                    <tr className="text-center">
                      <th>Nro.</th>
                      <th>Código</th>
                      <th>Cantidad</th>
                      <th>Producto</th>
                      <th>Costo</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compra.detalles?.map((detalle, index) => (
                      <tr key={detalle.id}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">
                          {detalle.producto_codigo}
                        </td>
                        <td className="text-right">{detalle.cantidad}</td>
                        <td>{detalle.producto_nombre}</td>
                        <td className="text-right">
                          ${" "}
                          {parseFloat(detalle.precio_compra).toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2 }
                          )}
                        </td>
                        <td className="text-right">
                          ${" "}
                          {(
                            detalle.cantidad * detalle.precio_compra
                          ).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan="2" className="text-right">
                        <b>Total Cantidad</b>
                      </td>
                      <td className="text-right text-primary">
                        <b>{totalCantidad}</b>
                      </td>
                      <td colSpan="2" className="text-right">
                        <b>Total Compra</b>
                      </td>
                      <td className="text-right text-primary">
                        <b>
                          ${" "}
                          {totalCompraCalculado.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </b>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* COLUMNA DERECHA: DATOS DE CABECERA */}
              <div className="col-md-4">
                <div className="form-group">
                  <label>Proveedor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={compra.proveedor_nombre || ""}
                    disabled
                  />
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-5">
                    <div className="form-group">
                      <label>Fecha de compra</label>
                      <input
                        type="date"
                        className="form-control"
                        value={compra.fecha.split("T")[0]}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className="form-group">
                      <label>Comprobante</label>
                      <input
                        type="text"
                        className="form-control"
                        value={compra.comprobante}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Precio Total</label>
                  <input
                    type="text"
                    className="form-control text-right bg-warning text-bold"
                    style={{ fontSize: "1.2rem" }}
                    value={`$ ${parseFloat(compra.precio_total).toLocaleString(
                      "es-AR",
                      { minimumFractionDigits: 2 }
                    )}`}
                    disabled
                  />
                </div>
              </div>
            </div>

            <hr />
            <div className="row">
              <div className="col-md-12">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/compras/listado")}
                >
                  <i className="fas fa-reply"></i> Volver
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
