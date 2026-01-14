// src/pages/proveedores/RankingProveedoresBI.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const RankingProveedoresBI = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarDatos = async () => {
    try {
      const res = await api.get("/proveedores/ranking-bi");
      setDatos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const formatARS = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  const filtered = datos.filter((p) =>
    p.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-3">
        <div className="col-12">
          <h1 className="text-bold text-dark">
            <i className="fas fa-handshake text-success mr-2"></i> El Negociador
            (Ranking BI)
          </h1>
          <p className="text-muted">
            Análisis de rentabilidad por proveedor basado en ventas de los
            últimos 6 meses.
          </p>
        </div>
      </div>

      <div className="card card-outline card-success shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">Proveedores más Rentables</h3>
        </div>

        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span>Mostrar</span>
              <select
                className="form-control form-control-sm mx-2"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
              <span>proveedores</span>
            </div>
            <input
              type="search"
              className="form-control form-control-sm shadow-sm"
              style={{ width: "250px" }}
              placeholder="Buscar proveedor..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead className="bg-dark text-center">
                <tr>
                  <th>Proveedor</th>
                  <th>Total Facturado</th>
                  <th>Ganancia Neta</th>
                  <th>Margen Promedio</th>
                  <th>Acción Sugerida</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr key={p.id}>
                      <td className="align-middle text-bold">{p.proveedor}</td>
                      <td className="text-center align-middle text-muted">
                        {formatARS(p.total_facturado)}
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className="text-bold text-success"
                          style={{ fontSize: "1.1rem" }}
                        >
                          {formatARS(p.utilidad_neta)}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="progress progress-xs mb-1 shadow-sm">
                          <div
                            className={`progress-bar ${
                              p.margen_promedio > 30
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                            style={{ width: `${p.margen_promedio}%` }}
                          ></div>
                        </div>
                        <span className="text-bold">{p.margen_promedio}%</span>
                      </td>
                      <td className="text-center align-middle">
                        {p.margen_promedio < 20 ? (
                          <span className="badge badge-danger p-2">
                            <i className="fas fa-exclamation-circle mr-1"></i>{" "}
                            RENEGOCIAR COSTOS
                          </span>
                        ) : p.margen_promedio > 35 ? (
                          <span className="badge badge-success p-2">
                            <i className="fas fa-star mr-1"></i> PROVEEDOR VITAL
                          </span>
                        ) : (
                          <span className="badge badge-info p-2">
                            MANTENER RELACIÓN
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No hay datos de proveedores para el período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small>
              Página {currentPage} de {totalPages}
            </small>
            <nav>
              <ul className="pagination pagination-sm m-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Anterior
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
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Siguiente
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

export default RankingProveedoresBI;
