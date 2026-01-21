// src/pages/proveedores/RankingProveedoresBI.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const dataTableStyles = `
  .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  .dataTables_paginate { padding: 10px 15px !important; }
`;

const RankingProveedoresBI = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
    api
      .get("/proveedores/ranking-bi")
      .then((res) => {
        setDatos(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = datos.filter((p) =>
    p.proveedor.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
  );

  const formatARS = (val) =>
    `$ ${parseFloat(val).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{dataTableStyles}</style>
      <h1>
        <i className="fas fa-handshake text-success mr-2"></i>
        <b>El Negociador (Ranking BI)</b>
      </h1>
      <p className="text-muted">
        Ranking basado en el <b>rendimiento de la inversión</b> por proveedor.
      </p>
      <hr />

      <div className="card card-outline card-success shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            Performance de Cartera de Proveedores
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="d-flex justify-content-between p-3">
            <div className="small text-muted">
              Mostrando {currentItems.length} de {filtered.length} proveedores
            </div>
            <input
              type="text"
              className="form-control form-control-sm w-25 shadow-sm"
              placeholder="Buscar proveedor..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <table className="table table-striped table-hover m-0">
            <thead className="thead-dark text-center text-sm">
              <tr>
                <th>Proveedor / Variedad</th>
                <th>Inversión Real</th>
                <th>Utilidad Generada</th>
                <th style={{ width: "20%" }}>Margen ROI</th>
                <th>Estado del Vínculo</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => (
                <tr key={p.id}>
                  <td className="align-middle px-3">
                    <div className="text-bold">{p.proveedor}</div>
                    <small className="badge badge-light border">
                      {p.variedad} productos provistos
                    </small>
                  </td>
                  <td className="text-right align-middle text-muted">
                    {formatARS(p.total_facturado - p.utilidad_neta)}
                  </td>
                  <td
                    className="text-right align-middle text-success font-weight-bold"
                    style={{ fontSize: "1rem" }}
                  >
                    {formatARS(p.utilidad_neta)}
                  </td>
                  <td className="text-center align-middle">
                    <div
                      className="progress progress-xxs mb-1"
                      style={{ height: "6px" }}
                    >
                      <div
                        className={`progress-bar bg-${p.margen_promedio > 40 ? "success" : "warning"}`}
                        style={{ width: `${p.margen_promedio}%` }}
                      ></div>
                    </div>
                    <span className="text-bold small">
                      {p.margen_promedio}%
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span
                      className={`badge p-2 shadow-sm ${p.margen_promedio < 20 ? "badge-danger" : p.margen_promedio > 45 ? "badge-success" : "badge-info"}`}
                    >
                      {p.margen_promedio < 20
                        ? "COSTOS ALTOS"
                        : p.margen_promedio > 45
                          ? "PROVEEDOR ORO"
                          : "RELACIÓN ESTABLE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-end p-3 border-top card-table-container">
            <ul className="pagination pagination-sm m-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Ant.
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
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
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Sig.
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingProveedoresBI;
