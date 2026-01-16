// src/pages/proveedores/SemaforoCumplimiento.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const SemaforoCumplimiento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/proveedores/bi/cumplimiento")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-8">
          <h1>
            <i className="fas fa-traffic-light text-warning mr-2"></i>
            <b>Semáforo de Cumplimiento</b>
          </h1>
          <p className="text-muted">
            Efectividad de entrega: Unidades Pedidas vs Unidades Reales
            Recibidas.
          </p>
        </div>
      </div>
      <hr />

      <div className="row">
        {/* TARJETAS DE RESUMEN */}
        <div className="col-md-4">
          <div className="info-box shadow-sm border-left-success">
            <span className="info-box-icon bg-success">
              <i className="fas fa-truck-fast"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text text-bold">
                Proveedores Cumplidores
              </span>
              <span className="info-box-number h3">
                {data.filter((p) => p.score >= 95).length}
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="info-box shadow-sm border-left-danger">
            <span className="info-box-icon bg-danger">
              <i className="fas fa-truck-arrow-right"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text text-bold">
                Proveedores Deficientes
              </span>
              <span className="info-box-number h3">
                {data.filter((p) => p.score < 80).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-outline card-primary shadow-sm mt-3">
        <div className="card-header">
          <h3 className="card-title text-bold">
            <i className="fas fa-clipboard-check mr-2"></i>Ranking de Fiabilidad
          </h3>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="thead-dark text-center">
              <tr>
                <th>Proveedor</th>
                <th>Órdenes Analizadas</th>
                <th>Pedido vs Recibido</th>
                <th>Nivel de Cumplimiento</th>
                <th>Semáforo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td className="align-middle px-3">
                    <b>{p.proveedor_nombre}</b>
                    <br />
                    <small className="text-muted">{p.contacto}</small>
                  </td>
                  <td className="text-center align-middle">
                    {p.total_pedidos} pedidos
                  </td>
                  <td className="text-center align-middle">
                    <span className="text-muted">
                      {p.total_unidades_pedidas}
                    </span>{" "}
                    /{" "}
                    <span className="text-bold">
                      {p.total_unidades_recibidas}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <div
                      className="progress progress-xs"
                      style={{ width: "100px", margin: "0 auto" }}
                    >
                      <div
                        className={`progress-bar bg-${
                          p.score >= 95
                            ? "success"
                            : p.score >= 80
                            ? "warning"
                            : "danger"
                        }`}
                        style={{ width: `${p.score}%` }}
                      ></div>
                    </div>
                    <span className={`text-bold ${p.color}`}>{p.score}%</span>
                  </td>
                  <td className="text-center align-middle">
                    <span
                      className={`badge p-2 shadow-sm ${
                        p.score >= 95
                          ? "badge-success"
                          : p.score >= 80
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                      style={{ minWidth: "110px" }}
                    >
                      <i className={`fas ${p.icono} mr-1`}></i> {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    Para ver este informe, debés procesar la recepción de al
                    menos una Orden de Compra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="alert bg-dark text-white mt-4 shadow border-left-warning">
        <h5>
          <i className="fas fa-robot text-warning mr-2"></i>
          <b>Inteligencia Logística:</b>
        </h5>
        Un proveedor en <b>ROJO</b> no solo te falta mercadería, te genera{" "}
        <b>Lucro Cesante</b> (ventas que no podés hacer porque no tenés el
        producto). Considerá cambiar de proveedor o renegociar condiciones si el
        score es menor al 80%.
      </div>
    </div>
  );
};

export default SemaforoCumplimiento;
