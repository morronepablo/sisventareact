// src/pages/compras/informes/DetalleInformeNoPagadas.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeNoPagadas = () => {
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
    api
      .get(`/compras/informes/no-pagadas`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalFacturado = data.reduce(
    (acc, curr) => acc + parseFloat(curr.precio_total || 0),
    0
  );
  const totalDeuda = data.reduce(
    (acc, curr) => acc + parseFloat(curr.deuda || 0),
    0
  );

  const handleGenerarPDF = () => {
    const token = localStorage.getItem("token");
    const url = `${API_URL}/api/compras/informes/no-pagadas-pdf?token=${token}`;
    window.open(url, "_blank");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container bg-white p-4 mt-4 shadow rounded">
      <div className="text-center mb-4">
        <h1 className="text-danger">Informe de Compras no Pagadas</h1>
        <p className="text-muted">Listado de facturas con saldo pendiente</p>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark text-center">
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Comprobante</th>
            <th>Precio Total</th>
            <th>Deuda</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, i) => (
              <tr key={i}>
                <td className="text-center">{item.id}</td>
                <td className="text-center">
                  {new Date(item.fecha).toLocaleDateString("es-AR")}
                </td>
                <td>{item.proveedor}</td>
                <td className="text-center">{item.comprobante}</td>
                <td className="text-right">
                  ${" "}
                  {parseFloat(item.precio_total || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="text-right text-danger font-weight-bold">
                  ${" "}
                  {parseFloat(item.deuda || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay facturas pendientes de pago.
              </td>
            </tr>
          )}
          <tr className="table-secondary font-weight-bold">
            <td colSpan="4" className="text-right">
              TOTALES
            </td>
            <td className="text-right">
              ${" "}
              {totalFacturado.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td className="text-right text-danger">
              ${" "}
              {totalDeuda.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={handleGenerarPDF}>
          <i className="fas fa-file-pdf"></i> Generar PDF
        </button>
        <button className="btn btn-secondary ml-2" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default DetalleInformeNoPagadas;
