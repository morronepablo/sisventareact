// src/pages/compras/informes/DetalleInformeProductos.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const DetalleInformeProductos = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(
        `/compras/informes/productos?fecha_inicio=${desde}&fecha_fin=${hasta}`
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      });
  }, [desde, hasta]);

  const totalGral = data.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

  if (loading)
    return <div className="p-5 text-center">Generando informe...</div>;

  return (
    <div className="container bg-white p-4 mt-4 shadow rounded">
      <div className="text-center mb-4">
        <h1 className="text-primary">Informe de Compras por Productos</h1>
        <p className="text-muted">
          Período: {desde} - {hasta}
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
          {data.map((p, i) => (
            <tr key={i}>
              <td className="text-center">{p.codigo}</td>
              <td>{p.nombre}</td>
              <td className="text-center">{p.cantidad}</td>
              <td className="text-center">{p.unidad || "-"}</td>
              <td className="text-right">
                $ {parseFloat(p.costo).toLocaleString("es-AR")}
              </td>
              <td className="text-right">
                $ {parseFloat(p.total).toLocaleString("es-AR")}
              </td>
            </tr>
          ))}
          <tr className="table-secondary font-weight-bold">
            <td colSpan="5" className="text-right">
              TOTAL GENERAL
            </td>
            <td className="text-right">
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
              `http://localhost:3001/api/compras/informes/productos-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
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

export default DetalleInformeProductos;
