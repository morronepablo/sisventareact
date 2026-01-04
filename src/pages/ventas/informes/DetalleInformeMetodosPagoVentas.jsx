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

  // --- FUNCIÓN PARA CAMBIAR FORMATO DE FECHA (YYYY-MM-DD a DD/MM/YYYY) ---
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    // DEBE COINCIDIR CON LA RUTA DEFINIDA EN EL BACKEND
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
      efe: acc.efe + parseFloat(d.efectivo),
      tar: acc.tar + parseFloat(d.tarjeta),
      mp: acc.mp + parseFloat(d.mercadopago),
      tra: acc.tra + parseFloat(d.transferencia),
      gral: acc.gral + parseFloat(d.total),
    }),
    { efe: 0, tar: 0, mp: 0, tra: 0, gral: 0 }
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container bg-white p-4 mt-4 shadow rounded">
      <div className="text-center mb-4">
        <h1 className="text-info">Informe de Ventas por Forma de Pago</h1>
        {/* USAMOS LA FUNCIÓN DE FORMATEO AQUÍ */}
        <p className="text-muted" style={{ fontSize: "1rem" }}>
          Período: {formatFecha(desde)} - {formatFecha(hasta)}
        </p>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-info text-center">
            <tr>
              <th>Fecha</th>
              <th>Efectivo</th>
              <th>Tarjeta</th>
              <th>MercadoPago</th>
              <th>Transferencia</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td className="text-center">
                  {new Date(d.fecha).toLocaleDateString("es-AR")}
                </td>
                <td className="text-right">
                  $ {parseFloat(d.efectivo).toLocaleString("es-AR")}
                </td>
                <td className="text-right">
                  $ {parseFloat(d.tarjeta).toLocaleString("es-AR")}
                </td>
                <td className="text-right">
                  $ {parseFloat(d.mercadopago).toLocaleString("es-AR")}
                </td>
                <td className="text-right">
                  $ {parseFloat(d.transferencia).toLocaleString("es-AR")}
                </td>
                <td className="text-right font-weight-bold">
                  $ {parseFloat(d.total).toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
            <tr className="table-secondary font-weight-bold">
              <td className="text-center">TOTALES</td>
              <td className="text-right">
                $ {totals.efe.toLocaleString("es-AR")}
              </td>
              <td className="text-right">
                $ {totals.tar.toLocaleString("es-AR")}
              </td>
              <td className="text-right">
                $ {totals.mp.toLocaleString("es-AR")}
              </td>
              <td className="text-right">
                $ {totals.tra.toLocaleString("es-AR")}
              </td>
              <td className="text-right">
                $ {totals.gral.toLocaleString("es-AR")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-danger"
          onClick={() =>
            window.open(
              `http://localhost:3001/api/ventas/informes/forma-pagos-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
              "_blank"
            )
          }
        >
          <i className="fas fa-file-pdf"></i> Generar PDF
        </button>
        <button className="btn btn-secondary ml-2" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default DetalleInformeMetodosPagoVentas;
