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

  // Totales sistema (Solo informativos)
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
            parseFloat(data.totales_sistema.total_transf_sistema) || 0,
          );
        }

        if (data.retiros) {
          const sumRetiros = data.retiros.reduce(
            (acc, curr) => acc + parseFloat(curr.monto),
            0,
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

  // 🚀 LÓGICA CORREGIDA: El total contado para el cierre es SOLO EL EFECTIVO 🚀
  const totalContadoEfectivo = totalCash;
  const totalOtrosMedios = cards + mp + transfer;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Preguntamos antes de proceder
    const confirm = await Swal.fire({
      title: "¿Confirmar cierre de caja?",
      text: "Se comparará tu efectivo contado contra el saldo esperado del sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      confirmButtonText: "Sí, cerrar ahora",
      cancelButtonText: "Revisar conteo",
    });

    if (confirm.isConfirmed) {
      try {
        // 2. Enviamos los datos al servidor
        const res = await api.put(`/arqueos/cierre/${id}`, {
          fecha_cierre: fechaCierre,
          monto_final: totalContadoEfectivo, // El efectivo físico contado
          ventas_efectivo: totalCash,
          ventas_tarjeta: cards,
          ventas_mercadopago: mp,
          ventas_transferencia: transfer,
        });

        if (res.data.success) {
          if (refreshAll) refreshAll();
          window.dispatchEvent(new Event("forceRefreshNotifications"));

          // 3. 🚀 LÓGICA DE AUDITORÍA VISUAL 🚀
          const dif = parseFloat(res.data.diferencia);
          let configAlerta = {
            icon: "success",
            title: "¡Caja Cerrada!",
            text: "El conteo coincide perfectamente con el sistema.",
            timer: 2000,
            showConfirmButton: false,
          };

          if (dif < 0) {
            // HAY FALTANTE
            configAlerta = {
              icon: "error",
              title: "CIERRE CON FALTANTE",
              html: `<h2 class="text-danger">${formatMoney(
                dif,
              )}</h2><p>El efectivo contado es menor al esperado por el sistema.</p>`,
              confirmButtonText: "Aceptar",
            };
          } else if (dif > 0) {
            // HAY SOBRANTE
            configAlerta = {
              icon: "warning",
              title: "CIERRE CON SOBRANTE",
              html: `<h2 class="text-warning">+ ${formatMoney(
                dif,
              )}</h2><p>Hay más efectivo en caja de lo que el sistema registró.</p>`,
              confirmButtonText: "Aceptar",
            };
          }

          // 4. Mostramos el resultado del "juicio" del arqueo
          await Swal.fire(configAlerta);

          // 5. Navegamos al listado
          navigate("/arqueos/listado");
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "No se pudo procesar el cierre. Verifique su conexión.",
          "error",
        );
      }
    }
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
          {/* COLUMNA IZQUIERDA */}
          <div className="col-md-4">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">Resumen de Cierre</h3>
              </div>
              <div className="card-body">
                <div className="alert alert-info py-2 small mb-3">
                  Declare únicamente el <b>efectivo físico</b> en el contador de
                  la derecha.
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs">FECHA APERTURA</label>
                  <div className="form-control form-control-sm bg-light">
                    {new Date(arqueoInfo.fecha_apertura).toLocaleString()}
                  </div>
                </div>

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
                    Efectivo Contado Actual
                  </label>
                  <div
                    className="h3 text-center p-3 rounded font-weight-bold shadow-sm"
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "2px dashed #28a745",
                      color: "#28a745",
                    }}
                  >
                    {formatMoney(totalContadoEfectivo)}
                  </div>
                </div>

                {totalRetiros > 0 && (
                  <div className="bg-warning p-2 rounded mb-3 text-center shadow-sm border border-warning">
                    <small className="d-block text-uppercase font-weight-bold text-dark">
                      Retiros de Seguridad
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
                <h3 className="card-title text-bold">
                  Contador de Efectivo Físico
                </h3>
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
                                      : val,
                                ),
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <hr />
                    {/* SECCIÓN INFORMATIVA (No suma al total principal) */}
                    <div className="bg-light p-3 rounded border shadow-sm">
                      <p className="text-center text-muted small text-bold mb-2">
                        SISTEMA (PARA INFORMAR)
                      </p>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small text-muted">TARJETAS:</span>
                        <span className="text-bold">{formatMoney(cards)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small text-primary">
                          MERCADO PAGO:
                        </span>
                        <span className="text-bold text-primary">
                          {formatMoney(mp)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="small text-muted">
                          TRANSFERENCIAS:
                        </span>
                        <span className="text-bold">
                          {formatMoney(transfer)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-dark p-3 rounded mt-3 shadow">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-success text-bold">
                          Total Efectivo:
                        </span>
                        <b
                          className="text-success"
                          style={{ fontSize: "1.2rem" }}
                        >
                          {formatMoney(totalCash)}
                        </b>
                      </div>
                      <div className="d-flex justify-content-between small text-info border-top pt-1 mt-1">
                        <span>Total Medios Digitales:</span>
                        <b>{formatMoney(totalOtrosMedios)}</b>
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
