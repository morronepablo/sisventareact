// src/pages/gastos/ListadoCategoriasGastos.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const ListadoCategoriasGastos = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ nombre: "", tipo: "variable" });
  const [modo, setModo] = useState("crear");
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ninguna categoría registrada aún",
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

  // --- CORRECCIÓN EN FETCHDATA ---
  const fetchData = async () => {
    setLoading(true); // 1. Forzamos el estado loading para limpiar el DataTable viejo
    try {
      const res = await api.get("/gastos/categorias");
      setCategorias(res.data);
    } catch (error) {
      console.error("Error al cargar categorías", error);
    } finally {
      setLoading(false); // 2. Al terminar, el useEffect volverá a crear el DataTable
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Solo inicializamos si NO está cargando y hay datos (o el array está vacío pero listo)
    if (!loading) {
      const tableId = "#categorias-gastos-table";
      const $ = window.$;

      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId)) {
          $(tableId).DataTable().destroy();
        }

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          autoWidth: false,
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
      }, 200); // Un poco más de tiempo para asegurar que el DOM de React esté listo
      return () => clearTimeout(timer);
    }
  }, [loading, categorias]);

  const abrirModal = (tipoModo, categoria = null) => {
    setModo(tipoModo);
    if (categoria) {
      setFormData({ nombre: categoria.nombre, tipo: categoria.tipo });
      setIdSeleccionado(categoria.id);
    } else {
      setFormData({ nombre: "", tipo: "variable" });
      setIdSeleccionado(null);
    }
    window.$("#modal-categoria").modal("show");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modo === "crear") {
        await api.post("/gastos/categorias", formData);
      } else if (modo === "editar") {
        await api.put(`/gastos/categorias/${idSeleccionado}`, formData);
      }

      window.$("#modal-categoria").modal("hide"); // Cerramos modal antes

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchData(); // Refrescamos datos (esto disparará el loading y el re-build de la tabla)
    } catch (error) {
      Swal.fire("Error", "No se pudo procesar la solicitud", "error");
    }
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Eliminar categoría?",
      text: "Se borrará de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/gastos/categorias/${id}`);
          fetchData(); // Refrescamos después de eliminar
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire("Error", "La categoría tiene gastos vinculados", "error");
        }
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Categorías de Gastos</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-bold">Gestión de Tipos de Costos</h3>
            <button
              className="btn btn-primary btn-sm float-right"
              onClick={() => abrirModal("crear")}
            >
              <i className="fas fa-plus mr-1"></i> Nueva Categoría
            </button>
          </div>
          <div className="card-body">
            <table
              id="categorias-gastos-table"
              className="table table-bordered table-striped table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Nombre de Categoría</th>
                  <th style={{ width: "200px" }}>Tipo de Gasto (BI)</th>
                  <th style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td className="align-middle px-3">
                      <b>{c.nombre}</b>
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge p-2 shadow-sm ${
                          c.tipo === "fijo" ? "badge-danger" : "badge-warning"
                        }`}
                        style={{ minWidth: "120px" }}
                      >
                        {c.tipo === "fijo" ? (
                          <>
                            <i className="fas fa-lock mr-1"></i> COSTO FIJO
                          </>
                        ) : (
                          <>
                            <i className="fas fa-random mr-1"></i> COSTO
                            VARIABLE
                          </>
                        )}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => abrirModal("ver", c)}
                          data-toggle="tooltip"
                          title="Ver Detalle"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => abrirModal("editar", c)}
                          data-toggle="tooltip"
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEliminar(c.id)}
                          data-toggle="tooltip"
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL ÚNICO */}
      <div className="modal fade" id="modal-categoria" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div
              className={`modal-header text-white ${
                modo === "crear"
                  ? "bg-primary"
                  : modo === "editar"
                  ? "bg-success"
                  : "bg-info"
              }`}
            >
              <h5 className="modal-title font-weight-bold">
                <i
                  className={`fas ${
                    modo === "crear"
                      ? "fa-plus"
                      : modo === "editar"
                      ? "fa-edit"
                      : "fa-eye"
                  } mr-2`}
                ></i>
                {modo === "crear"
                  ? "Nueva Categoría"
                  : modo === "editar"
                  ? "Editar Categoría"
                  : "Detalle de Categoría"}
              </h5>
              <button
                type="button"
                className="close text-white"
                data-dismiss="modal"
              >
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                <div className="form-group mb-4">
                  <label className="font-weight-bold">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    disabled={modo === "ver"}
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="font-weight-bold">
                    Clasificación para el Cirujano (BI)
                  </label>
                  <select
                    className="form-control"
                    disabled={modo === "ver"}
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                  >
                    <option value="variable">
                      Costo Variable (Fluctúa con la actividad)
                    </option>
                    <option value="fijo">
                      Costo Fijo (Obligatorio independientemente de ventas)
                    </option>
                  </select>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  {modo === "ver" ? "Cerrar" : "Cancelar"}
                </button>
                {modo !== "ver" && (
                  <button
                    type="submit"
                    className={`btn font-weight-bold ${
                      modo === "crear" ? "btn-primary" : "btn-success"
                    }`}
                  >
                    <i className="fas fa-save mr-1"></i>{" "}
                    {modo === "crear" ? "Guardar" : "Actualizar"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoCategoriasGastos;
