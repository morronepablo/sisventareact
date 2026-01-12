// src/pages/ventas/informes/DetalleInformeClientesVentas.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeClientesVentas = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FUNCIÓN PARA FORMATEAR MONEDA CON 2 DECIMALES OBLIGATORIOS ---
  const fmt = (val) => {
    return parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --- FUNCIÓN PARA CAMBIAR FORMATO DE FECHA (YYYY-MM-DD a DD/MM/YYYY) ---
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    api
      .get(`/ventas/informes/clientes?fecha_inicio=${desde}&fecha_fin=${hasta}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      });
  }, [desde, hasta]);

  const totalGral = data.reduce(
    (acc, curr) => acc + parseFloat(curr.total || 0),
    0
  );
  const totalCosto = data.reduce(
    (acc, curr) => acc + parseFloat(curr.costo || 0),
    0
  );
  const totalGanancia = data.reduce(
    (acc, curr) => acc + parseFloat(curr.ganancia || 0),
    0
  );

  // URL dinámica para el botón de PDF
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container bg-white p-4 mt-4 shadow rounded">
      <div className="text-center mb-4">
        <h1 className="text-primary">
          <b>Informe de Ventas por Cliente</b>
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>
          Período: {formatFecha(desde)} - {formatFecha(hasta)}
        </p>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered table-striped">
          <thead className="table-dark text-center">
            <tr>
              <th className="text-left">Cliente</th>
              <th>Costo Total</th>
              <th>Ganancia Neta</th>
              <th>Total Ventas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={i}>
                <td className="font-weight-bold">{c.nombre}</td>
                <td className="text-right">$ {fmt(c.costo)}</td>
                <td className="text-right text-success font-weight-bold">
                  $ {fmt(c.ganancia)}
                </td>
                <td className="text-right font-weight-bold text-primary">
                  $ {fmt(c.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr
              className="table-secondary font-weight-bold"
              style={{ fontSize: "1.1rem" }}
            >
              <td className="text-center">TOTALES GENERALES</td>
              <td className="text-right">$ {fmt(totalCosto)}</td>
              <td className="text-right text-success">
                $ {fmt(totalGanancia)}
              </td>
              <td className="text-right text-primary">$ {fmt(totalGral)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="text-center mt-4 d-print-none">
        <button
          className="btn btn-danger btn-lg shadow-sm"
          onClick={() =>
            window.open(
              `${API_URL}/api/ventas/informes/clientes-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
              "_blank"
            )
          }
        >
          <i className="fas fa-file-pdf mr-2"></i> Generar PDF
        </button>
        <button
          className="btn btn-secondary btn-lg shadow-sm ml-3"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-reply mr-2"></i> Volver
        </button>
      </div>
    </div>
  );
};

export default DetalleInformeClientesVentas;
