// src/pages/productos/ListadoProductos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// --- ESTILOS PARA CORREGIR MÁRGENES DE DATATABLES ---
const dataTableStyles = `
  .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  .dataTables_paginate { padding: 10px 15px !important; }
  .card-table-container { padding-bottom: 10px; }
`;

const ListadoProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible",
    sInfo: "Mostrando _START_ a _END_ de _TOTAL_",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Sig.",
      sPrevious: "Ant.",
    },
  };

  const navegarSinTooltips = (url) => {
    if (window.$) {
      window.$(".tooltip").remove();
      window.$('[data-toggle="tooltip"]').tooltip("hide");
    }
    navigate(url);
  };

  const fetchData = async () => {
    try {
      const [resP, resB] = await Promise.all([
        api.get("/productos"),
        api.get("/productos/bajo-stock"),
      ]);
      setProductos(resP.data);
      setProductosBajoStock(resB.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- INICIALIZACIÓN DE AMBAS TABLAS ---
  useEffect(() => {
    if (!loading) {
      const $ = window.$;
      if ($ && $.fn.DataTable) {
        // 1. Inicializar Tabla de Alertas (Stock Bajo)
        if (productosBajoStock.length > 0) {
          const tableAlertsId = "#alertas-table";
          if ($.fn.DataTable.isDataTable(tableAlertsId))
            $(tableAlertsId).DataTable().destroy();
          $(tableAlertsId).DataTable({
            paging: true,
            ordering: true,
            info: true,
            responsive: true,
            pageLength: 5, // Más corto para no ocupar toda la pantalla
            language: spanishLanguage,
            dom: "rtip",
            columnDefs: [{ targets: -1, orderable: false }],
          });
        }

        // 2. Inicializar Tabla Principal
        const tableProdId = "#productos-table";
        if ($.fn.DataTable.isDataTable(tableProdId))
          $(tableProdId).DataTable().destroy();
        $(tableProdId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 5,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [{ targets: -1, orderable: false }],
          drawCallback: function () {
            if ($ && $.fn.tooltip) {
              $('[data-toggle="tooltip"]').tooltip("dispose");
              $('[data-toggle="tooltip"]').tooltip({
                trigger: "hover",
                boundary: "window",
                template:
                  '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner bg-dark text-white shadow-sm"></div></div>',
              });
            }
          },
        });
      }
    }
  }, [loading, productos, productosBajoStock]);

  // --- LÓGICA DE ATAJOS (F8) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F8") {
        e.preventDefault();
        navigate("/productos/crear");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/productos/${id}`);
        await Swal.fire({
          title: "¡Eliminado!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData(); // Recargar datos sin recargar página
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar.", "error");
      }
    }
  };

  const handleExport = (type) => {
    const table = window.$("#productos-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <style>{dataTableStyles}</style>
      <div className="container-fluid">
        <h1 className="m-0 text-bold">Gestión de Productos</h1>
        <hr />

        {/* --- SECCIÓN ALERTAS DE STOCK BAJO (DATATABLE) --- */}
        {productosBajoStock.length > 0 && (
          <div className="card card-danger card-outline shadow mb-4">
            <div className="card-header border-0">
              <h3 className="card-title text-bold text-danger">
                <i className="fas fa-exclamation-triangle mr-2"></i> Alerta de
                Stock Bajo
              </h3>
            </div>
            <div className="card-body p-0 card-table-container">
              <table
                id="alertas-table"
                className="table table-striped table-hover table-sm mb-0"
              >
                <thead className="thead-light text-center">
                  <tr>
                    <th>Producto</th>
                    <th style={{ width: "15%" }}>Stock Actual</th>
                    <th style={{ width: "15%" }}>Umbral Mínimo</th>
                    <th style={{ width: "10%" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosBajoStock.map((p) => (
                    <tr key={p.id}>
                      <td className="pl-3 align-middle">
                        <b>{p.nombre}</b>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className="badge badge-danger px-3"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="text-center align-middle font-italic text-muted">
                        {p.stock_minimo}
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-xs btn-success shadow-sm"
                          onClick={() =>
                            navegarSinTooltips(`/productos/editar/${p.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- LISTADO GENERAL DE PRODUCTOS --- */}
        <div className="card card-outline card-primary shadow">
          <div className="card-header">
            <h3 className="card-title text-bold">Inventario General</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  window.open(
                    `${API_URL}/api/productos/reporte?token=${localStorage.getItem("token")}`,
                    "_blank",
                  )
                }
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              <button
                className="btn btn-primary btn-sm ml-2 shadow"
                onClick={() => navegarSinTooltips("/productos/crear")}
              >
                <i className="fa fa-plus"></i> F8: Crear nuevo
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Controles superiores */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0 small text-muted">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-3"
                  style={{ width: "70px" }}
                  onChange={(e) =>
                    window
                      .$("#productos-table")
                      .DataTable()
                      .page.len(e.target.value)
                      .draw()
                  }
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <div className="dt-buttons btn-group shadow-sm">
                  <button
                    className="btn btn-default btn-sm"
                    onClick={() => handleExport("copy")}
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    className="btn btn-default btn-sm text-danger"
                    onClick={() => handleExport("pdf")}
                  >
                    <i className="fas fa-file-pdf"></i>
                  </button>
                  <button
                    className="btn btn-default btn-sm text-success"
                    onClick={() => handleExport("excel")}
                  >
                    <i className="fas fa-file-excel"></i>
                  </button>
                </div>
              </div>
              <div
                className="input-group input-group-sm"
                style={{ width: "250px" }}
              >
                <input
                  type="text"
                  className="form-control shadow-sm"
                  placeholder="Buscar producto..."
                  onChange={(e) =>
                    window
                      .$("#productos-table")
                      .DataTable()
                      .search(e.target.value)
                      .draw()
                  }
                />
                <div className="input-group-append">
                  <span className="input-group-text bg-white">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                </div>
              </div>
            </div>

            <table
              id="productos-table"
              className="table table-striped table-bordered table-hover table-sm shadow-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "40px" }}>Nro.</th>
                  <th>Categoría</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th>P. Venta</th>
                  <th>Imagen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod, i) => (
                  <tr key={prod.id}>
                    <td className="text-center align-middle font-weight-bold">
                      {i + 1}
                    </td>
                    <td className="text-center align-middle">
                      <span className="badge badge-info">
                        {prod.categoria_nombre}
                      </span>
                    </td>
                    <td className="align-middle text-center small">
                      {prod.codigo}
                    </td>
                    <td className="align-middle">
                      <b>{prod.nombre}</b>
                    </td>
                    <td
                      className={`text-center align-middle font-weight-bold ${prod.stock <= prod.stock_minimo ? "text-danger bg-light" : ""}`}
                    >
                      {prod.stock}
                    </td>
                    <td className="text-right align-middle text-bold text-primary">
                      ${" "}
                      {parseFloat(prod.precio_venta).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      {prod.imagen ? (
                        <img
                          src={
                            prod.imagen.startsWith("http")
                              ? prod.imagen
                              : `${API_URL}${prod.imagen}`
                          }
                          width="35px"
                          height="35px"
                          style={{ objectFit: "cover" }}
                          className="rounded shadow-sm"
                          alt="P"
                        />
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group shadow-sm">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() =>
                            navegarSinTooltips(`/productos/ver/${prod.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            navegarSinTooltips(`/productos/editar/${prod.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        {prod.puede_eliminarse ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(prod.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm disabled"
                            title="Con actividad"
                          >
                            <i className="fas fa-lock"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoProductos;
