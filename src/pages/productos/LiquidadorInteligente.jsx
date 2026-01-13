// src/pages/productos/LiquidadorInteligente.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const LiquidadorInteligente = () => {
  const [datos, setDatos] = useState([]);
  const [totalInmovilizado, setTotalInmovilizado] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados del DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarDatos = async () => {
    try {
      const res = await api.get("/productos/liquidador-inteligente");
      setDatos(res.data.productos);
      setTotalInmovilizado(res.data.capitalTotalInmovilizado);
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

  // Filtrado y Paginación
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
      <div className="row mb-3">
        <div className="col-md-8">
          <h1
            className="m-0 text-dark text-bold text-uppercase"
            style={{ fontSize: "1.5rem" }}
          >
            <i className="fas fa-hourglass-end mr-2 text-danger"></i> Liquidador
            Inteligente
          </h1>
          <p className="text-muted">
            Productos con stock físico sin ventas en los últimos 60 días.
          </p>
        </div>
        <div className="col-md-4">
          <div className="small-box bg-gradient-danger shadow">
            <div className="inner">
              <h3>{formatARS(totalInmovilizado)}</h3>
              <p>DINERO DORMIDO (Costo Total)</p>
            </div>
            <div className="icon">
              <i className="fas fa-hand-holding-usd"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-outline card-danger shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">Inventario Estancado</h3>
        </div>

        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span>Mostrar</span>
              <select
                className="form-control form-control-sm mx-2"
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
              </select>
              <span>registros</span>
            </div>
            <input
              type="search"
              className="form-control form-control-sm shadow-sm"
              style={{ width: "250px" }}
              placeholder="Buscar producto estancado..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead className="thead-dark text-center">
                <tr>
                  <th>Producto / Categoría</th>
                  <th>Stock</th>
                  <th>Días Inmóvil</th>
                  <th>Capital Atrapado</th>
                  <th className="bg-danger">Sugerencia BI</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr key={p.id}>
                      <td className="align-middle">
                        <div className="text-bold">{p.nombre}</div>
                        <small className="text-muted">
                          {p.categoria_nombre}
                        </small>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-warning text-dark px-2">
                          {p.stock} {p.unidad_nombre}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="text-bold text-danger">
                          {p.dias_estancado} días
                        </div>
                        <small className="text-muted">Sin movimientos</small>
                      </td>
                      <td className="text-center align-middle text-bold">
                        {formatARS(p.capital_inmovilizado)}
                      </td>
                      <td className="text-center align-middle bg-light">
                        <span
                          className="badge badge-danger p-2"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <i className="fas fa-bolt mr-1"></i> {p.sugerencia}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-primary btn-sm shadow-sm"
                          onClick={() =>
                            (window.location.href = `/productos/promociones`)
                          }
                        >
                          <i className="fas fa-percentage mr-1"></i> Liquidar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-5 text-center text-muted">
                      <h4>¡Tu stock tiene excelente rotación!</h4>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small>
              Mostrando del {indexOfFirstItem + 1} al{" "}
              {Math.min(indexOfLastItem, filtered.length)} de {filtered.length}{" "}
              productos
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

export default LiquidadorInteligente;
