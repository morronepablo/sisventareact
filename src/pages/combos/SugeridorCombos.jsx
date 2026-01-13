// src/pages/combos/SugeridorCombos.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const SugeridorCombos = () => {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Estados DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
    api
      .get("/alquimista/sugerencias")
      .then((res) => setSugerencias(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sugerencias.filter(
    (s) =>
      s.producto1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.producto2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-3">
        <div className="col-12">
          <h1 className="text-bold text-dark">
            <i className="fas fa-vials text-purple mr-2"></i> El Alquimista
            (Sugeridor de Combos)
          </h1>
          <p className="text-muted">
            Algoritmo de afinidad: detecta productos que tus clientes ya compran
            juntos.
          </p>
        </div>
      </div>

      <div className="card card-outline card-purple shadow">
        <div className="card-header">
          <h3 className="card-title text-bold">
            Oportunidades de Upselling Detectadas
          </h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <input
              type="search"
              className="form-control form-control-sm shadow-sm"
              style={{ width: "250px" }}
              placeholder="Buscar producto en afinidad..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="bg-navy text-white text-center">
                <tr>
                  <th>Pareja de Productos (A + B)</th>
                  <th>Ventas Juntos</th>
                  <th>Afinidad</th>
                  <th>Precio Actual</th>
                  <th className="bg-purple">Sugerencia Combo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((s, i) => (
                    <tr key={i}>
                      <td className="align-middle">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge badge-light p-2 border">
                            {s.producto1}
                          </span>
                          <i className="fas fa-plus text-muted mx-2"></i>
                          <span className="badge badge-light p-2 border">
                            {s.producto2}
                          </span>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <h5 className="mb-0 text-bold">{s.frecuencia}</h5>
                        <small className="text-muted">tickets</small>
                      </td>
                      <td className="text-center align-middle">
                        <div className="progress progress-xs mb-1">
                          <div
                            className="progress-bar bg-purple"
                            style={{ width: `${s.probabilidad * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-bold text-purple">
                          {s.probabilidad}%
                        </span>
                      </td>
                      <td className="text-center align-middle text-muted text-strike">
                        ${s.precio_actual}
                      </td>
                      <td className="text-center align-middle bg-light">
                        <span className="h5 text-bold text-success">
                          ${s.precio_sugerido}
                        </span>
                        <br />
                        <small className="text-success text-bold">
                          DTO. 10% RECOMENDADO
                        </small>
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-purple btn-sm shadow-sm text-bold"
                          onClick={() => navigate("/combos/crear")}
                        >
                          <i className="fas fa-magic mr-1"></i> CREAR COMBO
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      No hay afinidades suficientes aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <small>Mostrando {currentItems.length} sugerencias de BI</small>
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
                  onClick={() => setCurrentPage((p) => p + 1)}
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

export default SugeridorCombos;
