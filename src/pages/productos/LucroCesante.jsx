// src/pages/productos/LucroCesante.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const LucroCesante = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/productos/bi/lucro-cesante")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPerdido = data.reduce(
    (acc, curr) => acc + parseFloat(curr.lucroCesanteTotal),
    0
  );
  const totalGananciaPerdida = data.reduce(
    (acc, curr) => acc + parseFloat(curr.gananciaPerdidaTotal),
    0
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-fire-alt text-danger mr-2"></i>
        <b>Predictor de Agotamiento</b>
      </h1>
      <p className="text-muted">
        Análisis de <b>Lucro Cesante</b>: Dinero que dejás de ganar por falta de
        stock.
      </p>
      <hr />

      <div className="row">
        <div className="col-md-6">
          <div className="small-box bg-danger shadow">
            <div className="inner">
              <h3>{formatMoney(totalPerdido)}</h3>
              <p>Venta No Realizada (Estimada este mes)</p>
            </div>
            <div className="icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="small-box bg-warning shadow">
            <div className="inner">
              <h3>{formatMoney(totalGananciaPerdida)}</h3>
              <p>Ganancia Neta Perdida (Bolsillo)</p>
            </div>
            <div className="icon">
              <i className="fas fa-hand-holding-usd"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-outline card-danger shadow-sm mt-3">
        <div className="card-header">
          <h3 className="card-title text-bold">Productos con Stock Quebrado</h3>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="thead-dark text-center">
              <tr>
                <th>Producto</th>
                <th>Venta Diaria Prom.</th>
                <th>Días en Cero</th>
                <th>Venta Perdida</th>
                <th className="bg-danger">Ganancia Perdida</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td className="align-middle px-3">
                    <b>{p.nombre}</b>
                    <br />
                    <small className="text-muted">{p.categoria}</small>
                  </td>
                  <td className="text-center align-middle">
                    {p.vDiaria} unid.
                  </td>
                  <td className="text-center align-middle">
                    <span className="badge badge-danger p-2">
                      {p.diasEnCero} días
                    </span>
                  </td>
                  <td className="text-right align-middle">
                    {formatMoney(p.lucroCesanteTotal)}
                  </td>
                  <td className="text-right align-middle font-weight-bold text-danger">
                    {formatMoney(p.gananciaPerdidaTotal)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    ¡Excelente! No tenés productos con alta rotación en stock
                    cero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="alert bg-dark text-white mt-4 border-left-danger shadow">
        <h5>
          <i className="fas fa-biohazard text-danger mr-2"></i>
          <b>Diagnóstico de Fuga:</b>
        </h5>
        El sistema detectó que estás perdiendo un promedio de{" "}
        <b>
          {formatMoney(
            data.reduce(
              (acc, curr) => acc + parseFloat(curr.ventaPerdidaDiaria),
              0
            )
          )}{" "}
          por día
        </b>{" "}
        solo por no tener estos productos en estante.
        <br />
        <b>Acción sugerida:</b> Reponer estos productos es más urgente que
        cualquier otra compra, ya que tienen rotación garantizada.
      </div>
    </div>
  );
};

export default LucroCesante;
