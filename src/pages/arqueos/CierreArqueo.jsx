// src/pages/arqueos/CierreArqueo.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const CierreArqueo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [arqueoInfo, setArqueoInfo] = useState(null);

  // Función para obtener la fecha local actual en formato YYYY-MM-DDTHH:mm
  const getLocalNow = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  // Función para convertir cualquier fecha de la DB a local para el input
  const formatToLocalDatetime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  // Estados para el conteo de dinero
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
  const [coins, setCoins] = useState({
    c2: 0,
    c1: 0,
    c050: 0,
    c025: 0,
  });

  const [cards, setCards] = useState(0);
  const [mp, setMp] = useState(0);

  // CORRECCIÓN: Inicializamos con la hora local de Buenos Aires
  const [fechaCierre, setFechaCierre] = useState(getLocalNow());

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await api.get(`/arqueos/${id}`);
        setArqueoInfo(response.data.arqueo);
        setLoading(false);
      } catch (error) {
        navigate("/arqueos/listado");
      }
    };
    fetchInfo();
  }, [id, navigate]);

  // Cálculos automáticos
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

  const totalFinal = totalCash + parseFloat(cards || 0) + parseFloat(mp || 0);

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/arqueos/cierre/${id}`, {
        fecha_cierre: fechaCierre,
        monto_final: totalFinal,
        ventas_efectivo: totalCash,
        ventas_tarjeta: cards,
        ventas_mercadopago: mp,
      });
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Arqueo cerrado.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/arqueos/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo cerrar el arqueo", "error");
    }
  };

  if (loading) return <div className="p-4">Cargando datos de cierre...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Cierre de un arqueo</b>
        </h1>
        <hr />
        <br />

        <div className="row">
          <div className="col-md-4">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title">Datos de Cierre</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Fecha Apertura</label>
                    {/* CORRECCIÓN: Mostramos la apertura también en hora local */}
                    <input
                      type="datetime-local"
                      className="form-control bg-light"
                      value={formatToLocalDatetime(arqueoInfo.fecha_apertura)}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Monto Inicial</label>
                    <input
                      type="text"
                      className="form-control text-right bg-light"
                      value={formatMoney(arqueoInfo.monto_inicial)}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Fecha Cierre <b className="text-danger">*</b>
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={fechaCierre}
                      onChange={(e) => setFechaCierre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Monto Final (Calculado)</label>
                    <input
                      type="text"
                      className="form-control text-right font-weight-bold"
                      style={{ backgroundColor: "#ffc107", color: "black" }}
                      value={formatMoney(totalFinal)}
                      readOnly
                    />
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/arqueos/listado")}
                    >
                      <i className="fas fa-reply"></i> Volver
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-lock"></i> Registrar Cierre
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title">Contador de Dinero</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h5 className="text-success border-bottom pb-2">
                      Billetes
                    </h5>
                    <table className="table table-sm table-bordered">
                      <tbody>
                        {[
                          20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10,
                          5,
                        ].map((val) => (
                          <tr key={val}>
                            <td width="100">
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
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
                                width="70"
                              />
                            </td>
                            <td className="text-right small">
                              {formatMoney(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-success border-bottom pb-2">
                      Monedas y Otros
                    </h5>
                    <table className="table table-sm table-bordered">
                      <tbody>
                        {[2, 1, "050", "025"].map((val) => (
                          <tr key={val}>
                            <td width="100">
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
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
                            <td className="text-right small">
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
                        <tr className="bg-light">
                          <td colSpan="2" className="align-middle">
                            <b>Total Tarjetas</b>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm text-right"
                              value={cards}
                              onChange={(e) => setCards(e.target.value)}
                            />
                          </td>
                        </tr>
                        <tr className="bg-light">
                          <td colSpan="2" className="align-middle">
                            <b>Total Mercado Pago</b>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm text-right"
                              value={mp}
                              onChange={(e) => setMp(e.target.value)}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="row mt-4 border rounded p-2 bg-light shadow-sm">
                      <div className="col-12">
                        <label className="small">Resumen de Contado:</label>
                      </div>
                      <div className="col-4 text-center small">
                        Efectivo
                        <br />
                        <b>{formatMoney(totalCash)}</b>
                      </div>
                      <div className="col-4 text-center small">
                        Tarjetas
                        <br />
                        <b>{formatMoney(parseFloat(cards || 0))}</b>
                      </div>
                      <div className="col-4 text-center small">
                        M. Pago
                        <br />
                        <b>{formatMoney(parseFloat(mp || 0))}</b>
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
