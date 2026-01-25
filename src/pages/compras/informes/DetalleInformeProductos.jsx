// src/pages/compras/informes/DetalleInformeProductos.jsx - REEMPLAZA completamente
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeProductos = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const [data, setData] = useState({
    compras: [],
    periodo: {},
    total_compras: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedFacturas, setExpandedFacturas] = useState({});

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  useEffect(() => {
    api
      .get(
        `/compras/informes/productos?fecha_inicio=${desde}&fecha_fin=${hasta}`,
      )
      .then((res) => {
        console.log("📊 Datos recibidos:", res.data);
        setData(res.data);
        setLoading(false);

        // Expandir automáticamente todas las facturas
        const initialExpanded = {};
        res.data.compras.forEach((compra, index) => {
          initialExpanded[compra.compra_id] = true; // Expandir todas por defecto
        });
        setExpandedFacturas(initialExpanded);
      })
      .catch((err) => {
        console.error("Error cargando reporte:", err);
        setLoading(false);
      });
  }, [desde, hasta]);

  const handleGenerarPDF = () => {
    const token = localStorage.getItem("token");
    const url = `${API_URL}/api/compras/informes/productos-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}&token=${token}`;
    window.open(url, "_blank");
  };

  const toggleFactura = (compraId) => {
    setExpandedFacturas((prev) => ({
      ...prev,
      [compraId]: !prev[compraId],
    }));
  };

  const calcularTotalGeneral = () => {
    return data.compras.reduce(
      (total, compra) => total + compra.total_factura,
      0,
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3 pb-5">
      <div className="card shadow-lg border-0">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="text-primary text-bold text-uppercase">
              Informe Detallado de Compras
            </h2>
            <h5 className="text-muted">Análisis por Factura y Producto</h5>
            <div
              className="badge badge-info px-3 py-2 mt-2"
              style={{ fontSize: "1rem" }}
            >
              Período: {desde.split("-").reverse().join("/")} —{" "}
              {hasta.split("-").reverse().join("/")}
            </div>
            <div className="mt-2">
              <span className="badge badge-success mr-2">
                {data.total_compras} Facturas
              </span>
              <span className="badge badge-warning">
                Total: ${" "}
                {calcularTotalGeneral().toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {data.compras.length === 0 ? (
            <div className="alert alert-info text-center">
              <i className="fas fa-info-circle mr-2"></i>
              No hay compras registradas en este período
            </div>
          ) : (
            data.compras.map((compra, compraIndex) => (
              <div key={compra.compra_id} className="card mb-4 border-primary">
                <div
                  className="card-header bg-primary text-white d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleFactura(compra.compra_id)}
                >
                  <div>
                    <h5 className="mb-0">
                      <i
                        className={`fas fa-${expandedFacturas[compra.compra_id] ? "minus" : "plus"} mr-2`}
                      ></i>
                      FACTURA {compraIndex + 1}
                    </h5>
                    <div className="mt-1 small">
                      <span className="mr-3">
                        <i className="far fa-calendar mr-1"></i>{" "}
                        {compra.fecha_compra}
                      </span>
                      <span className="mr-3">
                        <i className="fas fa-file-invoice mr-1"></i>{" "}
                        {compra.numero_factura}
                      </span>
                      <span>
                        <i className="fas fa-truck mr-1"></i>{" "}
                        {compra.proveedor_nombre}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span
                      className="badge badge-light"
                      style={{ fontSize: "1.1rem" }}
                    >
                      ${" "}
                      {compra.total_factura.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {expandedFacturas[compra.compra_id] && (
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered mb-0">
                        <thead className="thead-dark text-center">
                          <tr>
                            <th style={{ width: "5%" }}>#</th>
                            <th style={{ width: "35%" }}>PRODUCTO</th>
                            <th style={{ width: "10%" }}>CANT.</th>
                            <th style={{ width: "12%" }}>UNIDAD</th>
                            <th style={{ width: "15%" }}>COSTO UNIT.</th>
                            <th style={{ width: "15%" }}>SUBTOTAL</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {compra.items.map((item, itemIndex) => {
                            const esBulto = item.es_bulto;
                            const factor = item.factor_utilizado || 1;
                            const precioPorUnidad =
                              item.precio_por_unidad ||
                              item.precio_unitario_mostrar;

                            return (
                              <tr key={itemIndex}>
                                <td className="text-center align-middle">
                                  {itemIndex + 1}
                                </td>
                                <td className="align-middle">
                                  <div
                                    className="font-weight-bold"
                                    style={{ fontSize: "0.9rem" }}
                                  >
                                    {item.codigo}
                                  </div>
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    {item.producto_nombre}
                                  </div>
                                </td>
                                <td className="text-center align-middle">
                                  <div className="font-weight-bold h6">
                                    {item.cantidad}
                                    {esBulto && factor > 1 && (
                                      <div className="small text-info">
                                        (×{factor})
                                      </div>
                                    )}
                                  </div>
                                  {esBulto && (
                                    <div className="small text-success">
                                      {(item.cantidad * factor).toFixed(0)}{" "}
                                      unid. total
                                    </div>
                                  )}
                                </td>
                                <td className="text-center align-middle">
                                  <span
                                    className={
                                      esBulto ? "badge badge-warning" : ""
                                    }
                                  >
                                    {item.unidad_mostrar}
                                  </span>
                                  {esBulto && (
                                    <div className="small mt-1">
                                      <div className="text-danger font-weight-bold">
                                        BULTO
                                      </div>
                                      <div className="text-success">
                                        ${precioPorUnidad.toFixed(2)}/unidad
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="text-right align-middle">
                                  <div className="font-italic">
                                    ${" "}
                                    {item.precio_unitario_mostrar.toLocaleString(
                                      "es-AR",
                                      {
                                        minimumFractionDigits: 2,
                                      },
                                    )}
                                  </div>
                                  {esBulto ? (
                                    <div className="small text-muted">
                                      por bulto
                                    </div>
                                  ) : (
                                    <div className="small text-muted">
                                      por unidad
                                    </div>
                                  )}
                                </td>
                                <td className="text-right align-middle font-weight-bold bg-light">
                                  ${" "}
                                  {item.subtotal.toLocaleString("es-AR", {
                                    minimumFractionDigits: 2,
                                  })}
                                  <div className="small text-muted">
                                    {esBulto ? (
                                      <>
                                        {item.cantidad} bultos × $
                                        {item.precio_unitario_mostrar.toFixed(
                                          2,
                                        )}
                                        /bulto
                                      </>
                                    ) : (
                                      <>
                                        {item.cantidad} × $
                                        {item.precio_unitario_mostrar.toFixed(
                                          2,
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-light">
                            <td
                              colSpan="5"
                              className="text-right font-weight-bold"
                            >
                              TOTAL FACTURA:
                            </td>
                            <td
                              className="text-right font-weight-bold text-primary"
                              style={{ fontSize: "1.1rem" }}
                            >
                              ${" "}
                              {compra.total_factura.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {data.compras.length > 0 && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="alert alert-success text-center">
                  <h4 className="mb-0">
                    TOTAL GENERAL DEL PERÍODO: ${" "}
                    {calcularTotalGeneral().toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </h4>
                </div>
              </div>
            </div>
          )}

          <div className="row mt-4">
            <div className="col-12 text-center">
              <button
                className="btn btn-danger btn-lg shadow-sm mr-3"
                onClick={handleGenerarPDF}
              >
                <i className="fas fa-file-pdf mr-2"></i>Exportar a PDF
              </button>
              <button
                className="btn btn-outline-secondary btn-lg shadow-sm"
                onClick={() => navigate(-1)}
              >
                <i className="fas fa-arrow-left mr-2"></i>Volver
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-muted mt-3 small">
        * Este informe agrupa las compras por factura, mostrando cada producto
        comprado con su tipo (bulto o unidad)
      </p>
    </div>
  );
};

export default DetalleInformeProductos;
