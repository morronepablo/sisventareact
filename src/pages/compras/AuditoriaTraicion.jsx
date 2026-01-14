// src/pages/compras/AuditoriaTraicion.jsx
/* eslint-disable no-undef */
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
      a.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const formatMoney = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-3">
        <div className="col-md-8">
          <h1 className="text-bold text-dark">
            <i className="fas fa-exclamation-circle text-danger mr-2"></i>{" "}
            Alerta de Traición
          </h1>
          <p className="text-muted">
            Detecta aumentos excesivos comparados con la inflación promedio de
            tu local (<b>{data.promedio_tienda}%</b>).
          </p>
        </div>
      </div>

      <div className="card card-outline card-danger shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            Aumentos por encima del promedio
          </h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <input
              type="search"
              className="form-control form-control-sm shadow-sm"
              style={{ width: "250px" }}
              placeholder="Buscar proveedor o producto..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="bg-dark text-center">
                <tr>
                  <th>Producto</th>
                  <th>Proveedor</th>
                  <th>Costo Anterior</th>
                  <th>Costo Nuevo</th>
                  <th>Aumento</th>
                  <th className="bg-danger">Traición (Brecha)</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((a, i) => (
                    <tr key={i}>
                      <td className="align-middle text-bold">{a.nombre}</td>
                      <td className="align-middle">{a.proveedor}</td>
                      <td className="text-center align-middle text-muted">
                        {formatMoney(a.costo_anterior)}
                      </td>
                      <td className="text-center align-middle text-bold">
                        {formatMoney(a.costo_nuevo)}
                      </td>
                      <td className="text-center align-middle">
                        <span className="text-danger">
                          {a.aumento_producto}%
                        </span>
                      </td>
                      <td className="text-center align-middle bg-light">
                        <div
                          className="badge badge-danger p-2"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <i className="fas fa-arrow-up mr-1"></i> +{a.brecha}%
                          extra
                        </div>
                        <br />
                        <small className="text-muted">
                          Sobre el promedio del local
                        </small>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      No se detectaron aumentos abusivos este mes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="d-flex justify-content-between mt-3">
            <small>Mostrando {currentItems.length} alertas críticas</small>
            <nav>
              <ul className="pagination pagination-sm m-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Ant.
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(p + 1)}
                  >
                    Sig.
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditoriaTraicion;
