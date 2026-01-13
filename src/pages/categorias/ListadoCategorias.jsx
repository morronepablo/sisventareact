// src/pages/categorias/ListadoCategorias.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const ListadoCategorias = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchCategorias = async () => {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (!loading && categorias.length > 0) {
      const tableId = "#categorias-table";
      const $ = window.$;

      const timer = setTimeout(() => {
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
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, categorias]);

  const handleEliminar = async (id, nombre) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará la categoría "${nombre}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, eliminar!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categorias/${id}`);
        await Swal.fire({
          title: "¡Eliminado!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        window.location.reload();
      } catch (error) {
        const msg = error.response?.data?.message || "Error al eliminar.";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const handleExport = (type) => {
    const table = window.$("#categorias-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Categorías</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Listado de categorías</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm shadow-sm"
                onClick={() => navegarSinTooltips("/categorias/crear")}
              >
                <i className="fa fa-plus"></i> Crear categoría
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0 text-sm">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-2 shadow-sm"
                  style={{ width: "65px" }}
                  onChange={(e) =>
                    window
                      .$("#categorias-table")
                      .DataTable()
                      .page.len(e.target.value)
                      .draw()
                  }
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="mr-3 text-sm text-muted">registros</span>

                <div className="dt-buttons btn-group">
                  <button
                    className="btn btn-secondary btn-sm shadow-sm"
                    onClick={() => handleExport("copy")}
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm shadow-sm"
                    onClick={() => handleExport("pdf")}
                  >
                    <i className="fas fa-file-pdf"></i>
                  </button>
                  <button
                    className="btn btn-success btn-sm shadow-sm"
                    onClick={() => handleExport("excel")}
                  >
                    <i className="fas fa-file-excel"></i>
                  </button>
                  <button
                    className="btn btn-warning btn-sm shadow-sm text-white"
                    onClick={() => handleExport("print")}
                  >
                    <i className="fas fa-print"></i>
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div
                  className="input-group input-group-sm shadow-sm"
                  style={{ width: "220px" }}
                >
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar categoría..."
                    onChange={(e) =>
                      window
                        .$("#categorias-table")
                        .DataTable()
                        .search(e.target.value)
                        .draw()
                    }
                  />
                </div>
              </div>
            </div>

            <table
              id="categorias-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th style={{ width: "100px" }}>Margen (%)</th>{" "}
                  {/* 👈 NUEVA COLUMNA */}
                  <th style={{ width: "80px" }}>Productos</th>
                  <th style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat, i) => (
                  <tr key={cat.id}>
                    <td className="text-center align-middle">{i + 1}</td>
                    <td className="align-middle text-bold">{cat.nombre}</td>
                    <td className="align-middle text-muted small">
                      {cat.descripcion || "Sin descripción"}
                    </td>
                    {/* INDICADOR DE MARGEN OBJETIVO */}
                    <td className="text-center align-middle">
                      <span
                        className="badge badge-info shadow-sm"
                        style={{ fontSize: "0.85rem", width: "70px" }}
                      >
                        {parseFloat(cat.margen_objetivo || 0).toFixed(2)} %
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <span className="badge badge-secondary">
                        {cat.productos_count}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group shadow-sm">
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver detalle"
                          onClick={() =>
                            navegarSinTooltips(`/categorias/ver/${cat.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          data-toggle="tooltip"
                          title="Editar margen y datos"
                          onClick={() =>
                            navegarSinTooltips(`/categorias/editar/${cat.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        {cat.productos_count === 0 ? (
                          <button
                            className="btn btn-danger btn-sm"
                            data-toggle="tooltip"
                            title="Eliminar"
                            onClick={() => handleEliminar(cat.id, cat.nombre)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm disabled"
                            data-toggle="tooltip"
                            title="No se puede eliminar: tiene productos"
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

export default ListadoCategorias;
