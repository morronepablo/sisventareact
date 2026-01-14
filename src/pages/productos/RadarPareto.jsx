// src/pages/productos/RadarPareto.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const RadarPareto = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5); // 👈 5 filas por página
  const [currentPage, setCurrentPage] = useState(1);

  const cargarDatos = async () => {
    try {
      const res = await api.get("/productos/radar-pareto");
      setDatos(res.data);
    } catch (err) {
      console.error("Error al cargar radar:", err);
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

  // --- LÓGICA DE FILTRADO ---
  const filtered = datos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  if (loading) return <LoadingSpinner />;

  // Alertas para Clase A con Stock Crítico
  const alertasCriticas = datos.filter((p) => p.riesgoQuiebre);

  return (
    <div className="container-fluid pt-3 pb-5">
      <div className="row mb-3">
        <div className="col-12">
          <h1 className="text-bold text-dark">
            <i className="fas fa-bullseye text-danger mr-2"></i> Radar de Oro
            (Analítica ABC-D)
          </h1>
          <p className="text-muted">
            Auditoría total de inventario: Identifica tus productos vitales (
            <b>A</b>) y tus productos muertos (<b>D</b>).
          </p>
        </div>
      </div>

      {/* ALERTAS CRÍTICAS DE CLASE A */}
      <div className="row">
        {alertasCriticas.length > 0 &&
          alertasCriticas.slice(0, 3).map((p) => (
            <div className="col-md-4" key={p.id}>
              <div className="info-box bg-gradient-danger shadow zoomP">
                <span className="info-box-icon">
                  <i className="fas fa-fire"></i>
                </span>
                <div className="info-box-content">
                  <span className="info-box-text text-bold text-uppercase">
                    Riesgo Clase A
                  </span>
                  <span className="info-box-number">{p.nombre}</span>
                  <div className="progress">
                    <div
                      className="progress-bar bg-white"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <span className="progress-description small">
                    Stock: <b>{p.stock}</b> unidades.
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="card card-outline card-primary shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold text-primary">
            Análisis de Pareto Integral
          </h3>
        </div>

        <div className="card-body">
          {/* Cabecera DataTable */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <span>Mostrar</span>
              <select
                className="form-control form-control-sm mx-2 shadow-sm"
                style={{ width: "70px" }}
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>registros</span>
            </div>
            <div
              className="input-group input-group-sm"
              style={{ width: "250px" }}
            >
              <input
                type="search"
                className="form-control shadow-sm"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div className="input-group-append">
                <span className="input-group-text bg-white">
                  <i className="fas fa-search text-muted"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead className="bg-navy text-white text-center text-sm">
                <tr>
                  <th style={{ width: "80px" }}>Clase</th>
                  <th className="text-left">Producto</th>
                  <th>Facturación (90d)</th>
                  <th>Aporte %</th>
                  <th>Stock</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr key={p.id}>
                      <td className="text-center align-middle">
                        <div
                          className="h3 text-bold mb-0 shadow-sm rounded p-1"
                          style={{
                            backgroundColor: "#f4f6f9",
                            border: `2px solid ${p.color}`,
                            color: p.color,
                          }}
                        >
                          {p.clase}
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="text-bold">{p.nombre}</div>
                        <small className="text-muted">{p.codigo}</small>
                      </td>
                      <td className="text-center align-middle text-bold">
                        {formatARS(p.facturacion_acumulada)}
                      </td>
                      <td className="text-center align-middle">
                        <div className="badge badge-light border shadow-sm px-3">
                          {p.porcentaje_aporte}%
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`h5 text-bold ${
                            p.stock <= p.stock_minimo
                              ? "text-danger"
                              : "text-success"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        {p.clase === "A" ? (
                          <span
                            className="badge p-2 shadow-sm"
                            style={{
                              backgroundColor: "#FFD700",
                              color: "#000",
                            }}
                          >
                            <i className="fas fa-crown mr-1"></i> PRODUCTO ORO
                          </span>
                        ) : p.clase === "B" ? (
                          <span
                            className="badge p-2 bg-silver shadow-sm text-dark"
                            style={{ backgroundColor: "#C0C0C0" }}
                          >
                            PRODUCTO PLATA
                          </span>
                        ) : p.clase === "C" ? (
                          <span
                            className="badge p-2 shadow-sm text-white"
                            style={{ backgroundColor: "#CD7F32" }}
                          >
                            PRODUCTO BRONCE
                          </span>
                        ) : (
                          <span className="badge p-2 bg-dark shadow-sm opacity-5">
                            <i className="fas fa-ghost mr-1"></i> STOCK INERTE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No hay productos que mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer DataTable */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, filtered.length)} de {filtered.length}{" "}
              productos
            </div>
            <nav>
              <ul className="pagination pagination-sm m-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
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
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="card-footer bg-transparent border-top">
          <div className="row text-center text-xs text-uppercase font-weight-bold">
            <div className="col-md-3">
              <i className="fas fa-circle text-warning mr-1"></i> Clase A (80%)
            </div>
            <div className="col-md-3">
              <i className="fas fa-circle text-secondary mr-1"></i> Clase B
              (15%)
            </div>
            <div className="col-md-3">
              <i
                className="fas fa-circle mr-1"
                style={{ color: "#CD7F32" }}
              ></i>{" "}
              Clase C (5%)
            </div>
            <div className="col-md-3 text-muted">
              <i className="fas fa-circle text-dark mr-1"></i> Clase D (0%
              Muertos)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarPareto;
