// src/pages/arqueos/VerArqueo.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerArqueo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const response = await api.get(`/arqueos/${id}`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar detalle:", error);
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading)
    return (
      <div className="p-4 text-center">
        <i className="fas fa-spinner fa-spin mr-2"></i> Cargando detalle...
      </div>
    );
  if (!data || !data.arqueo)
    return (
      <div className="p-4 text-center text-danger">
        No se encontró el arqueo.
      </div>
    );

  // Extraemos datos asegurando que sean arrays para que no falle el .filter
  const arqueo = data.arqueo;
  const movimientos = data.movimientos || [];
  const retiros = data.retiros || []; // 👈 Nueva data de retiros

  const m_inicial = parseFloat(arqueo.monto_inicial || 0);
  const m_final = parseFloat(arqueo.monto_final || 0);

  // Filtrar movimientos
  const ingresos = movimientos.filter((m) => m.tipo === "Ingreso");
  const egresos = movimientos.filter((m) => m.tipo === "Egreso");

  const totalIngreso = ingresos.reduce(
    (acc, curr) => acc + parseFloat(curr.monto || 0),
    0
  );
  const totalEgreso = egresos.reduce(
    (acc, curr) => acc + parseFloat(curr.monto || 0),
    0
  );
  const totalRetiros = retiros.reduce(
    (acc, curr) => acc + parseFloat(curr.monto || 0),
    0
  );

  // LÓGICA DE DIFERENCIA BI ACTUALIZADA (Resta Retiros)
  const saldoEsperado = m_inicial + totalIngreso - totalEgreso - totalRetiros;
  const diferencia = m_final - saldoEsperado;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-sm-12">
            <h1 className="m-0 text-dark">
              <b>Detalle del Arqueo</b>{" "}
              <small className="text-muted">| Caja N° {arqueo.caja_id}</small>
            </h1>
            <hr />
          </div>
        </div>

        <div className="row">
          {/* COLUMNA 1: DATOS CABECERA */}
          <div className="col-md-3">
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Información General</h3>
              </div>
              <div className="card-body">
                <label className="text-xs text-uppercase text-muted">
                  Cajero Responsable
                </label>
                <p className="text-bold">{arqueo.usuario_nombre || "Admin"}</p>

                <div className="form-group mb-2">
                  <label className="text-xs text-uppercase text-muted">
                    Fecha Apertura
                  </label>
                  <div className="form-control form-control-sm bg-light">
                    {formatDateTime(arqueo.fecha_apertura)}
                  </div>
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs text-uppercase text-muted">
                    Monto Inicial
                  </label>
                  <div className="form-control form-control-sm bg-light text-right text-bold">
                    {formatMoney(m_inicial)}
                  </div>
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs text-uppercase text-muted">
                    Fecha Cierre
                  </label>
                  <div className="form-control form-control-sm bg-light">
                    {arqueo.fecha_cierre
                      ? formatDateTime(arqueo.fecha_cierre)
                      : "CAJA ABIERTA"}
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="text-xs text-uppercase text-muted">
                    Monto Final (Real)
                  </label>
                  <div className="form-control form-control-sm bg-light text-right text-bold text-primary">
                    {formatMoney(m_final)}
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-block shadow-sm"
                  onClick={() => navigate("/arqueos/listado")}
                >
                  <i className="fas fa-arrow-left mr-1"></i> Volver al Listado
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: MOVIMIENTOS (INGRESOS / EGRESOS) */}
          <div className="col-md-5">
            <div className="card card-outline card-success shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  Ingresos y Egresos Manuales
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped mb-0">
                  <thead className="bg-dark text-white text-xs">
                    <tr>
                      <th>TIPO</th>
                      <th>DETALLE</th>
                      <th className="text-right">MONTO</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {movimientos.length > 0 ? (
                      movimientos.map((m) => (
                        <tr key={m.id}>
                          <td className="text-center">
                            <span
                              className={`badge ${
                                m.tipo === "Ingreso"
                                  ? "badge-success"
                                  : "badge-danger"
                              }`}
                            >
                              {m.tipo}
                            </span>
                          </td>
                          <td>{m.descripcion}</td>
                          <td className="text-right text-bold">
                            {formatMoney(m.monto)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          Sin movimientos manuales
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: RETIROS DE SEGURIDAD */}
          <div className="col-md-4">
            <div className="card card-outline card-warning shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  Retiros de Seguridad (Monitor)
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped mb-0">
                  <thead className="bg-warning text-dark text-xs">
                    <tr>
                      <th>FECHA</th>
                      <th>MOTIVO</th>
                      <th className="text-right">MONTO</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {retiros.length > 0 ? (
                      retiros.map((r) => (
                        <tr key={r.id}>
                          <td className="text-center">
                            {new Date(r.fecha).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>{r.motivo}</td>
                          <td className="text-right text-bold text-danger">
                            -{formatMoney(r.monto)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-3">
                          No hubo retiros parciales
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {totalRetiros > 0 && (
                    <tfoot>
                      <tr className="bg-light">
                        <td colSpan="2" className="text-right">
                          <b>Total Retirado</b>
                        </td>
                        <td className="text-right text-danger text-bold">
                          {formatMoney(totalRetiros)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* BALANCE FINAL BI */}
        <div className="row mt-4">
          <div className="col-md-12">
            <div
              className={`card ${
                diferencia < 0 ? "card-danger" : "card-success"
              } card-outline shadow-sm`}
            >
              <div className="card-body py-3">
                <div className="row text-center">
                  <div className="col-md-3 border-right">
                    <label className="text-muted text-xs text-uppercase d-block">
                      Saldo Esperado
                    </label>
                    <span className="h4 text-bold">
                      {formatMoney(saldoEsperado)}
                    </span>
                  </div>
                  <div className="col-md-3 border-right">
                    <label className="text-muted text-xs text-uppercase d-block">
                      Dinero Entregado
                    </label>
                    <span className="h4 text-bold">{formatMoney(m_final)}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted text-xs text-uppercase d-block">
                      Resultado del Arqueo (Diferencia)
                    </label>
                    <span
                      className={`h2 text-bold ${
                        diferencia < 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      {diferencia === 0
                        ? "CAJA PERFECTA"
                        : formatMoney(diferencia)}
                    </span>
                    <p className="text-xs mt-1 mb-0 italic">
                      Matemática: (Inicial + Ingresos) - Egresos - Retiros vs
                      Monto Final
                    </p>
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

export default VerArqueo;
