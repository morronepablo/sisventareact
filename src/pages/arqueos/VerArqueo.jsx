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
    });
  };

  if (loading) return <div className="p-4">Cargando detalle...</div>;
  if (!data) return <div className="p-4">No se encontró el arqueo.</div>;

  const { arqueo, movimientos } = data;

  // Forzar conversión a números para evitar errores de cálculo
  const m_inicial = parseFloat(arqueo.monto_inicial || 0);
  const m_final = parseFloat(arqueo.monto_final || 0);

  // Filtrar y sumar movimientos
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

  // LÓGICA DE DIFERENCIA CORREGIDA
  // Saldo que debería haber = inicial + lo que entró - lo que salió
  const saldoEsperado = m_inicial + totalIngreso - totalEgreso;
  // Diferencia = Lo que realmente hay - Lo que debería haber
  const diferencia = m_final - saldoEsperado;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-12">
            <h1>
              <b>Detalle del Arqueo</b> - Usuario:{" "}
              {arqueo.usuario_nombre || "Admin"}
            </h1>
            <hr />
          </div>
        </div>

        <div className="row">
          {/* COLUMNA 1: DATOS REGISTRADOS */}
          <div className="col-md-3">
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-info">
                  <b>Datos Registrados</b>
                </h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Fecha Apertura</label>
                  <input
                    type="text"
                    className="form-control border-info bg-white"
                    value={formatDateTime(arqueo.fecha_apertura)}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Monto Inicial</label>
                  <input
                    type="text"
                    className="form-control border-info bg-white text-right"
                    value={formatMoney(m_inicial)}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Cierre</label>
                  <input
                    type="text"
                    className="form-control border-info bg-white"
                    value={
                      arqueo.fecha_cierre
                        ? formatDateTime(arqueo.fecha_cierre)
                        : "SIN CERRAR"
                    }
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Monto Final</label>
                  <input
                    type="text"
                    className="form-control border-info bg-white text-right"
                    value={formatMoney(m_final)}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    type="text"
                    className="form-control border-info bg-white"
                    value={arqueo.descripcion || ""}
                    disabled
                  />
                </div>
                <hr />
                <button
                  className="btn btn-secondary btn-block shadow-sm"
                  onClick={() => navigate("/arqueos/listado")}
                >
                  <i className="fas fa-reply"></i> Volver
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: INGRESOS */}
          <div className="col-md-4">
            <div className="card card-outline card-success shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-success">
                  <b>Ingresos</b>
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-bordered table-sm table-striped mb-0">
                  <thead className="thead-dark text-center">
                    <tr>
                      <th>Nro</th>
                      <th>Detalle</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.length > 0 ? (
                      ingresos.map((m, i) => (
                        <tr key={m.id}>
                          <td className="text-center">{i + 1}</td>
                          <td>{m.descripcion}</td>
                          <td className="text-right">{formatMoney(m.monto)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No hay ingresos
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" className="text-right text-success">
                        <b>Total Ingresos</b>
                      </td>
                      <td className="text-right text-success">
                        <b>{formatMoney(totalIngreso)}</b>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: EGRESOS */}
          <div className="col-md-5">
            <div className="card card-outline card-danger shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-danger">
                  <b>Egresos</b>
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-bordered table-sm table-striped mb-0">
                  <thead className="thead-dark text-center">
                    <tr>
                      <th>Nro</th>
                      <th>Detalle</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {egresos.length > 0 ? (
                      egresos.map((m, i) => (
                        <tr key={m.id}>
                          <td className="text-center">{i + 1}</td>
                          <td>{m.descripcion}</td>
                          <td className="text-right">{formatMoney(m.monto)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No hay egresos
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" className="text-right text-danger">
                        <b>Total Egresos</b>
                      </td>
                      <td className="text-right text-danger">
                        <b>{formatMoney(totalEgreso)}</b>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: DIFERENCIA */}
        <div className="row mt-3">
          <div className="col-md-5">
            <div className="card card-outline card-warning shadow-sm">
              <div className="card-body py-2">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <label className="mb-0 text-warning">
                      <b>Dif. (Final - [Inicial + Ingresos - Egresos])</b>
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className={`form-control text-right font-weight-bold bg-white ${
                        diferencia < 0 ? "text-danger" : "text-success"
                      }`}
                      value={formatMoney(diferencia)}
                      disabled
                    />
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
