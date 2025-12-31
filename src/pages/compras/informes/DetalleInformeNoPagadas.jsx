// src/pages/compras/informes/DetalleInformeNoPagadas.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const DetalleInformeNoPagadas = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(
        `/compras/informes/no-pagadas?fecha_inicio=${desde}&fecha_fin=${hasta}`
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [desde, hasta]);

  const totalPrecio = data.reduce(
    (acc, curr) => acc + parseFloat(curr.precio_total),
    0
  );
  const totalDeuda = data.reduce(
    (acc, curr) => acc + parseFloat(curr.deuda),
    0
  );

  if (loading)
    return (
      <div className="p-5 text-center">Buscando facturas pendientes...</div>
    );

  return (
    <div className="container bg-white p-4 mt-4 shadow-sm rounded border-top border-primary border-lg">
      <div className="text-center mb-4">
        <h1 className="text-primary font-weight-bold">
          Informe de Compras no Pagadas
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
              <th>ID</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Comprobante</th>
              <th className="text-right">Precio Total</th>
              <th className="text-right">Deuda</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((c) => (
                <tr key={c.id}>
                  <td className="text-center">{c.id}</td>
                  <td className="text-center">
                    {new Date(c.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td>{c.proveedor}</td>
                  <td>{c.comprobante}</td>
                  <td className="text-right">
                    ${" "}
                    {parseFloat(c.precio_total).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right font-weight-bold text-danger">
                    ${" "}
                    {parseFloat(c.deuda).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No hay deudas en el periodo seleccionado
                </td>
              </tr>
            )}
            <tr className="table-info font-weight-bold">
              <td colSpan="4" className="text-center text-uppercase">
                Total
              </td>
              <td className="text-right">
                ${" "}
                {totalPrecio.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="text-right text-danger">
                ${" "}
                {totalDeuda.toLocaleString("es-AR", {
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
              `http://localhost:3001/api/compras/informes/no-pagadas-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
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

export default DetalleInformeNoPagadas;
