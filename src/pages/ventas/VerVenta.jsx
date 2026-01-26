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
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener venta y promociones simultáneamente
        const [ventaResponse, promosResponse] = await Promise.all([
          api.get(`/ventas/${id}`),
          api.get("/promociones").catch(() => ({ data: [] })), // Si falla, usar array vacío
        ]);

        setVenta(ventaResponse.data);
        setPromos(promosResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        navigate("/ventas/listado");
      }
    };
    fetchData();
  }, [id]);

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  // 🚀 FUNCIÓN PARA CALCULAR AHORRO POR PROMOCIÓN EN VISTA
  const calcularAhorroItem = (item) => {
    if (!item.producto_id) return 0; // Combos no tienen promociones

    const promo = promos.find(
      (p) => p.producto_id === item.producto_id && p.estado === 1,
    );
    if (!promo) return 0;

    const factor = parseFloat(item.factor_utilizado || 1);
    const multiplicador = item.es_bulto === 1 ? factor : 1;

    // Calcular precio unitario considerando factor de bulto
    let precioUnitario = parseFloat(item.precio_unitario || 0);
    const precioConFactor = precioUnitario * multiplicador;

    const cant = parseFloat(item.cantidad || 0);

    // Aplicar lógica de promoción
    if (promo.tipo === "3x2" && cant >= 3) {
      return Math.floor(cant / 3) * precioConFactor;
    }
    if (promo.tipo === "2da_al_70" && cant >= 2) {
      return Math.floor(cant / 2) * (precioConFactor * 0.7);
    }
    if (promo.tipo === "2da_al_50" && cant >= 2) {
      return Math.floor(cant / 2) * (precioConFactor * 0.5);
    }
    if (promo.tipo === "4x3" && cant >= 4) {
      return Math.floor(cant / 4) * precioConFactor;
    }
    return 0;
  };

  // 🚀 FUNCIÓN PARA CALCULAR SUBTOTAL CON PROMOCIÓN
  const calcularSubtotalConPromo = (item) => {
    const ahorro = calcularAhorroItem(item);

    // Usar el subtotal ya calculado (que incluye factor de bulto)
    const subtotalBase = parseFloat(item.subtotal || 0);

    return subtotalBase - ahorro;
  };

  // 🚀 CALCULAR TOTAL DE AHORRO POR PROMOCIONES
  const calcularAhorroTotal = () => {
    if (!venta || !venta.detalles) return 0;

    return venta.detalles.reduce((total, item) => {
      return total + calcularAhorroItem(item);
    }, 0);
  };

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

  const ahorroTotal = calcularAhorroTotal();

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
                {ahorroTotal > 0 && (
                  <div className="float-right">
                    <span className="badge badge-warning p-2">
                      <i className="fas fa-tag mr-1"></i>
                      AHORRO POR PROMOCIÓN: {formatMoney(ahorroTotal)}
                    </span>
                  </div>
                )}
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
                            <th>Descuento Promo</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {venta.detalles.map((d, i) => {
                            const ahorroItem = calcularAhorroItem(d);
                            const subtotalConPromo =
                              calcularSubtotalConPromo(d);

                            return (
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
                                    {ahorroItem > 0 && (
                                      <span className="badge badge-success ml-2">
                                        <i className="fas fa-tag mr-1"></i>
                                        PROMO
                                      </span>
                                    )}
                                  </div>
                                  {d.es_bulto === 1 && (
                                    <div className="text-info small font-weight-bold">
                                      <i className="fas fa-link mr-1"></i>
                                      Equivale a: {
                                        d.cantidad_unidades_base
                                      }{" "}
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
                                <td className="text-right align-middle">
                                  {ahorroItem > 0 ? (
                                    <span className="text-danger font-weight-bold">
                                      -{formatMoney(ahorroItem)}
                                    </span>
                                  ) : (
                                    <span className="text-muted">–</span>
                                  )}
                                </td>
                                <td className="text-right align-middle font-weight-bold text-success">
                                  {formatMoney(subtotalConPromo)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-light">
                          {/* FILA DE AHORRO TOTAL */}
                          {ahorroTotal > 0 && (
                            <tr className="text-bold bg-warning-light">
                              <td colSpan="5" className="text-right uppercase">
                                Ahorro Total por Promociones:
                              </td>
                              <td className="text-right text-danger font-weight-bold">
                                -{formatMoney(ahorroTotal)}
                              </td>
                              <td className="text-right"></td>
                            </tr>
                          )}

                          {/* FILA DE TOTALES */}
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
                            <td className="text-right uppercase">Total:</td>
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

                        {/* MOSTRAR DESCUENTOS SI EXISTEN */}
                        {(parseFloat(venta.descuento_porcentaje) > 0 ||
                          parseFloat(venta.descuento_monto) > 0) && (
                          <>
                            <hr />
                            <label className="text-muted small uppercase mb-1">
                              Descuentos Aplicados
                            </label>
                            <div className="small">
                              {parseFloat(venta.descuento_porcentaje) > 0 && (
                                <div className="text-danger">
                                  -{venta.descuento_porcentaje}% descuento
                                </div>
                              )}
                              {parseFloat(venta.descuento_monto) > 0 && (
                                <div className="text-danger">
                                  -{formatMoney(venta.descuento_monto)}{" "}
                                  descuento
                                </div>
                              )}
                            </div>
                          </>
                        )}

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
