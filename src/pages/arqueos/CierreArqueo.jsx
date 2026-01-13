// src/pages/arqueos/CierreArqueo.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNotifications } from "../../context/NotificationContext";

const CierreArqueo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAll } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [arqueoInfo, setArqueoInfo] = useState(null);

  // Totales sistema
  const [cards, setCards] = useState(0);
  const [mp, setMp] = useState(0);
  const [transfer, setTransfer] = useState(0);
  const [totalRetiros, setTotalRetiros] = useState(0);

  const [bills, setBills] = useState({
    b20000: 0,
    b10000: 0,
    b2000: 0,
    b1000: 0,
    b500: 0,
    b200: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    b10: 0,
    b5: 0,
  });

  const [coins, setCoins] = useState({ c2: 0, c1: 0, c050: 0, c025: 0 });

  const getLocalNow = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const [fechaCierre, setFechaCierre] = useState(getLocalNow());

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await api.get(`/arqueos/${id}`);
        const data = response.data;
        setArqueoInfo(data.arqueo);

        if (data.totales_sistema) {
          setCards(parseFloat(data.totales_sistema.total_tarjeta_sistema) || 0);
          setMp(parseFloat(data.totales_sistema.total_mp_sistema) || 0);
          setTransfer(
            parseFloat(data.totales_sistema.total_transf_sistema) || 0
          );
        }

        if (data.retiros) {
          const sumRetiros = data.retiros.reduce(
            (acc, curr) => acc + parseFloat(curr.monto),
            0
          );
          setTotalRetiros(sumRetiros);
        }

        setLoading(false);
      } catch (error) {
        navigate("/arqueos/listado");
      }
    };
    fetchInfo();
  }, [id, navigate]);

  const totalCash =
    bills.b20000 * 20000 +
    bills.b10000 * 10000 +
    bills.b2000 * 2000 +
    bills.b1000 * 1000 +
    bills.b500 * 500 +
    bills.b200 * 200 +
    bills.b100 * 100 +
    bills.b50 * 50 +
    bills.b20 * 20 +
    bills.b10 * 10 +
    bills.b5 * 5 +
    coins.c2 * 2 +
    coins.c1 * 1 +
    coins.c050 * 0.5 +
    coins.c025 * 0.25;

  const totalContado = totalCash + cards + mp + transfer;

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "¿Confirmar cierre de caja?",
      text: "Se registrará el cierre comparando lo contado contra el sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar caja",
      cancelButtonText: "Revisar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.put(`/arqueos/cierre/${id}`, {
            fecha_cierre: fechaCierre,
            monto_final: totalContado,
            ventas_efectivo: totalCash,
            ventas_tarjeta: cards,
            ventas_mercadopago: mp,
            ventas_transferencia: transfer,
          });

          if (refreshAll) refreshAll();
          window.dispatchEvent(new Event("forceRefreshNotifications"));

          const dif = res.data.diferencia;
          let msg = "Caja cerrada correctamente.";
          if (dif < 0)
            msg = `Cierre registrado con FALTANTE de: ${formatMoney(
              Math.abs(dif)
            )}`;
          else if (dif > 0)
            msg = `Cierre registrado con SOBRANTE de: ${formatMoney(dif)}`;

          await Swal.fire({
            position: "center",
            icon: Math.abs(dif) > 10 ? "error" : "success",
            title: "Resultado del Arqueo",
            text: msg,
            showConfirmButton: true,
          }).then(() => {
            navigate("/arqueos/listado");
          });
        } catch (error) {
          Swal.fire("Error", "Fallo al cerrar", "error");
        }
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Cierre de Arqueo (Ciego)</b>
        </h1>
        <hr />
        <div className="row">
          {/* COLUMNA IZQUIERDA: RESUMEN Y FECHAS */}
          <div className="col-md-4">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">Resumen de Cierre</h3>
              </div>
              <div className="card-body">
                <div className="alert alert-info py-2 small mb-3">
                  Ingrese el efectivo físico. El sistema ajustará
                  automáticamente los retiros realizados.
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs">FECHA APERTURA</label>
                  <div className="form-control form-control-sm bg-light">
                    {new Date(arqueoInfo.fecha_apertura).toLocaleString()}
                  </div>
                </div>

                {/* 🚀 FECHA DE CIERRE RESTAURADA 🚀 */}
                <div className="form-group mb-3">
                  <label className="text-xs">FECHA DE CIERRE</label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm border-primary"
                    value={fechaCierre}
                    onChange={(e) => setFechaCierre(e.target.value)}
                  />
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs text-uppercase font-weight-bold">
                    Total Contado Actual
                  </label>
                  <div
                    className="h3 text-center p-3 rounded font-weight-bold shadow-sm"
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "2px dashed #007bff",
                      color: "#007bff",
                    }}
                  >
                    {formatMoney(totalContado)}
                  </div>
                </div>

                {totalRetiros > 0 && (
                  <div className="bg-warning p-2 rounded mb-3 text-center shadow-sm border border-warning">
                    <small className="d-block text-uppercase font-weight-bold text-dark">
                      Retiros de Seguridad Realizados
                    </small>
                    <span className="h5 text-bold">
                      - {formatMoney(totalRetiros)}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  className="btn btn-success btn-block btn-lg shadow mt-2 text-bold"
                >
                  <i className="fas fa-check-circle mr-2"></i> FINALIZAR Y
                  CERRAR
                </button>
                <button
                  onClick={() => navigate("/arqueos/listado")}
                  className="btn btn-default btn-block mt-2"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CONTADOR */}
          <div className="col-md-8">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">Contador Físico</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 border-right">
                    <h5 className="text-primary text-bold mb-3">
                      <i className="fas fa-money-bill-wave mr-2"></i>BILLETES
                    </h5>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        {[
                          20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10,
                          5,
                        ].map((val) => (
                          <tr key={val}>
                            <td width="85">
                              <input
                                type="number"
                                className="form-control form-control-sm text-center font-weight-bold border-primary shadow-sm"
                                min="0"
                                value={bills[`b${val}`]}
                                onChange={(e) =>
                                  setBills({
                                    ...bills,
                                    [`b${val}`]: parseInt(e.target.value || 0),
                                  })
                                }
                              />
                            </td>
                            <td className="text-center">
                              <img
                                src={`/src/assets/img/bill_${val}.jpg`}
                                alt={val}
                                width="65"
                                className="img-thumbnail"
                              />
                            </td>
                            <td className="align-middle text-muted text-bold small">
                              {formatMoney(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-primary text-bold mb-3">
                      <i className="fas fa-coins mr-2"></i>MONEDAS Y OTROS
                    </h5>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        {[2, 1, "050", "025"].map((val) => (
                          <tr key={val}>
                            <td width="85">
                              <input
                                type="number"
                                className="form-control form-control-sm text-center font-weight-bold border-primary shadow-sm"
                                min="0"
                                value={coins[`c${val}`]}
                                onChange={(e) =>
                                  setCoins({
                                    ...coins,
                                    [`c${val}`]: parseInt(e.target.value || 0),
                                  })
                                }
                              />
                            </td>
                            <td className="text-center">
                              <img
                                src={`/src/assets/img/coin_${val}.jpg`}
                                alt={val}
                                width="30"
                              />
                            </td>
                            <td className="align-middle text-muted text-bold small">
                              {formatMoney(
                                parseFloat(
                                  val === "050"
                                    ? 0.5
                                    : val === "025"
                                    ? 0.25
                                    : val
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <hr />
                    <div className="bg-light p-3 rounded border shadow-sm">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small font-weight-bold text-muted">
                          TARJETAS:
                        </span>
                        <span className="text-bold">{formatMoney(cards)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small font-weight-bold text-primary">
                          MERCADO PAGO:
                        </span>
                        <span className="text-bold text-primary">
                          {formatMoney(mp)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="small font-weight-bold text-muted">
                          TRANSFERENCIAS:
                        </span>
                        <span className="text-bold">
                          {formatMoney(transfer)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-dark p-3 rounded mt-3 shadow">
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Total Efectivo:</span>{" "}
                        <b>{formatMoney(totalCash)}</b>
                      </div>
                      <div className="d-flex justify-content-between small text-info border-top pt-1 mt-1">
                        <span>Total Otros Medios:</span>{" "}
                        <b>{formatMoney(totalContado - totalCash)}</b>
                      </div>
                    </div>
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

export default CierreArqueo;
