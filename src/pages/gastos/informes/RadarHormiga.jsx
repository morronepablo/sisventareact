// src/pages/gastos/informes/RadarHormiga.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const RadarHormiga = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/gastos/informes/gastos-hormiga")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-3 text-center">Sin datos.</div>;

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <i className="fas fa-bug text-warning mr-2"></i>
          <b>Radar de Gastos Hormiga</b>
        </h1>
        <p className="text-muted">
          Detección de pequeñas fugas de capital (Tickets menores a{" "}
          {formatMoney(data.umbral)})
        </p>
        <hr />

        <div className="row">
          {/* CANTIDAD DE TICKETS */}
          <div className="col-md-4">
            <div className="info-box shadow-sm">
              <span className="info-box-icon bg-warning">
                <i className="fas fa-receipt"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Frecuencia Mensual
                </span>
                <span className="info-box-number h4">
                  {data.actual.cantidad} pequeñas compras
                </span>
                <small className="text-muted">
                  Mes anterior: {data.anterior.cantidad}
                </small>
              </div>
            </div>
          </div>

          {/* TOTAL ACUMULADO */}
          <div className="col-md-4">
            <div className="info-box shadow-sm">
              <span className="info-box-icon bg-danger">
                <i className="fas fa-funnel-dollar"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Dinero "Fugado" Acumulado
                </span>
                <span className="info-box-number h4 text-danger">
                  {formatMoney(data.actual.total)}
                </span>
                <small className="text-muted text-bold">
                  Tendencia:
                  <span
                    className={
                      data.tendenciaMonto > 0 ? "text-danger" : "text-success"
                    }
                  >
                    {data.tendenciaMonto > 0 ? " ▲ " : " ▼ "}
                    {data.tendenciaMonto}%
                  </span>
                </small>
              </div>
            </div>
          </div>

          {/* DIAGNÓSTICO RÁPIDO */}
          <div className="col-md-4">
            <div
              className={`info-box shadow-sm ${
                data.actual.total > data.anterior.total
                  ? "border-left-danger"
                  : "border-left-success"
              }`}
            >
              <div className="info-box-content">
                <span className="info-box-text text-bold">
                  Impacto en la Caja
                </span>
                <p className="m-0 small">
                  {data.tendenciaMonto > 0
                    ? `¡Atención! Estás gastando ${formatMoney(
                        data.actual.total - data.anterior.total
                      )} más que el mes pasado en cosas pequeñas.`
                    : "Felicidades, lograste reducir las fugas de dinero respecto al mes pasado."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-6">
            <div className="card card-outline card-warning shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-search-dollar mr-2"></i>¿Dónde se escapa
                  la plata?
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-striped m-0">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th className="text-center">Tickets</th>
                      <th className="text-right">Monto Fugado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ranking.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <b>{item.categoria}</b>
                        </td>
                        <td className="text-center">{item.cantidad}</td>
                        <td className="text-right text-bold">
                          {formatMoney(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-dark shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-center text-center">
                <i className="fas fa-microscope fa-4x text-warning mb-3"></i>
                <h3 className="text-bold">Conclusión BI</h3>
                <p className="px-4" style={{ fontSize: "1.2rem" }}>
                  Has detectado <b>{data.actual.cantidad}</b> movimientos de
                  caja menores a <b>{formatMoney(data.umbral)}</b>.
                  <br />
                  <br />
                  Si logras reducir estos gastos un 20%, tendrías{" "}
                  <b>{formatMoney(data.actual.total * 0.2)} extra</b> en tu
                  bolsillo a fin de mes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarHormiga;
