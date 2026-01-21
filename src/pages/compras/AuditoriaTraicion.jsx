// src/pages/compras/AuditoriaTraicion.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const AuditoriaTraicion = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const cargarAuditoria = async () => {
    try {
      const res = await api.get("/compras/auditoria-traicion");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAuditoria();
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = data.anomalias.filter(
    (a) =>
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.proveedor.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentItems = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
  );
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const formatMoney = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-3">
        <div className="col-md-8">
          <h1 className="text-bold text-dark">
            <i className="fas fa-handshake-slash text-danger mr-2"></i>{" "}
            Auditoría de Abastecimiento
          </h1>
          <p className="text-muted">
            Detectando facturas con aumentos abusivos sobre el promedio mensual
            ({data.promedio_tienda}%).
          </p>
        </div>
      </div>

      <div className="card card-outline card-danger shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            Detección de Anomalías en Compras
          </h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="bg-navy text-white text-center">
                <tr>
                  <th>Producto</th>
                  <th>Proveedor / Comprobante</th>
                  <th>Costo Ant.</th>
                  <th>Costo Factura</th>
                  <th>Aumento</th>
                  <th className="bg-danger">Traición (Brecha)</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((a, i) => (
                    <tr key={i}>
                      <td className="align-middle">
                        <b>{a.nombre}</b>
                      </td>
                      <td className="align-middle">
                        {a.proveedor} <br />
                        <small className="badge badge-secondary">
                          {a.comprobante}
                        </small>
                      </td>
                      <td className="text-center align-middle text-muted">
                        {formatMoney(a.costo_anterior)}
                      </td>
                      <td className="text-center align-middle text-bold">
                        {formatMoney(a.costo_nuevo)}
                      </td>
                      <td className="text-center align-middle">
                        <span className="text-danger text-bold">
                          +{a.aumento_producto}%
                        </span>
                      </td>
                      <td className="text-center align-middle bg-light">
                        <div
                          className="badge badge-danger p-2"
                          style={{ fontSize: "0.85rem" }}
                        >
                          +{a.brecha}% Extra
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      No se detectaron facturas sospechosas.
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

export default AuditoriaTraicion;
