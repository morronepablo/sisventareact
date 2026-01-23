// src/pages/productos/AsistenteCompra.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const AsistenteCompra = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarPredicciones = async () => {
    try {
      const res = await api.get("/productos/asistente-compra");
      setDatos(res.data);
    } catch (err) {
      console.error("Error al cargar asistente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPredicciones();
  }, []);

  const formatMoney = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  // 🚀 CEREBRO DE ORDENAMIENTO CRONOLÓGICO (Staff Engineer Level)
  const procesados = useMemo(() => {
    // 1. Filtramos por búsqueda
    let filtrados = datos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // 2. Ordenamos GLOBALMENTE por Autonomía (Menor a Mayor)
    return filtrados.sort((a, b) => {
      // Prioridad 1: Autonomía (Días restantes)
      if (a.dias_autonomia !== b.dias_autonomia) {
        return a.dias_autonomia - b.dias_autonomia;
      }

      // Prioridad 2: Si tienen los mismos días, priorizamos por ROI (Rentabilidad de la inversión)
      return b.roi_proyectado - a.roi_proyectado;
    });
  }, [datos, searchTerm]);

  // Lógica de paginación sobre los datos YA ORDENADOS
  const totalPages = Math.ceil(procesados.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = procesados.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-6">
          <h1 className="m-0 text-dark text-bold">Asistente de Compra BI</h1>
        </div>
      </div>

      <div className="card card-outline card-primary shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            <i className="fas fa-robot mr-2 text-primary"></i>
            Sugerencias de Reabastecimiento (Prioridad Crítica Primero)
          </h3>
        </div>

        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <span>Mostrar</span>
              <select
                className="form-control form-control-sm mx-2 shadow-sm"
                style={{ width: "auto" }}
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
              <span>entradas</span>
            </div>
            <div
              className="input-group input-group-sm shadow-sm"
              style={{ width: "250px" }}
            >
              <input
                type="search"
                className="form-control"
                placeholder="Buscar producto..."
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
            <table className="table table-bordered table-hover table-striped shadow-sm">
              <thead className="thead-dark text-center text-sm">
                <tr>
                  <th style={{ width: "25%" }}>Producto / Clase BI</th>
                  <th>Stock Actual</th>
                  <th>Venta Prom.</th>
                  <th>Autonomía</th>
                  <th>Urgencia</th>
                  <th className="bg-primary">Sugerencia Compra</th>
                  <th>Inversión Est.</th>
                  <th className="bg-success">Ganancia Proyectada (ROI)</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr
                      key={p.id}
                      className={p.clase_bcg === "PERRO" ? "opacity-75" : ""}
                    >
                      <td className="align-middle">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div
                              className="text-bold text-uppercase"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {p.nombre}
                            </div>
                            <small className="text-muted font-weight-bold">
                              {p.codigo}
                            </small>
                          </div>
                          <div className="ml-2">
                            {p.clase_bcg === "ESTRELLA" && (
                              <span className="badge badge-warning shadow-sm px-2 py-1">
                                <i className="fas fa-star mr-1"></i> ESTRELLA
                              </span>
                            )}
                            {p.clase_bcg === "VACA LECHERA" && (
                              <span className="badge badge-primary shadow-sm px-2 py-1">
                                <i className="fas fa-hand-holding-usd mr-1"></i>{" "}
                                VACA
                              </span>
                            )}
                            {p.clase_bcg === "INCÓGNITA" && (
                              <span className="badge badge-info shadow-sm px-2 py-1">
                                <i className="fas fa-question-circle mr-1"></i>{" "}
                                INCÓGNITA
                              </span>
                            )}
                            {p.clase_bcg === "PERRO" && (
                              <span className="badge badge-secondary shadow-sm px-2 py-1">
                                <i className="fas fa-paw mr-1"></i> PERRO
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className="badge badge-secondary"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {p.stock_actual} <small>{p.unidad}</small>
                        </span>
                      </td>
                      <td className="text-center align-middle font-italic text-sm">
                        <div className="text-bold">{p.vpd}</div>
                        <small className="text-muted">{p.unidad}/día</small>
                      </td>
                      <td
                        className={`text-center align-middle text-bold ${p.dias_autonomia <= 7 ? "text-danger" : "text-primary"}`}
                      >
                        {p.dias_autonomia > 365
                          ? "+1 año"
                          : `${p.dias_autonomia} días`}
                      </td>
                      <td className="text-center align-middle">
                        {p.urgencia === "CRÍTICA" && (
                          <span className="badge badge-danger px-3 shadow-sm animate__animated animate__flash animate__infinite">
                            CRÍTICA
                          </span>
                        )}
                        {p.urgencia === "MEDIA" && (
                          <span className="badge badge-warning px-3 text-white shadow-sm">
                            MEDIA
                          </span>
                        )}
                        {p.urgencia === "BAJA" && (
                          <span className="badge badge-success px-3 shadow-sm">
                            BAJA
                          </span>
                        )}
                        {p.urgencia === "STOCK ESTANCADO" && (
                          <span className="badge badge-dark px-3 opacity-50">
                            ESTANCADO
                          </span>
                        )}
                      </td>
                      <td className="text-center align-middle bg-light font-weight-bold">
                        {p.sugerencia_compra > 0 ? (
                          <span
                            className={
                              p.clase_bcg === "ESTRELLA"
                                ? "text-warning"
                                : "text-primary"
                            }
                            style={{ fontSize: "1.05rem" }}
                          >
                            <i
                              className={`fas ${p.clase_bcg === "ESTRELLA" ? "fa-fire" : "fa-plus-circle"} mr-1`}
                            ></i>
                            {p.sugerencia_compra} {p.unidad}
                          </span>
                        ) : (
                          <span className="text-success">
                            <i className="fas fa-check-circle"></i> Cubierto
                          </span>
                        )}
                      </td>
                      <td className="text-center align-middle text-bold text-sm">
                        {p.inversion_estimada > 0
                          ? formatMoney(p.inversion_estimada)
                          : "-"}
                      </td>
                      <td className="text-center align-middle bg-light">
                        {p.roi_proyectado > 0 ? (
                          <div className="d-flex flex-column">
                            <span
                              className="text-success text-bold"
                              style={{ fontSize: "1rem" }}
                            >
                              {formatMoney(p.roi_proyectado)}
                            </span>
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Margen:{" "}
                              <span className="text-dark font-weight-bold">
                                {p.margen_percent}%
                              </span>
                            </small>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, procesados.length)} de{" "}
              {procesados.length} productos
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
                    onClick={() => setCurrentPage((p) => p + 1)}
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

export default AsistenteCompra;
