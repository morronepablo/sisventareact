// src/pages/productos/GuardianMargenes.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const GuardianMargenes = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Estados para la lógica del DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5); // 👈 Por defecto 5
  const [currentPage, setCurrentPage] = useState(1);

  const cargarAlertas = async () => {
    try {
      const res = await api.get("/productos/auditoria-margenes");
      setAlertas(res.data);
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const aplicarSugerencia = async (id, nombre, precioSugerido) => {
    const result = await Swal.fire({
      title: "¿Proteger Margen?",
      html: `Se actualizará <b>${nombre}</b> al precio de <b>$${precioSugerido}</b>.<br><small className="text-muted">Sincroniza costo y porcentaje de categoría.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, corregir precio",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Sincronizando...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        const res = await api.put(`/productos/guardian-fix/${id}`);
        if (res.data.success) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "¡Sincronizado!",
            text: "El precio y el porcentaje ahora coinciden perfectamente.",
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          }).then(() => {
            cargarAlertas();
            navigate("/productos/guardian-margenes");
          });
        }
      } catch (err) {
        Swal.fire("Error", "No se pudo aplicar la sincronización.", "error");
      }
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredAlertas = alertas.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredAlertas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlertas.length / entriesPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-2">
        <div className="col-sm-6">
          <h1 className="m-0 text-dark text-bold">Guardián de Márgenes</h1>
        </div>
      </div>

      <div className="card card-outline card-danger shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold text-danger">
            <i className="fas fa-shield-alt mr-2"></i> Auditoría de Rentabilidad
            Crítica
          </h3>
        </div>

        <div className="card-body">
          {/* Cabecera del DataTable */}
          <div className="row mb-3">
            <div className="col-md-6 d-flex align-items-center">
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
            <div className="col-md-6 d-flex justify-content-end align-items-center">
              <span>Buscar:</span>
              <input
                type="search"
                className="form-control form-control-sm ml-2 shadow-sm"
                placeholder="Producto o categoría..."
                style={{ width: "200px" }}
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
            <table className="table table-bordered table-hover table-striped">
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "30%" }}>Producto</th>
                  <th>Costo</th>
                  <th>Venta</th>
                  <th>Margen Real</th>
                  <th>Objetivo</th>
                  <th className="bg-danger">Sugerencia</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr key={p.id}>
                      <td className="align-middle">
                        <div className="text-bold">{p.nombre}</div>
                        <small className="badge badge-secondary">
                          {p.categoria_nombre}
                        </small>
                      </td>
                      <td className="text-center align-middle">
                        ${p.precio_compra}
                      </td>
                      <td className="text-center align-middle">
                        ${p.precio_venta}
                      </td>
                      <td className="text-center align-middle text-danger text-bold">
                        {p.margen_actual}%{" "}
                        <i className="fas fa-arrow-down ml-1"></i>
                      </td>
                      <td className="text-center align-middle">
                        {p.margen_objetivo}%
                      </td>
                      <td className="text-center align-middle bg-light">
                        <span
                          className="text-success text-bold"
                          style={{ fontSize: "1.1rem" }}
                        >
                          ${p.precio_sugerido}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-success btn-sm shadow-sm"
                          onClick={() =>
                            aplicarSugerencia(p.id, p.nombre, p.precio_sugerido)
                          }
                        >
                          <i className="fas fa-check-circle mr-1"></i> Corregir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-5 text-center text-muted">
                      <i className="fas fa-check-circle fa-3x text-success mb-3 d-block"></i>
                      <h4>¡Márgenes Protegidos!</h4>
                      <p>
                        No se encontraron productos por debajo del margen
                        objetivo.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer del DataTable (Paginación) */}
          <div className="row mt-3">
            <div className="col-sm-12 col-md-5">
              <div className="dataTables_info">
                Mostrando {indexOfFirstItem + 1} a{" "}
                {Math.min(indexOfLastItem, filteredAlertas.length)} de{" "}
                {filteredAlertas.length} alertas
              </div>
            </div>
            <div className="col-sm-12 col-md-7 d-flex justify-content-end">
              <nav>
                <ul className="pagination pagination-sm m-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
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

        <div className="card-footer">
          <small className="text-muted">
            * El Guardián calcula el precio de venta necesario basándose en el
            Costo de Compra y el % de margen definido en la categoría.
          </small>
        </div>
      </div>
    </div>
  );
};

export default GuardianMargenes;
