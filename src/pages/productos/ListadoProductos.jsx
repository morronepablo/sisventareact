// src/pages/productos/ListadoProductos.jsx
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const ListadoProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false); // Nuevo: para saber si está cargando
  const [uploadProgress, setUploadProgress] = useState(0); // Nuevo: porcentaje

  const API_URL = "http://localhost:3001";

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
        if (!$.fn.DataTable.isDataTable("#productos-table")) {
          try {
            const table = $("#productos-table").DataTable({
              paging: true,
              lengthChange: true,
              searching: true,
              ordering: true,
              info: true,
              autoWidth: false,
              responsive: true,
              pageLength: 8,
              lengthMenu: [
                [5, 8, 10, 25, 50, 100, -1],
                [5, 8, 10, 25, 50, 100, "Todos"],
              ],
              language: {
                url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
              },
              dom: "lfrtip",
              buttons: [
                {
                  extend: "copy",
                  className: "btn btn-secondary rounded-sm",
                  text: '<i class="fas fa-copy"></i> Copiar',
                },
                {
                  extend: "pdf",
                  className: "btn btn-danger rounded-sm",
                  text: '<i class="fas fa-file-pdf"></i> PDF',
                },
                {
                  extend: "csv",
                  className: "btn btn-info rounded-sm",
                  text: '<i class="fas fa-file-csv"></i> CSV',
                },
                {
                  extend: "excel",
                  className: "btn btn-success rounded-sm",
                  text: '<i class="fas fa-file-excel"></i> Excel',
                },
                {
                  extend: "print",
                  className: "btn btn-warning rounded-sm",
                  text: '<i class="fas fa-print"></i> Imprimir',
                },
              ],
            });

            // Inicializar tooltips
            $('[data-bs-toggle="tooltip"]').tooltip();

            // Colocar botones en el contenedor correcto
            table
              .buttons()
              .container()
              .appendTo("#productos-table_wrapper .col-md-12:eq(0)");
          } catch (err) {
            console.error("Error al inicializar DataTables:", err);
          }
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if ($.fn.DataTable.isDataTable("#productos-table")) {
          $("#productos-table").DataTable().destroy();
        }
      };
    }
  }, [loading]);

  const handleVer = (id) => {
    window.location.href = `/productos/ver/${id}`;
  };

  const handleEditar = (id) => {
    window.location.href = `/productos/editar/${id}`;
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, bórralo!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/productos/${id}`);
        Swal.fire("¡Eliminado!", "El producto ha sido eliminado.", "success");
        fetchProductos();
        fetchProductosBajoStock();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    }
  };

  const handleCrear = () => {
    window.location.href = "/productos/crear";
  };

  const handleImportar = () => {
    setShowImportModal(true);
  };

  //   const handleImportSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!importFile)
  //       return Swal.fire("Error", "Seleccione un archivo CSV", "error");

  //     const formData = new FormData();
  //     formData.append("csv_file", importFile);

  //     try {
  //       const res = await api.post("/productos/importar", formData);
  //       Swal.fire("Éxito", res.data.message, "success").then(() => {
  //         setShowImportModal(false);
  //         fetchProductos();
  //         fetchProductosBajoStock();
  //       });
  //     } catch (error) {
  //       Swal.fire(
  //         "Error",
  //         error.response?.data?.message || "Error al importar",
  //         "error"
  //       );
  //     }
  //   };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile)
      return Swal.fire("Error", "Seleccione un archivo CSV", "error");

    const formData = new FormData();
    formData.append("csv_file", importFile);

    setImporting(true); // Iniciamos carga
    setUploadProgress(0);

    try {
      const res = await api.post("/productos/importar", formData, {
        // Configuración de Axios para el progreso
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
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

  const handleReporte = () => {
    window.open("http://localhost:3001/api/productos/reporte", "_blank");
  };

  const getColorForStock = (stock, stockMinimo) => {
    const diferencia = stock - stockMinimo;
    if (diferencia <= 0) {
      return {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
        color: "rgb(200, 0, 0)",
      };
    } else if (diferencia <= 10) {
      return {
        backgroundColor: "rgba(233, 231, 16, 0.15)",
        color: "rgb(180, 160, 0)",
      };
    } else {
      return {
        backgroundColor: "rgba(0, 255, 0, 0.15)",
        color: "rgb(0, 150, 0)",
      };
    }
  };

  if (loading)
    return (
      <div className="content-header">
        <div className="container-fluid">Cargando...</div>
      </div>
    );

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
            <div className="card card-danger">
              <div className="card-header">
                <h3 className="card-title my-1">Productos con Bajo Stock</h3>
              </div>
              <div className="card-body">
                {productosBajoStock.length === 0 ? (
                  <p className="text-center text-muted">
                    No hay productos con bajo stock.
                  </p>
                ) : (
                  <table
                    id="productos-bajo-stock-table"
                    className="table table-striped table-bordered table-hover table-sm"
                  >
                    <thead className="thead-dark">
                      <tr className="text-center">
                        <th scope="col">Nro.</th>
                        <th scope="col">Categoría</th>
                        <th scope="col">Código</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">N. Corto</th>
                        <th scope="col">Unidad</th>
                        <th scope="col">Stock</th>
                        <th scope="col">Precio Compra</th>
                        <th scope="col">Porcentaje</th>
                        <th scope="col">Por. Valor</th>
                        <th scope="col">Precio Venta</th>
                        <th scope="col">Imagen</th>
                        <th scope="col" className="text-center">
                          Acciones
                        </th>
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
                            <th
                              scope="row"
                              className="text-center align-middle"
                            >
                              {i + 1}
                            </th>
                            <td className="align-middle text-center">
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
                              $
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
                                style={{
                                  accentColor: "#ff4500",
                                  transform: "scale(1.5)",
                                }}
                              />
                            </td>
                            <td className="text-right align-middle">
                              {prod.valor_porcentaje ?? "0"} %
                            </td>
                            <td className="text-right align-middle">
                              $
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
                                  alt={prod.nombre}
                                  className="img-fluid rounded shadow-sm"
                                />
                              ) : (
                                <span className="text-muted">Sin imagen</span>
                              )}
                            </td>
                            <td className="text-center align-middle">
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() => handleVer(prod.id)}
                                  data-bs-toggle="tooltip"
                                  title="Ver Producto"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleEditar(prod.id)}
                                  data-bs-toggle="tooltip"
                                  title="Editar Producto"
                                >
                                  <i className="fas fa-pencil"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminar(prod.id)}
                                  data-bs-toggle="tooltip"
                                  title="Eliminar Producto"
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
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title my-1">Productos registrados</h3>
                <div className="card-tools">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleReporte}
                  >
                    <i className="fa fa-file-pdf"></i> Stock Valorizado
                  </button>
                  <button
                    className="btn btn-warning btn-sm ml-2"
                    onClick={handleImportar}
                  >
                    <i className="fas fa-upload"></i> Importar Productos
                  </button>
                  <button
                    className="btn btn-primary btn-sm ml-2"
                    onClick={handleCrear}
                  >
                    <i className="fa fa-plus"></i> Crear nuevo
                  </button>
                </div>
              </div>
              <div className="card-body">
                <table
                  id="productos-table"
                  className="table table-striped table-bordered table-hover table-sm"
                >
                  <thead className="thead-dark">
                    <tr className="text-center">
                      <th scope="col">Nro.</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Código</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">N. Corto</th>
                      <th scope="col">Unidad</th>
                      <th scope="col">Stock</th>
                      <th scope="col">Precio Compra</th>
                      <th scope="col">Porcentaje</th>
                      <th scope="col">Por. Valor</th>
                      <th scope="col">Precio Venta</th>
                      <th scope="col">Imagen</th>
                      <th scope="col" className="text-center">
                        Acciones
                      </th>
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
                          <th scope="row" className="text-center align-middle">
                            {i + 1}
                          </th>
                          <td className="align-middle text-center">
                            <span className="badge badge-info">
                              {prod.categoria_nombre}
                            </span>
                          </td>
                          <td className="align-middle">{prod.codigo}</td>
                          <td className="align-middle">{prod.nombre}</td>
                          <td className="align-middle">{prod.nombre_corto}</td>
                          <td className="align-middle">{prod.unidad_nombre}</td>
                          <td
                            className="text-right align-middle"
                            style={{ ...colorStyle, fontWeight: "bold" }}
                          >
                            {prod.stock}
                          </td>
                          <td className="text-right align-middle">
                            $
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
                              style={{
                                accentColor: "#ff4500",
                                transform: "scale(1.5)",
                              }}
                            />
                          </td>
                          <td className="text-right align-middle">
                            {prod.valor_porcentaje ?? "0"} %
                          </td>
                          <td className="text-right align-middle">
                            $
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
                                alt={prod.nombre}
                                className="img-fluid rounded shadow-sm"
                              />
                            ) : (
                              <span className="text-muted">Sin imagen</span>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => handleVer(prod.id)}
                                data-bs-toggle="tooltip"
                                title="Ver Producto"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditar(prod.id)}
                                data-bs-toggle="tooltip"
                                title="Editar Producto"
                              >
                                <i className="fas fa-pencil"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleEliminar(prod.id)}
                                data-bs-toggle="tooltip"
                                title="Eliminar Producto"
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
            tabIndex="-1"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">Importar Productos desde CSV</h5>
                  {!importing && (
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowImportModal(false)}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  )}
                </div>
                <form onSubmit={handleImportSubmit}>
                  <div className="modal-body">
                    {!importing ? (
                      <div className="mb-3">
                        <label htmlFor="csv_file" className="form-label">
                          Seleccione el archivo CSV
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="csv_file"
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
                            : "Procesando registros en la base de datos..."}
                        </h6>
                        <div
                          className="progress mt-2"
                          style={{ height: "25px" }}
                        >
                          <div
                            className={`progress-bar progress-bar-striped progress-bar-animated ${
                              uploadProgress === 100
                                ? "bg-success"
                                : "bg-primary"
                            }`}
                            role="progressbar"
                            style={{ width: `${uploadProgress}%` }}
                            aria-valuenow={uploadProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {uploadProgress}%
                          </div>
                        </div>
                        <p className="text-muted mt-2 small">
                          Por favor, no cierre la ventana ni recargue la página.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
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
