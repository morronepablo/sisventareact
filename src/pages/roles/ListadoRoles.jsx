// src/pages/roles/ListadoRoles.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const ListadoRoles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
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

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      setRoles(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar roles:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    let tableInstance = null;

    const inicializarTabla = () => {
      const tableId = "#roles-table";
      const $ = window.$;

      // VALIDACIÓN CRÍTICA: Si jQuery o DataTable no están cargados, re-intentar en 100ms
      if (!$ || !$.fn || !$.fn.DataTable) {
        setTimeout(inicializarTabla, 100);
        return;
      }

      if ($.fn.DataTable.isDataTable(tableId)) {
        $(tableId).DataTable().destroy();
      }

      tableInstance = $(tableId).DataTable({
        paging: true,
        ordering: true,
        info: true,
        autoWidth: false,
        responsive: true,
        pageLength: 10,
        language: spanishLanguage,
        lengthChange: false,
        searching: false,
        dom: "rtip",
        columnDefs: [{ targets: -1, orderable: false }],
        drawCallback: function () {
          // FORZAR TOOLTIPS NEGROS DE ADMINLTE
          if ($ && $.fn.tooltip) {
            $('[data-toggle="tooltip"]').tooltip("dispose");
            $('[data-toggle="tooltip"]').tooltip({
              trigger: "hover",
              boundary: "window",
              // Esto asegura que use el estilo de Bootstrap y no el del navegador
              template:
                '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner bg-dark text-white shadow-sm"></div></div>',
            });
          }
        },
      });
    };

    if (!loading && roles.length > 0) {
      inicializarTabla();
    }

    return () => {
      if (
        window.$ &&
        window.$.fn &&
        window.$.fn.DataTable &&
        window.$.fn.DataTable.isDataTable("#roles-table")
      ) {
        window.$("#roles-table").DataTable().destroy();
      }
      if (window.$) window.$(".tooltip").remove();
    };
  }, [loading, roles]);

  const handleEliminar = async (id, roleName) => {
    // Protección extra en el frontend
    if (roleName === "Administrador" || id === 1) {
      Swal.fire(
        "Acceso denegado",
        "No se puede eliminar el rol de Administrador",
        "error"
      );
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará el rol permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/roles/${id}`);
        await Swal.fire({
          title: "¡Eliminado!",
          text: "El rol ha sido borrado.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // RECARGA TOTAL PARA EVITAR CONFLICTOS CON DATATABLES
        window.location.reload();
      } catch (error) {
        const msg =
          error.response?.data?.message || "No se pudo eliminar el rol.";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const handleExport = (type) => {
    if (window.$ && window.$.fn.DataTable.isDataTable("#roles-table")) {
      const table = window.$("#roles-table").DataTable();
      table.button(`.buttons-${type}`).trigger();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Listado de Roles</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Roles registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/roles/crear")}
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
                  onChange={(e) => {
                    if (window.$.fn.DataTable.isDataTable("#roles-table")) {
                      window
                        .$("#roles-table")
                        .DataTable()
                        .page.len(e.target.value)
                        .draw();
                    }
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
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
                    className="btn btn-info btn-sm"
                    onClick={() => handleExport("csv")}
                  >
                    <i className="fas fa-file-csv"></i> CSV
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

              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar..."
                  style={{ width: "200px" }}
                  onChange={(e) => {
                    if (window.$.fn.DataTable.isDataTable("#roles-table")) {
                      window
                        .$("#roles-table")
                        .DataTable()
                        .search(e.target.value)
                        .draw();
                    }
                  }}
                />
              </div>
            </div>

            <table
              id="roles-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Nombre del Rol</th>
                  <th style={{ width: "160px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((rol, index) => (
                  <tr key={rol.id}>
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="align-middle">{rol.name}</td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver Rol"
                          onClick={() =>
                            navegarSinTooltips(`/roles/ver/${rol.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          data-toggle="tooltip"
                          title="Editar Rol"
                          onClick={() =>
                            navegarSinTooltips(`/roles/editar/${rol.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          data-toggle="tooltip"
                          title="Asignar Permisos"
                          onClick={() =>
                            navegarSinTooltips(`/roles/${rol.id}/permisos`)
                          }
                        >
                          <i className="fas fa-lock"></i>
                        </button>
                        {/* BOTÓN ELIMINAR CONDICIONAL: 
            Solo si el nombre NO es Administrador Y no tiene usuarios asignados (user_count === 0) */}
                        {rol.name !== "Administrador" &&
                        rol.user_count === 0 ? (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            data-toggle="tooltip"
                            title="Eliminar Rol"
                            onClick={() => handleEliminar(rol.id, rol.name)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm disabled"
                            style={{ cursor: "not-allowed", opacity: 0.6 }}
                            title="Rol protegido o en uso por usuarios"
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

export default ListadoRoles;
