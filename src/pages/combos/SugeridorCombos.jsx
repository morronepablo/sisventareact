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

  const fetchData = async () => {
    try {
      setLoading(true);
      // 🚀 CARGA HÍBRIDA: Traemos sugerencias y combos actuales para comparar
      const [resSugerencias, resCombos] = await Promise.all([
        api.get("/alquimista/sugerencias"),
        api.get("/combos"),
      ]);

      const sugRaw = resSugerencias.data;
      const combosActuales = resCombos.data;

      // 🧠 LÓGICA DE FILTRADO BI:
      // Filtramos las sugerencias que ya están cubiertas por un combo existente
      const filtradas = sugRaw.filter((s) => {
        const yaExisteEnCombo = combosActuales.some((combo) => {
          // Extraemos los IDs de los productos de este combo
          const idsEnCombo = combo.productos.map((p) => p.producto_id);
          // Si el combo contiene AMBOS productos de la sugerencia (id1 e id2), lo descartamos
          return idsEnCombo.includes(s.id1) && idsEnCombo.includes(s.id2);
        });
        return !yaExisteEnCombo;
      });

      setSugerencias(filtradas);
    } catch (err) {
      console.error("Error al sincronizar Alquimista:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = sugerencias.filter(
    (s) =>
      s.producto1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.producto2.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
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
            <b>Inteligencia Detectada:</b> El sistema ha filtrado las
            sugerencias que ya forman parte de tus combos actuales.
          </p>
        </div>
      </div>

      <div className="card card-outline card-purple shadow">
        <div className="card-header bg-white">
          <h3 className="card-title text-bold">
            Oportunidades de Upselling{" "}
            <span className="badge badge-purple ml-2">
              {sugerencias.length} nuevas
            </span>
          </h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <div
              className="input-group input-group-sm"
              style={{ width: "280px" }}
            >
              <input
                type="search"
                className="form-control shadow-sm"
                placeholder="Buscar producto en afinidad..."
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
            <table className="table table-bordered table-hover shadow-sm">
              <thead className="bg-navy text-white text-center">
                <tr>
                  <th style={{ width: "35%" }}>Pareja de Productos (A + B)</th>
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
                          <span className="badge badge-light p-2 border shadow-sm w-100 text-truncate mr-1">
                            {s.producto1}
                          </span>
                          <i className="fas fa-plus text-muted mx-2"></i>
                          <span className="badge badge-light p-2 border shadow-sm w-100 text-truncate ml-1">
                            {s.producto2}
                          </span>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <h5 className="mb-0 text-bold">{s.frecuencia}</h5>
                        <small
                          className="text-muted text-uppercase"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Tickets coincidentes
                        </small>
                      </td>
                      <td className="text-center align-middle">
                        <div
                          className="progress progress-xs mb-1"
                          style={{ height: "6px" }}
                        >
                          <div
                            className="progress-bar bg-purple"
                            style={{ width: `${s.probabilidad * 10}%` }}
                          ></div>
                        </div>
                        <span
                          className="text-bold text-purple"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {s.probabilidad}%
                        </span>
                      </td>
                      <td className="text-center align-middle text-muted text-strike">
                        <small>
                          ${" "}
                          {parseFloat(s.precio_actual).toLocaleString("es-AR")}
                        </small>
                      </td>
                      <td className="text-center align-middle bg-light font-weight-bold">
                        <span className="h5 text-bold text-success">
                          ${" "}
                          {parseFloat(s.precio_sugerido).toLocaleString(
                            "es-AR",
                          )}
                        </span>
                        <br />
                        <span
                          className="badge badge-success-light text-success"
                          style={{ fontSize: "0.65rem" }}
                        >
                          AHORRO 10% ESTIMADO
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-purple btn-sm shadow-sm text-bold btn-block"
                          onClick={() =>
                            navigate("/combos/crear", {
                              state: {
                                pre_prod1: s.id1,
                                pre_prod2: s.id2,
                                pre_precio: s.precio_sugerido,
                              },
                            })
                          }
                        >
                          <i className="fas fa-magic mr-1"></i> CREAR
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="p-4">
                        <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
                        <h4 className="text-bold">Estrategia Cubierta</h4>
                        <p className="text-muted">
                          Todas las combinaciones frecuentes ya han sido
                          convertidas en combos activos.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-sm text-muted">
              Mostrando {currentItems.length} sugerencias de inteligencia
              comercial
            </span>
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
