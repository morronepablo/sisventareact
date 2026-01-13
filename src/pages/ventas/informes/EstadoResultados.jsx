// src/pages/ventas/informes/EstadoResultados.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const EstadoResultados = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechas, setFechas] = useState({
    desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    hasta: new Date().toISOString().split("T")[0],
  });

  const fetchEstado = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/ventas/estado-resultados?desde=${fechas.desde}&hasta=${fechas.hasta}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstado();
  }, []);

  const formatMoney = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="container-fluid pt-3">
      <div className="card card-outline card-success shadow">
        <div className="card-header">
          <h3 className="card-title text-bold">
            <i className="fas fa-file-invoice-dollar mr-2"></i> Estado de
            Resultados Profesional (P&L)
          </h3>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-3">
              <label>Desde:</label>
              <input
                type="date"
                className="form-control"
                value={fechas.desde}
                onChange={(e) =>
                  setFechas({ ...fechas, desde: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <label>Hasta:</label>
              <input
                type="date"
                className="form-control"
                value={fechas.hasta}
                onChange={(e) =>
                  setFechas({ ...fechas, hasta: e.target.value })
                }
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-success btn-block"
                onClick={fetchEstado}
              >
                ANALIZAR
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            data && (
              <div className="row justify-content-center">
                <div className="col-md-10">
                  <table className="table table-hover border">
                    <thead className="bg-dark">
                      <tr>
                        <th>DESCRIPCIÓN</th>
                        <th className="text-right">VALOR</th>
                        <th className="text-right">% s/ Ventas</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-light">
                        <td>
                          <b>(+) INGRESOS POR VENTAS</b>
                        </td>
                        <td className="text-right">
                          <b>{formatMoney(data.ingresos.brutos)}</b>
                        </td>
                        <td className="text-right">-</td>
                      </tr>
                      <tr className="text-danger">
                        <td>(-) Devoluciones y Anulaciones</td>
                        <td className="text-right">
                          ({formatMoney(data.ingresos.devoluciones)})
                        </td>
                        <td className="text-right">-</td>
                      </tr>
                      <tr className="bg-navy">
                        <td>
                          <b>(=) VENTAS NETAS</b>
                        </td>
                        <td className="text-right">
                          <b>{formatMoney(data.ingresos.netos)}</b>
                        </td>
                        <td className="text-right">100%</td>
                      </tr>

                      <tr>
                        <td className="pl-4">
                          (-) Costo de Mercadería Vendida (CMV)
                        </td>
                        <td className="text-right text-danger">
                          {formatMoney(data.costos.cmv)}
                        </td>
                        <td className="text-right">
                          {(
                            (data.costos.cmv / data.ingresos.netos) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>

                      <tr className="bg-light">
                        <td>
                          <b>(=) UTILIDAD BRUTA</b>
                        </td>
                        <td className="text-right">
                          <b>{formatMoney(data.costos.utilidadBruta)}</b>
                        </td>
                        <td className="text-right">
                          {(
                            (data.costos.utilidadBruta / data.ingresos.netos) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>

                      <tr>
                        <td className="pl-4">
                          (-) Gastos Operativos (Fijos/Variables)
                        </td>
                        <td className="text-right text-danger">
                          {formatMoney(data.gastos.operativos)}
                        </td>
                        <td className="text-right">
                          {(
                            (data.gastos.operativos / data.ingresos.netos) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td className="pl-4">
                          (-) Comisiones Bancarias y Plataformas (Est.)
                        </td>
                        <td className="text-right text-danger">
                          {formatMoney(data.gastos.comisiones)}
                        </td>
                        <td className="text-right">
                          {(
                            (data.gastos.comisiones / data.ingresos.netos) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>

                      <tr className="bg-success" style={{ fontSize: "1.4rem" }}>
                        <td>
                          <b>(=) EBITDA (Utilidad Neta Real)</b>
                        </td>
                        <td className="text-right">
                          <b>{formatMoney(data.ebitda)}</b>
                        </td>
                        <td className="text-right">
                          <b>{data.margenEbitda}%</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="alert alert-info mt-3 shadow-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    El <b>EBITDA</b> representa el flujo de caja operativo de tu
                    negocio. Un margen mayor al 15% se considera saludable en
                    retail.
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EstadoResultados;
