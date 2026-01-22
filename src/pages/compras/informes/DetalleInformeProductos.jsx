// src/pages/compras/informes/DetalleInformeProductos.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeProductos = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  useEffect(() => {
    // Sincronización con el endpoint que ahora agrupa por Producto + Proveedor + Costo Real
    api
      .get(
        `/compras/informes/productos?fecha_inicio=${desde}&fecha_fin=${hasta}`,
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando reporte:", err);
        setLoading(false);
      });
  }, [desde, hasta]);

  const totalGral = data.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

  const handleGenerarPDF = () => {
    const token = localStorage.getItem("token");
    const url = `${API_URL}/api/compras/informes/productos-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}&token=${token}`;
    window.open(url, "_blank");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3 pb-5">
      <div className="card shadow-lg border-0">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="text-primary text-bold text-uppercase">
              Informe de Compras Detallado
            </h2>
            <h5 className="text-muted">Análisis por Producto y Proveedor</h5>
            <div
              className="badge badge-info px-3 py-2 mt-2"
              style={{ fontSize: "1rem" }}
            >
              Período: {desde.split("-").reverse().join("/")} —{" "}
              {hasta.split("-").reverse().join("/")}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-bordered table-striped">
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "12%" }}>CÓDIGO</th>
                  <th style={{ width: "25%" }}>PRODUCTO</th>
                  <th style={{ width: "20%" }}>PROVEEDOR</th>
                  <th style={{ width: "8%" }}>CANT.</th>
                  <th style={{ width: "10%" }}>UNIDAD</th>
                  <th style={{ width: "12%" }}>COSTO UNIT.</th>
                  <th style={{ width: "13%" }}>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.length > 0 ? (
                  data.map((p, i) => (
                    <tr key={i}>
                      <td className="text-center align-middle font-weight-bold">
                        {p.codigo}
                      </td>
                      <td className="align-middle">
                        <div
                          className="text-bold text-uppercase"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {p.nombre}
                        </div>
                        <div className="mt-1">
                          {/* BADGE DEL PROVEEDOR: Información de origen directa */}
                          <span
                            className="badge badge-info shadow-sm"
                            style={{ fontSize: "0.7rem", fontWeight: "500" }}
                          >
                            <i className="fas fa-truck mr-1"></i>
                            {p.proveedor_nombre}
                          </span>
                        </div>
                      </td>
                      <td className="align-middle text-primary font-weight-bold">
                        {p.proveedor}
                      </td>
                      <td className="text-center align-middle h6">
                        {p.cantidad}
                      </td>
                      <td className="text-center align-middle">
                        {p.unidad || "-"}
                      </td>
                      <td className="text-right align-middle font-italic">
                        ${" "}
                        {parseFloat(p.costo).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-right align-middle font-weight-bold bg-light">
                        ${" "}
                        {parseFloat(p.total).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No hay datos registrados en este rango de fechas.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-primary text-white">
                  <td
                    colSpan="6"
                    className="text-right text-bold py-3 uppercase"
                  >
                    TOTAL INVERTIDO EN PRODUCTOS
                  </td>
                  <td
                    className="text-right text-bold py-3"
                    style={{ fontSize: "1.2rem" }}
                  >
                    ${" "}
                    {totalGral.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

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
        * Este informe agrupa compras por producto, proveedor y precio unitario
        abonado.
      </p>
    </div>
  );
};

export default DetalleInformeProductos;
