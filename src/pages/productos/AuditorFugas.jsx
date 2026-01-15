// src/pages/productos/AuditorFugas.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // 👈 Importamos Link para la navegación interna
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const AuditorFugas = () => {
  const [anomalias, setAnomalias] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarAnomalias = async () => {
    try {
      const res = await api.get("/auditoria/anomalias");
      setAnomalias(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAnomalias();
  }, []);

  const formatMoney = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3 pb-5">
      <h1 className="text-bold text-dark">
        <i className="fas fa-user-secret text-danger mr-2"></i> Auditor de Fugas
      </h1>
      <p className="text-muted">
        Detección de patrones inusuales para revisión de cámaras de seguridad.
      </p>

      <div className="row">
        {/* PANEL DE DEVOLUCIONES SOSPECHOSAS */}
        <div className="col-md-6">
          <div className="card card-outline card-danger shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">
                <i className="fas fa-undo-alt mr-2"></i> Ráfagas de Devoluciones
              </h3>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-light">
                    <th>Usuario / Caja</th>
                    <th>Cantidad</th>
                    <th>Horario Sugerido Cámara</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalias.devoluciones_sospechosas.length > 0 ? (
                    anomalias.devoluciones_sospechosas.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <b>{d.usuario_nombre}</b> <br />{" "}
                          <small>Caja {d.caja_id}</small>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-danger">
                            {d.cantidad_devoluciones} en 1h
                          </span>
                        </td>
                        <td className="text-danger text-bold">
                          {new Date(d.inicio_periodo).toLocaleTimeString()} -{" "}
                          {new Date(d.fin_periodo).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-3 text-muted">
                        Sin ráfagas detectadas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PANEL DE FALTANTES DE DINERO */}
        <div className="col-md-6">
          <div className="card card-outline card-warning shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">
                <i className="fas fa-search-dollar mr-2"></i> Faltantes en
                Arqueos
              </h3>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-light">
                    <th>Usuario</th>
                    <th>Diferencia</th>
                    <th>Fecha Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalias.arqueos_con_faltante.length > 0 ? (
                    anomalias.arqueos_con_faltante.map((a, i) => (
                      <tr key={i}>
                        <td>{a.usuario_nombre}</td>
                        <td className="text-danger text-bold">
                          {formatMoney(a.diferencia)}
                        </td>
                        <td>{new Date(a.fecha_cierre).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-3 text-muted">
                        Sin faltantes críticos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        {/* VENTAS FUERA DE HORARIO */}
        <div className="col-12">
          <div className="card card-outline card-dark shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">
                <i className="fas fa-moon mr-2"></i> Ventas en Horarios
                Inusuales
              </h3>
            </div>
            <div className="card-body p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>ID Venta</th>
                    <th>Cajero</th>
                    <th>Caja</th>
                    <th>Monto</th>
                    <th>Hora Exacta</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalias.horarios_extranos.map((v, i) => (
                    <tr key={i}>
                      <td className="align-middle">
                        {/* 🚀 LINK AL DETALLE DE LA VENTA 🚀 */}
                        <Link
                          to={`/ventas/ver/${v.id}`}
                          className="text-bold text-info"
                          title="Click para ver detalle de la venta"
                        >
                          <i className="fas fa-search mr-1"></i>
                          T-{String(v.id).padStart(8, "0")}
                        </Link>
                      </td>
                      <td className="align-middle">{v.usuario_nombre}</td>
                      <td className="align-middle">Caja {v.caja_id}</td>
                      <td className="text-bold align-middle">
                        {formatMoney(v.precio_total)}
                      </td>
                      <td className="text-primary text-bold align-middle">
                        {new Date(v.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {anomalias.horarios_extranos.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-3 text-muted">
                        No se detectaron ventas en horarios inusuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorFugas;
