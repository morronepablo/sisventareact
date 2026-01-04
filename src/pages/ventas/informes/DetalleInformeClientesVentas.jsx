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

  const totalGral = data.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  const totalCosto = data.reduce(
    (acc, curr) => acc + parseFloat(curr.costo),
    0
  );
  const totalGanancia = data.reduce(
    (acc, curr) => acc + parseFloat(curr.ganancia),
    0
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container bg-white p-4 mt-4 shadow rounded">
      <div className="text-center mb-4">
        <h1 className="text-primary">Informe de Ventas por Cliente</h1>
        {/* USAMOS LA FUNCIÓN DE FORMATEO AQUÍ */}
        <p className="text-muted" style={{ fontSize: "1rem" }}>
          Período: {formatFecha(desde)} - {formatFecha(hasta)}
        </p>
      </div>

      <table className="table table-hover table-bordered">
        <thead className="table-primary text-center">
          <tr>
            <th className="text-left">Cliente</th>
            <th>Costo</th>
            <th>Ganancia</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr key={i}>
              <td>{c.nombre}</td>
              <td className="text-right">
                $ {parseFloat(c.costo).toLocaleString("es-AR")}
              </td>
              <td className="text-right text-success">
                $ {parseFloat(c.ganancia).toLocaleString("es-AR")}
              </td>
              <td className="text-right font-weight-bold">
                $ {parseFloat(c.total).toLocaleString("es-AR")}
              </td>
            </tr>
          ))}
          <tr className="table-secondary font-weight-bold">
            <td>TOTAL GENERAL</td>
            <td className="text-right">
              $ {totalCosto.toLocaleString("es-AR")}
            </td>
            <td className="text-right text-success">
              $ {totalGanancia.toLocaleString("es-AR")}
            </td>
            <td className="text-right text-primary">
              $ {totalGral.toLocaleString("es-AR")}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-center mt-4">
        <button
          className="btn btn-danger"
          onClick={() =>
            window.open(
              `http://localhost:3001/api/ventas/informes/clientes-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
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

export default DetalleInformeClientesVentas;
