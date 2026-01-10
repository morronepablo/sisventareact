// src/pages/proveedores/informes/InformeCuentasPorPagar.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const InformeCuentasPorPagar = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  useEffect(() => {
    api
      .get("/proveedores/informes/cuentas-por-pagar")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePDF = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${API_URL}/api/proveedores/informes/cuentas-por-pagar-pdf?token=${token}`,
      "_blank"
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Cuentas por Pagar (Proveedores)</b>
        </h1>
        <hr />
        <div className="card card-primary card-outline shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-bold">
              Saldos Adeudados por Proveedor
            </h3>
            <button
              className="btn btn-primary btn-sm float-right"
              onClick={handlePDF}
            >
              <i className="fas fa-file-pdf"></i> Exportar PDF
            </button>
          </div>
          <div className="card-body">
            <table className="table table-bordered table-striped table-hover">
              <thead className="thead-dark text-center">
                <tr>
                  <th>#</th>
                  <th>Proveedor / Marca</th>
                  <th>Facturas Pend.</th>
                  <th>Monto Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td className="text-center">{i + 1}</td>
                    <td>
                      <b>{d.empresa}</b>
                      <br />
                      <small className="badge badge-secondary">{d.marca}</small>
                    </td>
                    <td className="text-center">{d.facturas_pendientes}</td>
                    <td className="text-right text-danger font-weight-bold">
                      $ {parseFloat(d.saldo_pendiente).toLocaleString("es-AR")}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() =>
                          (window.location.href = `/proveedores/pagos/${d.id}`)
                        }
                      >
                        <i className="fas fa-money-bill-wave"></i> Ir a Pagar
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No existen deudas con proveedores.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformeCuentasPorPagar;
