// src/pages/productos/AsistenteCompra.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const AsistenteCompra = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el DataTable
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

  const formatARS = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  // Lógica de Filtrado
  const filteredDatos = datos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de Paginación
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredDatos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDatos.length / entriesPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-6">
          <h1 className="m-0 text-dark">Asistente de Compra BI</h1>
        </div>
      </div>

      <div className="card card-outline card-primary shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            <i className="fas fa-robot mr-2 text-primary"></i>
            Sugerencias de Reabastecimiento
          </h3>
        </div>

        <div className="card-body">
          {/* Cabecera del DataTable */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <span>Mostrar</span>
              <select
                className="form-control form-control-sm mx-2"
                style={{ width: "auto" }}
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entradas</span>
            </div>
            <div className="d-flex align-items-center">
              <span>Buscar:</span>
              <input
                type="search"
                className="form-control form-control-sm ml-2"
                placeholder="Nombre o código..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped dataTable">
              <thead>
                <tr className="bg-light">
                  <th>Producto</th>
                  <th className="text-center">Stock Actual</th>
                  <th className="text-center">Venta Prom.</th>
                  <th className="text-center">Autonomía</th>
                  <th className="text-center">Urgencia</th>
                  <th className="text-center bg-primary text-white">
                    Sugerencia Compra
                  </th>
                  <th className="text-center">Inversión Est.</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="text-bold">{p.nombre}</div>
                        <small className="text-muted">{p.codigo}</small>
                      </td>
                      <td className="text-center">
                        <span
                          className="badge badge-secondary"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {p.stock_actual} <small>{p.unidad}</small>
                        </span>
                      </td>
                      <td className="text-center font-italic">{p.vpd} / día</td>
                      <td className="text-center text-bold text-primary">
                        {p.dias_autonomia > 365
                          ? "+1 año"
                          : `${p.dias_autonomia} días`}
                      </td>
                      <td className="text-center">
                        {p.urgencia === "CRÍTICA" && (
                          <span className="badge badge-danger px-3">
                            CRÍTICA
                          </span>
                        )}
                        {p.urgencia === "MEDIA" && (
                          <span className="badge badge-warning px-3 text-white">
                            MEDIA
                          </span>
                        )}
                        {p.urgencia === "BAJA" && (
                          <span className="badge badge-success px-3 text-white">
                            BAJA
                          </span>
                        )}
                        {p.urgencia === "STOCK ESTANCADO" && (
                          <span className="badge badge-dark px-3">
                            ESTANCADO
                          </span>
                        )}
                      </td>
                      <td className="text-center bg-light font-weight-bold">
                        {p.sugerencia_compra > 0 ? (
                          <span
                            className="text-primary"
                            style={{ fontSize: "1.1rem" }}
                          >
                            <i className="fas fa-plus-circle mr-1"></i>{" "}
                            {p.sugerencia_compra} {p.unidad}
                          </span>
                        ) : (
                          <span className="text-success">
                            <i className="fas fa-check-circle"></i> Cubierto
                          </span>
                        )}
                      </td>
                      <td className="text-center text-bold">
                        {p.inversion_estimada > 0
                          ? formatARS(p.inversion_estimada)
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No se encontraron productos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer del DataTable */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, filteredDatos.length)} de{" "}
              {filteredDatos.length} entradas
            </div>
            <div className="pagination">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsistenteCompra;
