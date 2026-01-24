// src/pages/ventas/VerVenta.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

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
      minimumFractionDigits: 2,
    }).format(val || 0);

  if (loading) return <LoadingSpinner />;
  if (!venta)
    return (
      <div className="p-5 text-center">
        <h4>Venta no encontrada.</h4>
      </div>
    );

  // --- CÁLCULOS SINCERADOS PARA EL FOOTER ---
  const totalUnidadesBase = venta.detalles.reduce(
    (acc, d) => acc + parseFloat(d.cantidad_unidades_base || d.cantidad || 0),
    0,
  );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="text-bold">
              <i className="fas fa-file-invoice-dollar text-success mr-2"></i>
              Detalle de venta
            </h1>
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-md-12">
            <div className="card card-outline card-success shadow-lg">
              <div className="card-header border-0">
                <h3 className="card-title text-bold text-uppercase">
                  Tique T-{String(id).padStart(8, "0")}
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* COLUMNA IZQUIERDA: TABLA DE PRODUCTOS */}
                  <div className="col-md-8">
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered table-hover table-sm">
                        <thead className="thead-dark text-center text-xs">
                          <tr>
                            <th>Nro.</th>
                            <th>Código</th>
                            <th style={{ width: "15%" }}>Cantidad</th>
                            <th>Producto / Escala</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {venta.detalles.map((d, i) => (
                            <tr key={i}>
                              <td className="text-center align-middle">
                                {i + 1}
                              </td>
                              <td className="text-center align-middle small">
                                {d.producto_codigo || d.combo_codigo || "–"}
                              </td>
                              <td className="text-center align-middle font-weight-bold h6">
                                {d.cantidad}
                                <small className="ml-1 text-muted text-uppercase">
                                  {d.es_bulto === 1
                                    ? d.unidad_bulto_nombre || "Bultos"
                                    : d.unidad_base_nombre || "Unid."}
                                </small>
                              </td>
                              <td className="align-middle">
                                <div className="text-bold text-uppercase">
                                  {d.producto_nombre || d.combo_nombre}
                                </div>
                                {d.es_bulto === 1 && (
                                  <div className="text-info small font-weight-bold">
                                    <i className="fas fa-link mr-1"></i>
                                    Equivale a: {d.cantidad_unidades_base}{" "}
                                    {d.unidad_base_nombre}
                                  </div>
                                )}
                                {d.componentes?.length > 0 && (
                                  <ul className="small mt-1 mb-0 text-muted list-unstyled">
                                    {d.componentes.map((c, idx) => (
                                      <li key={idx}>
                                        <i className="fas fa-caret-right mr-1"></i>
                                        {c.nombre} ({c.cantidad} {c.unidad})
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </td>
                              <td className="text-right align-middle text-muted">
                                {formatMoney(d.precio_unitario)}
                              </td>
                              <td className="text-right align-middle font-weight-bold text-success">
                                {formatMoney(d.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-light">
                          <tr className="text-bold">
                            <td colSpan="2" className="text-right uppercase">
                              Bultos/Items:
                            </td>
                            <td className="text-center text-primary">
                              {venta.detalles.length}
                            </td>
                            <td className="text-right uppercase">
                              Volumen Base Neto:
                            </td>
                            <td className="text-center text-info">
                              {totalUnidadesBase}
                            </td>
                            <td
                              className="text-right text-success"
                              style={{ fontSize: "1.2rem" }}
                            >
                              {formatMoney(venta.precio_total)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: DATOS CLIENTE Y CABECERA */}
                  <div className="col-md-4">
                    <div className="card bg-light shadow-none border">
                      <div className="card-body p-3">
                        <label className="text-muted small uppercase mb-1">
                          Cliente
                        </label>
                        <div className="h6 text-bold text-navy mb-0">
                          {venta.nombre_cliente || "CONSUMIDOR FINAL"}
                        </div>
                        <small className="text-muted">
                          DNI/CUIT: {venta.cuil_codigo || "00000000"}
                        </small>

                        <hr />

                        <div className="row">
                          <div className="col-6">
                            <label className="text-muted small uppercase mb-1">
                              Fecha
                            </label>
                            <div className="text-bold">
                              {new Date(venta.fecha).toLocaleDateString(
                                "es-AR",
                              )}
                            </div>
                          </div>
                          <div className="col-6 text-right">
                            <label className="text-muted small uppercase mb-1">
                              Tipo
                            </label>
                            <div className="text-bold">TIQUE VENTA</div>
                          </div>
                        </div>

                        <hr />

                        <label className="text-muted small uppercase mb-1">
                          Total Cobrado
                        </label>
                        <div className="bg-navy p-3 rounded text-center shadow-sm">
                          <span
                            className="h2 text-bold mb-0"
                            style={{ color: "#00f2fe" }}
                          >
                            {formatMoney(venta.precio_total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-block shadow-sm mt-3"
                      onClick={() => navigate("/ventas/listado")}
                    >
                      <i className="fas fa-reply mr-2"></i> VOLVER AL LISTADO
                    </button>
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

export default VerVenta;
