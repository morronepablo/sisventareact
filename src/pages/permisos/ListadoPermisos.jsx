// src/pages/permisos/ListadoPermisos.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const ListadoPermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

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
        if (!$.fn.DataTable.isDataTable("#permisos-table")) {
          try {
            const table = $("#permisos-table").DataTable({
              paging: true,
              lengthChange: false,
              searching: false,
              ordering: true,
              info: true,
              autoWidth: false,
              responsive: true,
              pageLength: 10,
              language: {
                url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
              },
            });

            $('[data-bs-toggle="tooltip"]').tooltip();
          } catch (err) {
            console.error("Error al inicializar DataTables:", err);
          }
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if ($.fn.DataTable.isDataTable("#permisos-table")) {
          $("#permisos-table").DataTable().destroy();
        }
      };
    }
  }, [loading]);

  const handleVer = (id) => {
    window.location.href = `/permisos/ver/${id}`;
  };

  const handleEditar = (id) => {
    window.location.href = `/permisos/editar/${id}`;
  };

  const handleEliminar = async (id, permissionName) => {
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
        await api.delete(`/permissions/${id}`);
        Swal.fire("¡Eliminado!", "El permiso ha sido eliminado.", "success");
        fetchPermisos(); // Recargar la lista
      } catch (error) {
        console.error("Error al eliminar permiso:", error);
        if (error.response?.data?.message) {
          Swal.fire("Error", error.response.data.message, "error");
        } else {
          Swal.fire("Error", "No se pudo eliminar el permiso.", "error");
        }
      }
    }
  };

  const handleCrear = () => {
    window.location.href = "/permisos/crear";
  };

  if (loading) {
    return (
      <div className="content-header">
        <div className="container-fluid">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Listado de Permisos</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title my-1">Permisos registrados</h3>
                <div className="card-tools">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleCrear}
                  >
                    <i className="fa fa-plus"></i> Crear nuevo
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Barra superior con Mostrar, Botones de Exportación y Buscar */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <label className="mr-2">Mostrar</label>
                    <select
                      className="form-control form-control-sm mr-2"
                      style={{ width: "60px" }}
                    >
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                    <span>registros</span>

                    {/* Botones de exportación */}
                    <div className="dt-buttons btn-group ml-3">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          $("#permisos-table")
                            .DataTable()
                            .button(".buttons-copy")
                            .trigger()
                        }
                      >
                        <i className="fas fa-copy"></i> Copiar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          $("#permisos-table")
                            .DataTable()
                            .button(".buttons-pdf")
                            .trigger()
                        }
                      >
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() =>
                          $("#permisos-table")
                            .DataTable()
                            .button(".buttons-csv")
                            .trigger()
                        }
                      >
                        <i className="fas fa-file-csv"></i> CSV
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          $("#permisos-table")
                            .DataTable()
                            .button(".buttons-excel")
                            .trigger()
                        }
                      >
                        <i className="fas fa-file-excel"></i> Excel
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                          $("#permisos-table")
                            .DataTable()
                            .button(".buttons-print")
                            .trigger()
                        }
                      >
                        <i className="fas fa-print"></i> Imprimir
                      </button>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control form-control-sm mr-2"
                      placeholder="Buscar..."
                      style={{ width: "200px" }}
                    />
                  </div>
                </div>

                <table
                  id="permisos-table"
                  className="table table-striped table-bordered table-hover"
                >
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-center" style={{ width: "70px" }}>
                        Nro.
                      </th>
                      <th>Nombre</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permisos.map((permiso, index) => (
                      <tr key={permiso.id}>
                        <td className="text-center">{index + 1}</td>
                        <td>{permiso.name}</td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => handleVer(permiso.id)}
                              data-bs-toggle="tooltip"
                              title="Ver Permiso"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditar(permiso.id)}
                              data-bs-toggle="tooltip"
                              title="Editar Permiso"
                            >
                              <i className="fas fa-pencil"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                handleEliminar(permiso.id, permiso.name)
                              }
                              data-bs-toggle="tooltip"
                              title="Eliminar Permiso"
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
      </div>
    </div>
  );
};

export default ListadoPermisos;
