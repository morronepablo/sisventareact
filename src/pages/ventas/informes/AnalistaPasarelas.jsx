// src/pages/ventas/informes/AnalistaPasarelas.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const AnalistaPasarelas = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/ventas/bi/rentabilidad-neta")
      .then((res) => {
        setData(res.data.metricas);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)
    return (
      <div className="p-3 text-center">
        No hay datos suficientes para este mes.
      </div>
    );

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-university text-primary mr-2"></i>
        <b>Analista de Pasarelas</b>
      </h1>
      <p className="text-muted">
        Análisis de rentabilidad neta (Descontando Comisiones y Gastos).
      </p>
      <hr />

      <div className="row">
        <div className="col-md-3">
          <div className="small-box bg-info shadow">
            <div className="inner">
              <h3>{formatMoney(data.ventas_brutas)}</h3>
              <p>Ventas Netas (Sin Dev.)</p>
            </div>
            <div className="icon">
              <i className="fas fa-cash-register"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="small-box bg-danger shadow">
            <div className="inner">
              <h3>
                {formatMoney(
                  parseFloat(data.comisiones_bancarias) +
                    parseFloat(data.gastos_operativos)
                )}
              </h3>
              <p>Deducciones Totales</p>
            </div>
            <div className="icon">
              <i className="fas fa-hand-holding-usd"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="small-box bg-success shadow">
            <div className="inner">
              <h3>{formatMoney(data.ganancia_neta_real)}</h3>
              <p>Ganancia Pura (Bolsillo)</p>
            </div>
            <div className="icon">
              <i className="fas fa-wallet"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="small-box bg-dark shadow">
            <div className="inner">
              <h3>{data.margen_limpio_porcentaje}%</h3>
              <p>Eficiencia Neta Real</p>
            </div>
            <div className="icon">
              <i className="fas fa-percent"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12">
          <div className="card shadow-sm border-left-primary">
            <div className="card-body">
              <div className="row">
                <div className="col-md-7">
                  <h4>
                    <i className="fas fa-stethoscope text-primary mr-2"></i>
                    <b>Diagnóstico del Analista:</b>
                  </h4>
                  <p className="lead mt-3">
                    Después de descontar el costo de mercadería (
                    <b>{formatMoney(data.costo_mercaderia)}</b>), las comisiones
                    bancarias (<b>{formatMoney(data.comisiones_bancarias)}</b>)
                    y los gastos fijos del local (
                    <b>{formatMoney(data.gastos_operativos)}</b>)...
                    <br />
                    <br />
                    Tu ganancia real neta es de{" "}
                    <b className="text-success h3">
                      {formatMoney(data.ganancia_neta_real)}
                    </b>
                    .
                  </p>
                </div>
                <div className="col-md-5 border-left pl-4">
                  <h6>
                    <b>Desglose de Impacto:</b>
                  </h6>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Comisiones Pasarelas:</span>
                    <span className="text-danger">
                      -{formatMoney(data.comisiones_bancarias)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Gastos Operativos (Fijos/Var):</span>
                    <span className="text-danger">
                      -{formatMoney(data.gastos_operativos)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                    <span className="text-bold">Total Retenciones:</span>
                    <span className="text-bold text-danger">
                      {formatMoney(
                        parseFloat(data.comisiones_bancarias) +
                          parseFloat(data.gastos_operativos)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalistaPasarelas;
