// src/pages/compras/informes/DetalleInformeProveedores.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const DetalleInformeProveedores = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalGral = data.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

  if (loading)
    return <div className="p-5 text-center">Generando informe...</div>;

  return (
    <div className="container bg-white p-4 mt-4 shadow-sm rounded border-top border-primary border-lg">
      <div className="text-center mb-4">
        <h1 className="text-primary font-weight-bold">
          Informe de Compras por Proveedor
        </h1>
        <p className="text-muted">
          Período: {desde.split("-").reverse().join("/")} -{" "}
          {hasta.split("-").reverse().join("/")}
        </p>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover">
          <thead className="table-primary text-center text-uppercase">
            <tr>
              <th>Proveedor</th>
              <th>Marca</th>
              <th className="text-right">Costo</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((p, i) => (
                <tr key={i}>
                  <td>{p.empresa}</td>
                  <td>{p.marca || "-"}</td>
                  <td className="text-right">
                    ${" "}
                    {parseFloat(p.costo).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right font-weight-bold">
                    ${" "}
                    {parseFloat(p.total).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No hay datos en este rango
                </td>
              </tr>
            )}
            <tr
              className="table-info font-weight-bold"
              style={{ fontSize: "1.1rem" }}
            >
              <td colSpan="2" className="text-center text-uppercase">
                Total
              </td>
              <td className="text-right">
                ${" "}
                {totalGral.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="text-right text-primary">
                ${" "}
                {totalGral.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() =>
            window.open(
              `http://localhost:3001/api/compras/informes/proveedores-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
              "_blank"
            )
          }
        >
          <i className="fas fa-file-pdf"></i> Generar PDF
        </button>
        <button
          className="btn btn-secondary btn-lg px-4 ml-3"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-reply"></i> Volver
        </button>
      </div>
    </div>
  );
};

export default DetalleInformeProveedores;
