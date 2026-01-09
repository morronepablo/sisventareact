// src/pages/compras/informes/DetalleInformeProveedores.jsx export default DetalleInformeProveedores;
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeProveedores = () => {
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
      .get(
        `/compras/informes/proveedores?fecha_inicio=${desde}&fecha_fin=${hasta}`
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [desde, hasta]);

  const totalGral = data.reduce(
    (acc, curr) => acc + parseFloat(curr.total || 0),
    0
  );

  const handleGenerarPDF = () => {
    const token = localStorage.getItem("token");
    const url = `${API_URL}/api/compras/informes/proveedores-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}&token=${token}`;
    window.open(url, "_blank");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container bg-white p-4 mt-4 shadow rounded">
      <div className="text-center mb-4">
        <h1 className="text-primary">Informe de Compras por Proveedor</h1>
        <p className="text-muted">
          Período: {desde.split("-").reverse().join("/")} -{" "}
          {hasta.split("-").reverse().join("/")}
        </p>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-primary text-center">
          <tr>
            <th>Proveedor</th>
            <th>Marca</th>
            <th>Cant. Compras</th>
            <th>Total Invertido</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.proveedor}</td>
              <td className="text-center">{item.marca || "-"}</td>
              <td className="text-center">{item.cant_compras}</td>
              <td className="text-right font-weight-bold">
                ${" "}
                {parseFloat(item.total || 0).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
          <tr className="table-secondary font-weight-bold">
            <td colSpan="3" className="text-right">
              TOTAL GENERAL
            </td>
            <td className="text-right">
              ${" "}
              {totalGral.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-center mt-4">
        <button className="btn btn-danger" onClick={handleGenerarPDF}>
          <i className="fas fa-file-pdf"></i> Generar PDF
        </button>
        <button className="btn btn-secondary ml-2" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default DetalleInformeProveedores;
