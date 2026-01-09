// src/pages/compras/informes/DetalleInformeProductos.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Componente para mostrar el detalle del informe de compras por productos
 * en un período determinado.
 *
 * @param {Object} searchParams - Parámetros de búsqueda que vienen de la URL
 * @param {Function} navigate - Función para navegar entre rutas
 * @param {String} desde - Fecha de inicio del período
 * @param {String} hasta - Fecha de fin del período
 *
 * @returns {JSX.Element} - Componente JSX con la información del informe
 */
/*******  5dd8fafc-b155-4915-be81-57303ab557ff  *******/ const DetalleInformeProductos =
  () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. URL DINÁMICA SEGÚN EL ENTORNO
    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://sistema-ventas-backend-3nn3.onrender.com";

    useEffect(() => {
      api
        .get(
          `/compras/informes/productos?fecha_inicio=${desde}&fecha_fin=${hasta}`
        )
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, [desde, hasta]);

    const totalGral = data.reduce(
      (acc, curr) => acc + parseFloat(curr.total),
      0
    );

    // 2. FUNCIÓN PARA GENERAR PDF CON TOKEN
    const handleGenerarPDF = () => {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/api/compras/informes/productos-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}&token=${token}`;
      window.open(url, "_blank");
    };

    if (loading) return <LoadingSpinner />;

    return (
      <div className="container bg-white p-4 mt-4 shadow rounded">
        <div className="text-center mb-4">
          <h1 className="text-primary">Informe de Compras por Productos</h1>
          <p className="text-muted">
            Período: {desde.split("-").reverse().join("/")} -{" "}
            {hasta.split("-").reverse().join("/")}
          </p>
        </div>

        <table className="table table-bordered table-striped">
          <thead className="table-primary text-center">
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Costo</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((p, i) => (
                <tr key={i}>
                  <td className="text-center">{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td className="text-center">{p.cantidad}</td>
                  <td className="text-center">{p.unidad || "-"}</td>
                  <td className="text-right">
                    ${" "}
                    {parseFloat(p.costo).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right">
                    ${" "}
                    {parseFloat(p.total).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay datos para este período.
                </td>
              </tr>
            )}
            <tr className="table-secondary font-weight-bold">
              <td colSpan="5" className="text-right">
                TOTAL GENERAL
              </td>
              <td className="text-right">
                ${" "}
                {totalGral.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center mt-4">
          {/* BOTÓN CORREGIDO */}
          <button className="btn btn-danger" onClick={handleGenerarPDF}>
            <i className="fas fa-file-pdf"></i> Generar PDF
          </button>
          <button
            className="btn btn-secondary ml-2"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-reply"></i> Volver
          </button>
        </div>
      </div>
    );
  };

export default DetalleInformeProductos;
