// src/pages/productos/ListadoProductos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ListadoProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // URL dinámica: Si detecta que estás en Vercel, usa Render. Si no, localhost.
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible en esta tabla",
    sInfo:
      "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Siguiente",
      sPrevious: "Anterior",
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

  useEffect(() => {
    if (!loading && productos.length >= 0) {
      const tableId = "#productos-table";
      const $ = window.$;

      if ($ && $.fn.DataTable) {
        if ($.fn.DataTable.isDataTable(tableId)) {
          $(tableId).DataTable().destroy();
        }

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 10,
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
  }, [loading, productos]);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
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
        window.location.reload();
      } catch (error) {
        const msg =
          error.response?.data?.message || "No se pudo eliminar el producto.";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const handleExport = (type) => {
    const table = window.$("#productos-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  const getColorForStock = (stock, stockMinimo) => {
    if (stock <= stockMinimo)
      return { backgroundColor: "rgba(255, 0, 0, 0.1)", color: "red" };
    return {};
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Gestión de Productos</b>
        </h1>
        <hr />

        {/* Alerta Bajo Stock */}
        {productosBajoStock.length > 0 && (
          <div className="card card-danger card-outline shadow-sm mb-4">
            <div className="card-header">
              <h3 className="card-title text-bold">⚠️ Alerta de Stock Bajo</h3>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm table-hover mb-0">
                <thead className="thead-light text-center">
                  <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Mínimo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosBajoStock.map((p) => (
                    <tr key={p.id}>
                      <td className="pl-3">{p.nombre}</td>
                      <td className="text-center text-danger font-weight-bold">
                        {p.stock}
                      </td>
                      <td className="text-center">{p.stock_minimo}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-xs btn-success"
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

        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Listado de productos</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  window.open(`${API_URL}/api/productos/reporte`, "_blank")
                }
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              <button
                className="btn btn-primary btn-sm ml-2"
                onClick={() => navegarSinTooltips("/productos/crear")}
              >
                <i className="fa fa-plus"></i> Crear nuevo
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0 small">Mostrar</label>
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
                <div className="dt-buttons btn-group">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleExport("copy")}
                  >
                    <i className="fas fa-copy"></i> Copiar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleExport("pdf")}
                  >
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleExport("excel")}
                  >
                    <i className="fas fa-file-excel"></i> Excel
                  </button>
                </div>
              </div>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar producto..."
                style={{ width: "250px" }}
                onChange={(e) =>
                  window
                    .$("#productos-table")
                    .DataTable()
                    .search(e.target.value)
                    .draw()
                }
              />
            </div>

            <table
              id="productos-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Nro.</th>
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
                    <td className="text-center align-middle">{i + 1}</td>
                    <td className="text-center align-middle">
                      <span className="badge badge-info">
                        {prod.categoria_nombre}
                      </span>
                    </td>
                    <td className="align-middle text-center">{prod.codigo}</td>
                    <td className="align-middle">
                      <b>{prod.nombre}</b>
                    </td>
                    <td
                      className="text-center align-middle font-weight-bold"
                      style={getColorForStock(prod.stock, prod.stock_minimo)}
                    >
                      {prod.stock}
                    </td>
                    <td className="text-right align-middle">
                      ${" "}
                      {parseFloat(prod.precio_venta).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      {prod.imagen ? (
                        <img
                          src={`${API_URL}${prod.imagen}`}
                          width="30px"
                          className="rounded shadow-sm"
                        />
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver"
                          onClick={() =>
                            navegarSinTooltips(`/productos/ver/${prod.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          data-toggle="tooltip"
                          title="Editar"
                          onClick={() =>
                            navegarSinTooltips(`/productos/editar/${prod.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>

                        {prod.puede_eliminarse ? (
                          <button
                            className="btn btn-danger btn-sm"
                            data-toggle="tooltip"
                            title="Eliminar"
                            onClick={() => handleEliminar(prod.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm disabled"
                            data-toggle="tooltip"
                            title="Producto con actividad (Ventas/Compras)"
                            style={{ cursor: "not-allowed", opacity: 0.6 }}
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
