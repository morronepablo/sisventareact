// src/pages/productos/AsistenteCompra.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
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

  const filtered = datos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

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
            Sugerencias de Reabastecimiento (31 de 31 productos)
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
            <table className="table table-bordered table-hover table-striped">
              <thead className="thead-dark text-center text-sm">
                <tr>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Venta Prom.</th>
                  <th>Autonomía</th>
                  <th>Urgencia</th>
                  <th className="bg-primary">Sugerencia Compra</th>
                  <th>Inversión Est.</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr key={p.id}>
                      <td className="align-middle">
                        <div className="text-bold">{p.nombre}</div>
                        <small className="text-muted">{p.codigo}</small>
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
                        {p.vpd} <small>{p.unidad}/día</small>
                      </td>
                      <td className="text-center align-middle text-bold text-primary">
                        {p.dias_autonomia > 365
                          ? "+1 año"
                          : `${p.dias_autonomia} días`}
                      </td>
                      <td className="text-center align-middle">
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
                          <span className="badge badge-success px-3">BAJA</span>
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
                      <td className="text-center align-middle text-bold text-sm">
                        {p.inversion_estimada > 0
                          ? formatMoney(p.inversion_estimada)
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
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
      </div>
    </div>
  );
};

export default AsistenteCompra;
