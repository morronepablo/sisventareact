// src/pages/ventas/AuditorIntegridad.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const AuditorIntegridad = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de investigación
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [usuarioSel, setUsuarioSel] = useState("");

  const cargarDatos = () => {
    api
      .get("/auditoria/integridad")
      .then((res) => setDatos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const verDetallesBorrados = async (uId, uNombre) => {
    setUsuarioSel(uNombre);
    setCargandoDetalle(true);
    window.$("#modal-detalle-borrados").modal("show");

    try {
      const res = await api.get(`/auditoria/integridad/detalle/${uId}`);
      setDetalles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoDetalle(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <h1 className="text-bold">
        <i className="fas fa-user-shield text-navy mr-2"></i> Auditoría de
        Integridad de Tickets
      </h1>
      <p className="text-muted">
        Detección de patrones sospechosos y prevención de robo interno.
      </p>

      <div className="card card-outline card-navy shadow">
        <div className="card-header">
          <h3 className="card-title text-bold">
            Ranking de Riesgo por Operador
          </h3>
        </div>
        <div className="card-body p-0">
          <table className="table table-bordered table-striped m-0">
            <thead className="bg-navy">
              <tr className="text-center">
                <th>Usuario</th>
                <th>Nivel de Riesgo</th>
                <th>Items Borrados del Carrito</th>
                <th>Tickets en $0</th>
                <th>Descuentos {">"} 20%</th>
                <th>Puntaje Incidencia</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((u, i) => (
                <tr key={i}>
                  <td className="align-middle px-3">
                    <b>{u.usuario}</b>
                  </td>
                  <td className="text-center align-middle">
                    <span className={`badge badge-${u.color} p-2 px-3`}>
                      {u.riesgo}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    {/* 🚀 AHORA ES UN LINK DE INVESTIGACIÓN 🚀 */}
                    <button
                      className="btn btn-link text-bold p-0"
                      style={{ fontSize: "1.1rem" }}
                      onClick={() =>
                        verDetallesBorrados(u.usuario_id, u.usuario)
                      }
                      title="Click para ver qué productos borró"
                    >
                      {u.borrados}
                    </button>
                    <br />
                    <small className="text-danger">
                      ($ {parseFloat(u.monto_borrados).toLocaleString()})
                    </small>
                  </td>
                  <td className="text-center align-middle text-bold">
                    {u.tickets_cero}
                  </td>
                  <td className="text-center align-middle text-bold">
                    {u.descuentos_altos}
                  </td>
                  <td
                    className="text-center align-middle"
                    style={{ width: "150px" }}
                  >
                    <div className="progress progress-xs">
                      <div
                        className={`progress-bar bg-${u.color}`}
                        style={{ width: `${Math.min(u.puntos, 100)}%` }}
                      ></div>
                    </div>
                    <small>{u.puntos} pts</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🕵️‍♂️ MODAL DE INVESTIGACIÓN FORENSE 🕵️‍♂️ */}
      <div className="modal fade" id="modal-detalle-borrados" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-navy text-white">
              <h5 className="modal-title font-weight-bold">
                <i className="fas fa-search mr-2"></i> Historial de Borrados:{" "}
                {usuarioSel}
              </h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body p-0">
              {cargandoDetalle ? (
                <div className="p-5 text-center">
                  <div className="spinner-border text-navy"></div>
                </div>
              ) : (
                // 🚀 CONTENEDOR CON SCROLL AGREGADO 🚀
                <div
                  className="table-responsive"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <table className="table table-sm table-hover table-striped mb-0">
                    <thead
                      className="bg-light"
                      style={{ position: "sticky", top: 0, zIndex: 1 }}
                    >
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Detalle de la Acción</th>
                        <th className="text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((d, i) => (
                        <tr key={i}>
                          <td className="px-3 text-nowrap">
                            {new Date(d.created_at).toLocaleString()}
                          </td>
                          <td>{d.detalle}</td>
                          <td className="text-right text-bold text-danger px-3">
                            ${" "}
                            {parseFloat(d.monto_afectado).toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                        </tr>
                      ))}
                      {detalles.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center p-4">
                            No se encontraron registros detallados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <div className="text-muted small mr-auto">
                <i className="fas fa-camera mr-1"></i> Sugerencia: Compare estos
                horarios con sus grabaciones.
              </div>
              <button className="btn btn-secondary" data-dismiss="modal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorIntegridad;
