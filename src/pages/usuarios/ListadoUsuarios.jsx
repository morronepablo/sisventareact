// src/pages/usuarios/ListadoUsuarios.jsx
/* eslint-disable no-undef */
import React, { useEffect } from "react";

const ListadoUsuarios = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Inicializar DataTables solo si no está ya inicializado
      if (!$.fn.DataTable.isDataTable("#usuarios-table")) {
        try {
          const table = $("#usuarios-table").DataTable({
            paging: true,
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            pageLength: 10,
            lengthMenu: [
              [5, 10, 25, 50, 100, -1],
              [5, 10, 25, 50, 100, "Todos"],
            ],
            language: {
              url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
            },
            dom: '<"row"<"col-md-6"l><"col-md-6 text-right"f>><"row"<"col-md-12"B>>rt<"row"<"col-md-6"i><"col-md-6 text-right"p>>',
            buttons: [
              {
                text: '<i class="fas fa-copy"></i> Copiar',
                extend: "copy",
                className: "btn btn-secondary btn-sm rounded-sm",
              },
              {
                text: '<i class="fas fa-file-pdf"></i> PDF',
                extend: "pdf",
                className: "btn btn-danger btn-sm rounded-sm",
              },
              {
                text: '<i class="fas fa-file-csv"></i> CSV',
                extend: "csv",
                className: "btn btn-info btn-sm rounded-sm",
              },
              {
                text: '<i class="fas fa-file-excel"></i> Excel',
                extend: "excel",
                className: "btn btn-success btn-sm rounded-sm",
              },
              {
                text: '<i class="fas fa-print"></i> Imprimir',
                extend: "print",
                className: "btn btn-warning btn-sm rounded-sm",
              },
            ],
          });

          // Colocar los botones en el contenedor correcto
          table
            .buttons()
            .container()
            .appendTo("#usuarios-table_wrapper .col-md-12:eq(1)");

          // Inicializar tooltips
          $('[data-bs-toggle="tooltip"]').tooltip();
        } catch (err) {
          console.error("Error al inicializar DataTables:", err);
        }
      }
    }, 100); // ← Espera 100ms

    // Cleanup
    return () => {
      clearTimeout(timer);
      if ($.fn.DataTable.isDataTable("#usuarios-table")) {
        $("#usuarios-table").DataTable().destroy();
      }
    };
  }, []);

  // Datos simulados (reemplazar con llamada al backend más adelante)
  const usuarios = [
    {
      id: 1,
      name: "Admin",
      email: "admin@admin.com",
      roles: [{ name: "Administrador" }],
    },
    {
      id: 2,
      name: "Carla Almiron",
      email: "carla@gmail.com",
      roles: [{ name: "Cajero/a" }],
    },
    {
      id: 3,
      name: "Federico Molinari",
      email: "federico@gmail.com",
      roles: [{ name: "Compras" }],
    },
    {
      id: 4,
      name: "Julián Torres",
      email: "julian@gmail.com",
      roles: [{ name: "Ventas" }],
    },
    {
      id: 5,
      name: "Martina López",
      email: "martina@gmail.com",
      roles: [{ name: "Producción" }],
    },
  ];

  const handleEliminar = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, bórralo!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí iría la llamada al backend para eliminar
        Swal.fire("¡Eliminado!", "El usuario ha sido eliminado.", "success");
      }
    });
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Listado de Usuarios</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title my-1">Usuarios registrados</h3>
                <div className="card-tools">
                  <a
                    href="#"
                    className="btn btn-secondary btn-sm"
                    style={{ marginRight: "8px" }}
                  >
                    <i className="fa fa-file-pdf"></i> Reporte
                  </a>
                  <a href="#" className="btn btn-primary btn-sm">
                    <i className="fa fa-plus"></i> Crear nuevo
                  </a>
                </div>
              </div>
              <div className="card-body">
                <table
                  id="usuarios-table"
                  className="table table-striped table-bordered table-hover"
                >
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-center" style={{ width: "70px" }}>
                        Nro.
                      </th>
                      <th>Rol</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario, index) => (
                      <tr key={usuario.id}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          {usuario.roles.map((role, idx) => (
                            <span
                              key={idx}
                              className={`badge ${
                                role.name === "Administrador"
                                  ? "badge-danger"
                                  : "badge-info"
                              }`}
                              style={{ marginRight: "6px" }}
                            >
                              {role.name}
                            </span>
                          ))}
                        </td>
                        <td>{usuario.name}</td>
                        <td>{usuario.email}</td>
                        <td className="text-center">
                          {/* ✅ BOTONES PEGADOS: sin gap, usando solo btn-group */}
                          <div className="btn-group" role="group">
                            <a
                              href="#"
                              className="btn btn-info btn-sm"
                              data-bs-toggle="tooltip"
                              title="Ver Usuario"
                            >
                              <i className="fas fa-eye"></i>
                            </a>
                            <a
                              href="#"
                              className="btn btn-success btn-sm"
                              data-bs-toggle="tooltip"
                              title="Editar Usuario"
                            >
                              <i className="fas fa-pencil"></i>
                            </a>
                            {usuario.name !== "Admin" && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleEliminar(usuario.id)}
                                data-bs-toggle="tooltip"
                                title="Eliminar Usuario"
                              >
                                <i className="fas fa-trash"></i>
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
      </div>
    </div>
  );
};

export default ListadoUsuarios;
