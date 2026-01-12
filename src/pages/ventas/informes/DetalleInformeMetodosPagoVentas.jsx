// src/pages/ventas/informes/DetalleInformeMetodosPagoVentas.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeMetodosPagoVentas = () => {
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
      .get(
        `/ventas/informes/forma-pagos?fecha_inicio=${desde}&fecha_fin=${hasta}`
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, [desde, hasta]);

  const totals = data.reduce(
    (acc, d) => ({
      efe: acc.efe + parseFloat(d.efectivo || 0),
      tar: acc.tar + parseFloat(d.tarjeta || 0),
      mp: acc.mp + parseFloat(d.mercadopago || 0),
      tra: acc.tra + parseFloat(d.transferencia || 0),
      gral: acc.gral + parseFloat(d.total || 0),
    }),
    { efe: 0, tar: 0, mp: 0, tra: 0, gral: 0 }
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
        <h1 className="text-info">
          <b>Informe de Ventas por Forma de Pago</b>
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>
          Período: {formatFecha(desde)} - {formatFecha(hasta)}
        </p>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered table-striped">
          <thead className="table-dark text-center">
            <tr>
              <th>Fecha</th>
              <th>Efectivo</th>
              <th>Tarjeta</th>
              <th>MercadoPago</th>
              <th>Transferencia</th>
              <th>Total Día</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td className="text-center">
                  {new Date(d.fecha).toLocaleDateString("es-AR")}
                </td>
                <td className="text-right">$ {fmt(d.efectivo)}</td>
                <td className="text-right">$ {fmt(d.tarjeta)}</td>
                <td className="text-right">$ {fmt(d.mercadopago)}</td>
                <td className="text-right">$ {fmt(d.transferencia)}</td>
                <td className="text-right font-weight-bold text-primary">
                  $ {fmt(d.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr
              className="table-secondary font-weight-bold"
              style={{ fontSize: "1.05rem" }}
            >
              <td className="text-center">TOTALES</td>
              <td className="text-right">$ {fmt(totals.efe)}</td>
              <td className="text-right">$ {fmt(totals.tar)}</td>
              <td className="text-right">$ {fmt(totals.mp)}</td>
              <td className="text-right">$ {fmt(totals.tra)}</td>
              <td className="text-right text-primary">$ {fmt(totals.gral)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="text-center mt-4 d-print-none">
        <button
          className="btn btn-danger btn-lg shadow-sm"
          onClick={() =>
            window.open(
              `${API_URL}/api/ventas/informes/forma-pagos-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
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

export default DetalleInformeMetodosPagoVentas;
