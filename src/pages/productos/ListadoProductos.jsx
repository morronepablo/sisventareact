// src/pages/productos/ListadoProductos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Importamos para obtener empresa_id

const ListadoProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtenemos el usuario logueado

  const API_URL = "http://localhost:3001";

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
      window.$('[data-bs-toggle="tooltip"]').tooltip("hide");
    }
    navigate(url);
  };

  const fetchProductos = async () => {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setLoading(false);
    }
  };

  const fetchProductosBajoStock = async () => {
    try {
      const res = await api.get("/productos/bajo-stock");
      setProductosBajoStock(res.data);
    } catch (error) {
      console.error("Error al cargar productos con bajo stock:", error);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchProductosBajoStock();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
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
            pageLength: 5,
            language: spanishLanguage,
            lengthChange: false,
            searching: false,
            dom: "rtip",
            buttons: ["copy", "pdf", "csv", "excel", "print"],
            columnDefs: [{ targets: -1, orderable: false }],
            // RE-INICIALIZAR TOOLTIPS NEGROS CADA VEZ QUE LA TABLA CAMBIA
            drawCallback: function () {
              if ($ && $.fn.tooltip) {
                $('[data-bs-toggle="tooltip"]').tooltip("dispose");
                $('[data-bs-toggle="tooltip"]').tooltip({
                  trigger: "hover",
                  boundary: "window",
                });
              }
            },
          });
        }
      }, 200);

      return () => {
        clearTimeout(timer);
        if (window.$) {
          window.$(".tooltip").remove();
          if (
            window.$.fn.DataTable &&
            window.$.fn.DataTable.isDataTable("#productos-table")
          ) {
            window.$("#productos-table").DataTable().destroy();
          }
        }
      };
    }
  }, [loading, productos]);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, bórralo!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/productos/${id}`);
        Swal.fire("¡Eliminado!", "El producto ha sido eliminado.", "success");
        fetchProductos();
        fetchProductosBajoStock();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    }
  };

  const handleExport = (type) => {
    const table = window.$("#productos-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile)
      return Swal.fire("Error", "Seleccione un archivo CSV", "error");
    const formData = new FormData();
    formData.append("csv_file", importFile);
    setImporting(true);
    setUploadProgress(0);
    try {
      const res = await api.post("/productos/importar", formData, {
        onUploadProgress: (p) =>
          setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
      setImporting(false);
      Swal.fire("Éxito", res.data.message, "success").then(() => {
        setShowImportModal(false);
        fetchProductos();
        fetchProductosBajoStock();
      });
    } catch (error) {
      setImporting(false);
      setUploadProgress(0);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al importar",
        "error"
      );
    }
  };

  const getColorForStock = (stock, stockMinimo) => {
    const diferencia = stock - stockMinimo;
    if (diferencia <= 0)
      return {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
        color: "rgb(200, 0, 0)",
      };
    if (diferencia <= 10)
      return {
        backgroundColor: "rgba(233, 231, 16, 0.15)",
        color: "rgb(180, 160, 0)",
      };
    return {
      backgroundColor: "rgba(0, 255, 0, 0.15)",
      color: "rgb(0, 150, 0)",
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Listado de Productos</h1>
          </div>
        </div>

        {/* Productos con Bajo Stock */}
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-danger shadow-sm">
              <div className="card-header">
                <h3 className="card-title my-1 text-bold">
                  <i className="fas fa-exclamation-triangle mr-2"></i>Productos
                  con Bajo Stock
                </h3>
              </div>
              <div className="card-body">
                {productosBajoStock.length === 0 ? (
                  <p className="text-center text-muted">
                    No hay productos con bajo stock.
                  </p>
                ) : (
                  <table className="table table-striped table-bordered table-hover table-sm">
                    <thead className="thead-dark text-center">
                      <tr>
                        <th>Nro.</th>
                        <th>Categoría</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>N. Corto</th>
                        <th>Unidad</th>
                        <th>Stock</th>
                        <th>P. Compra</th>
                        <th>%</th>
                        <th>P. Venta</th>
                        <th>Imagen</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosBajoStock.map((prod, i) => {
                        const colorStyle = getColorForStock(
                          prod.stock,
                          prod.stock_minimo
                        );
                        return (
                          <tr key={prod.id}>
                            <td className="text-center align-middle">
                              {i + 1}
                            </td>
                            <td className="text-center align-middle">
                              <span className="badge badge-info">
                                {prod.categoria_nombre}
                              </span>
                            </td>
                            <td className="align-middle">{prod.codigo}</td>
                            <td className="align-middle">{prod.nombre}</td>
                            <td className="align-middle">
                              {prod.nombre_corto}
                            </td>
                            <td className="align-middle">
                              {prod.unidad_nombre}
                            </td>
                            <td
                              className="text-right align-middle"
                              style={{ ...colorStyle, fontWeight: "bold" }}
                            >
                              {prod.stock}
                            </td>
                            <td className="text-right align-middle">
                              ${" "}
                              {parseFloat(prod.precio_compra).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="text-center align-middle">
                              <input
                                type="checkbox"
                                checked={prod.aplicar_porcentaje}
                                disabled
                              />
                            </td>
                            <td className="text-right align-middle font-weight-bold">
                              ${" "}
                              {parseFloat(prod.precio_venta).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="text-center align-middle">
                              {prod.imagen ? (
                                <img
                                  src={`${API_URL}${prod.imagen}`}
                                  width="30px"
                                  className="img-fluid rounded shadow-sm"
                                />
                              ) : (
                                <span className="text-muted small">N/A</span>
                              )}
                            </td>
                            <td className="text-center align-middle">
                              <div className="btn-group">
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() =>
                                    navegarSinTooltips(
                                      `/productos/ver/${prod.id}`
                                    )
                                  }
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() =>
                                    navegarSinTooltips(
                                      `/productos/editar/${prod.id}`
                                    )
                                  }
                                >
                                  <i className="fas fa-pencil-alt"></i>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminar(prod.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Todos los productos */}
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title my-1">Productos registrados</h3>
                <div className="card-tools">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      window.open(
                        `${API_URL}/api/productos/reporte?empresa_id=${
                          user?.empresa_id || 1
                        }`,
                        "_blank"
                      )
                    }
                  >
                    <i className="fa fa-file-pdf"></i> Stock Valorizado
                  </button>
                  <button
                    className="btn btn-warning btn-sm ml-2"
                    onClick={() => setShowImportModal(true)}
                  >
                    <i className="fas fa-upload"></i> Importar Productos
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <label className="mr-2 mb-0">Mostrar</label>
                    <select
                      className="form-control form-control-sm mr-2"
                      style={{ width: "65px" }}
                      defaultValue="5"
                      onChange={(e) =>
                        window
                          .$("#productos-table")
                          .DataTable()
                          .page.len(e.target.value)
                          .draw()
                      }
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="mr-3">registros</span>
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
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleExport("print")}
                      >
                        <i className="fas fa-print"></i> Imprimir
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar..."
                    style={{ width: "200px" }}
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
                      <th>Unidad</th>
                      <th>Stock</th>
                      <th>P. Compra</th>
                      <th>%</th>
                      <th>P. Venta</th>
                      <th>Imagen</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((prod, i) => {
                      const colorStyle = getColorForStock(
                        prod.stock,
                        prod.stock_minimo
                      );
                      return (
                        <tr key={prod.id}>
                          <td className="text-center align-middle">{i + 1}</td>
                          <td className="text-center align-middle">
                            <span className="badge badge-info">
                              {prod.categoria_nombre}
                            </span>
                          </td>
                          <td className="align-middle">{prod.codigo}</td>
                          <td className="align-middle">{prod.nombre}</td>
                          <td className="align-middle">{prod.unidad_nombre}</td>
                          <td
                            className="text-right align-middle"
                            style={{ ...colorStyle, fontWeight: "bold" }}
                          >
                            {prod.stock}
                          </td>
                          <td className="text-right align-middle">
                            ${" "}
                            {parseFloat(prod.precio_compra).toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <input
                              type="checkbox"
                              checked={prod.aplicar_porcentaje}
                              disabled
                            />
                          </td>
                          <td className="text-right align-middle font-weight-bold">
                            ${" "}
                            {parseFloat(prod.precio_venta).toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                          <td className="text-center align-middle">
                            {prod.imagen ? (
                              <img
                                src={`${API_URL}${prod.imagen}`}
                                width="30px"
                                className="img-fluid rounded shadow-sm"
                              />
                            ) : (
                              <span className="text-muted small">
                                Sin imagen
                              </span>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <div className="btn-group">
                              <button
                                className="btn btn-info btn-sm"
                                data-bs-toggle="tooltip"
                                title="Ver"
                                onClick={() =>
                                  navegarSinTooltips(
                                    `/productos/ver/${prod.id}`
                                  )
                                }
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-success btn-sm"
                                data-bs-toggle="tooltip"
                                title="Editar"
                                onClick={() =>
                                  navegarSinTooltips(
                                    `/productos/editar/${prod.id}`
                                  )
                                }
                              >
                                <i className="fas fa-pencil-alt"></i>
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                data-bs-toggle="tooltip" // 👈 CORREGIDO A data-bs-toggle
                                title="Generar Etiquetas"
                                onClick={() => {
                                  const empresaId = user?.empresa_id || 1;
                                  Swal.fire({
                                    title: "¿Cuántas etiquetas?",
                                    input: "number",
                                    inputValue: 12,
                                    showCancelButton: true,
                                    confirmButtonText: "Generar PDF",
                                    cancelButtonText: "Cancelar",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      window.open(
                                        `${API_URL}/api/productos/${prod.id}/etiquetas?cantidad=${result.value}&empresa_id=${empresaId}`,
                                        "_blank"
                                      );
                                    }
                                  });
                                }}
                              >
                                <i className="fas fa-barcode"></i>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                data-bs-toggle="tooltip"
                                title="Eliminar"
                                onClick={() => handleEliminar(prod.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Importación */}
        {showImportModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow">
                <div className="modal-header bg-warning">
                  <h5 className="modal-title font-weight-bold">
                    Importar Productos desde CSV
                  </h5>
                  {!importing && (
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowImportModal(false)}
                    >
                      <span>&times;</span>
                    </button>
                  )}
                </div>
                <form onSubmit={handleImportSubmit}>
                  <div className="modal-body">
                    {!importing ? (
                      <div className="mb-3">
                        <label className="form-label">
                          Seleccione el archivo CSV
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".csv"
                          onChange={(e) => setImportFile(e.target.files[0])}
                          required
                        />
                        <small className="form-text text-muted">
                          Asegúrese de que el archivo use comas como separador.
                        </small>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <h6>
                          {uploadProgress < 100
                            ? `Subiendo archivo: ${uploadProgress}%`
                            : "Procesando registros..."}
                        </h6>
                        <div
                          className="progress mt-2"
                          style={{ height: "20px" }}
                        >
                          <div
                            className={`progress-bar progress-bar-striped progress-bar-animated ${
                              uploadProgress === 100
                                ? "bg-success"
                                : "bg-primary"
                            }`}
                            style={{ width: `${uploadProgress}%` }}
                          >
                            {uploadProgress}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowImportModal(false)}
                      disabled={importing}
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={importing}
                    >
                      {importing ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2"></span>
                          Importando...
                        </>
                      ) : (
                        "Iniciar Importación"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListadoProductos;
