// src/pages/permisos/ListadoPermisos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const ListadoPermisos = () => {
  const navigate = useNavigate();
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

  // OBJETO DE IDIOMA LOCAL
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
    if (window.$) window.$(".tooltip").remove();
    navigate(url);
  };

  const fetchPermisos = async () => {
    try {
      const response = await api.get("/permissions");
      setPermisos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        const tableId = "#permisos-table";
        if (window.$.fn.DataTable.isDataTable(tableId)) {
          window.$(tableId).DataTable().destroy();
        }

        window.$(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 5,
          language: spanishLanguage,
          lengthChange: false, // Desactivar original para usar el manual
          searching: false, // Desactivar original para usar el manual
          dom: "rtip", // Ocultar controles duplicados
          columnDefs: [{ targets: -1, orderable: false }],
        });

        // Inicializar tooltips
        if (window.$) window.$('[data-bs-toggle="tooltip"]').tooltip();
      }, 150);

      return () => {
        clearTimeout(timer);
        if (window.$) {
          window.$(".tooltip").remove();
          if (window.$.fn.DataTable.isDataTable("#permisos-table")) {
            window.$("#permisos-table").DataTable().destroy();
          }
        }
      };
    }
  }, [loading, permisos]);

  const handleEliminar = async (id, permissionName) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¡Vas a eliminar el permiso "${permissionName}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, bórralo!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/permissions/${id}`);
        Swal.fire("¡Eliminado!", "El permiso ha sido eliminado.", "success");
        fetchPermisos();
      } catch (error) {
        Swal.fire(
          "Error",
          error.response?.data?.message || "No se pudo eliminar el permiso.",
          "error"
        );
      }
    }
  };

  const handleExport = (type) => {
    const table = window.$("#permisos-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Listado de Permisos</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Permisos registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/permisos/crear")}
              >
                <i className="fa fa-plus"></i> Crear nuevo
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Barra superior manual */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-2"
                  style={{ width: "65px" }}
                  onChange={(e) =>
                    window
                      .$("#permisos-table")
                      .DataTable()
                      .page.len(e.target.value)
                      .draw()
                  }
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
                  onChange={(e) =>
                    window
                      .$("#permisos-table")
                      .DataTable()
                      .search(e.target.value)
                      .draw()
                  }
                />
              </div>
            </div>

            {/* Tabla */}
            <table
              id="permisos-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Nombre del Permiso</th>
                  <th style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permisos.map((permiso, index) => (
                  <tr key={permiso.id}>
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="align-middle">{permiso.name}</td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-bs-toggle="tooltip"
                          title="Ver Permiso"
                          onClick={() =>
                            navegarSinTooltips(`/permisos/ver/${permiso.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          data-bs-toggle="tooltip"
                          title="Editar Permiso"
                          onClick={() =>
                            navegarSinTooltips(`/permisos/editar/${permiso.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          data-bs-toggle="tooltip"
                          title="Eliminar Permiso"
                          onClick={() =>
                            handleEliminar(permiso.id, permiso.name)
                          }
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
    </div>
  );
};

export default ListadoPermisos;
