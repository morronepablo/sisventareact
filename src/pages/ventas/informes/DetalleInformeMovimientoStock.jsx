// src/pages/ventas/informes/DetalleInformeMovimientoStock.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeMovimientoStock = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const [data, setData] = useState({ conMovimiento: [], sinMovimiento: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(
        `/ventas/informes/movimiento-stock?fecha_inicio=${desde}&fecha_fin=${hasta}`
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => console.error("Error API:", err));
  }, [desde, hasta]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container bg-white p-4 mt-4 shadow rounded">
      <div className="text-center mb-4">
        <h1 className="text-primary">Informe de Movimiento de Stock</h1>
        <p className="text-muted">
          Período: {desde} - {hasta}
        </p>
      </div>

      <h4 className="text-primary mt-4">Movimientos Rápidos</h4>
      <table className="table table-striped table-bordered">
        <thead className="table-primary text-center">
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cantidad Vendida</th>
            <th>N° de Ventas</th>
          </tr>
        </thead>
        <tbody>
          {data.conMovimiento.map((p, i) => (
            <tr key={i}>
              <td className="text-center">{i + 1}</td>
              <td>{p.nombre}</td>
              <td className="text-center">
                {p.cantidad_vendida} {p.unidad}
              </td>
              <td className="text-center">{p.num_ventas}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="text-danger mt-5">Sin Movimientos</h4>
      <table className="table table-striped table-bordered">
        <thead className="table-danger text-center">
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>N° de Ventas</th>
          </tr>
        </thead>
        <tbody>
          {data.sinMovimiento.map((p, i) => (
            <tr key={i}>
              <td className="text-center">{i + 1}</td>
              <td>{p.nombre}</td>
              <td className="text-center">0</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center mt-4">
        <button
          className="btn btn-danger"
          onClick={() =>
            window.open(
              `http://localhost:3001/api/ventas/informes/movimiento-stock-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
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

export default DetalleInformeMovimientoStock;
