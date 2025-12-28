// src/pages/proveedores/ListadoProveedores.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const ListadoProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProveedores = async () => {
    try {
      const response = await api.get("/proveedores");
      setProveedores(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  // Función para formatear los detalles (el HTML que aparece al expandir)
  const formatDetails = (d) => {
    let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';

    // Facturas Adeudadas
    html += "<h6><strong>Facturas Adeudadas</strong></h6>";
    if (d.facturasAdeudadas && d.facturasAdeudadas.length > 0) {
      html +=
        '<table class="table table-sm table-bordered bg-white"><thead><tr class="bg-dark text-white text-center"><th>Fecha</th><th>Comprobante</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Usuario</th></tr></thead><tbody>';
      d.facturasAdeudadas.forEach((f) => {
        html += `<tr>
          <td class="text-center">${new Date(f.fecha).toLocaleDateString(
            "es-AR"
          )}</td>
          <td class="text-center">${f.comprobante}</td>
          <td class="text-right">$ ${parseFloat(f.precio_total).toLocaleString(
            "es-AR",
            { minimumFractionDigits: 2 }
          )}</td>
          <td class="text-right">$ ${parseFloat(f.total_pagado).toLocaleString(
            "es-AR",
            { minimumFractionDigits: 2 }
          )}</td>
          <td class="text-right text-danger">$ ${parseFloat(
            f.saldo_pendiente
          ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
          <td class="text-center">${f.usuario_nombre || "Desconocido"}</td>
        </tr>`;
      });
      html += "</tbody></table>";
    } else {
      html += '<p class="text-muted small">No hay facturas adeudadas.</p>';
    }

    // Pagos Realizados
    html += '<h6 class="mt-3"><strong>Pagos Realizados</strong></h6>';
    if (d.pagosRealizados && d.pagosRealizados.length > 0) {
      html +=
        '<table class="table table-sm table-bordered bg-white"><thead><tr class="bg-dark text-white text-center"><th>Fecha</th><th>Comprobante</th><th>Monto</th><th>Método</th><th>Usuario</th></tr></thead><tbody>';
      d.pagosRealizados.forEach((p) => {
        html += `<tr>
          <td class="text-center">${new Date(p.fecha_pago).toLocaleDateString(
            "es-AR"
          )}</td>
          <td class="text-center">${p.comprobante || "Sin Comprobante"}</td>
          <td class="text-right">$ ${parseFloat(p.monto).toLocaleString(
            "es-AR",
            { minimumFractionDigits: 2 }
          )}</td>
          <td class="text-center">${p.metodo_pago}</td>
          <td class="text-center">${p.usuario_nombre || "Desconocido"}</td>
        </tr>`;
      });
      html += "</tbody></table>";
    } else {
      html += '<p class="text-muted small">No hay pagos realizados.</p>';
    }
    html += "</div>";
    return html;
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (!$.fn.DataTable.isDataTable("#proveedores-table")) {
          const table = $("#proveedores-table").DataTable({
            paging: true,
            lengthChange: false,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            pageLength: 10,
            language: {
              url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
            },
            // Definimos los botones para que funcionen con los triggers personalizados
            buttons: ["copy", "pdf", "csv", "excel", "print"],
            columnDefs: [
              { targets: 0, orderable: false }, // Columna de expansión
              { targets: -1, orderable: false }, // Columna de acciones
            ],
          });

          // Manejar la expansión al hacer click en el icono
          $("#proveedores-table tbody").on(
            "click",
            "td.details-control",
            function () {
              var tr = $(this).closest("tr");
              var row = table.row(tr);
              var index = tr.data("index");

              if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass("shown");
                $(this)
                  .find("i")
                  .removeClass("fa-minus-circle")
                  .addClass("fa-plus-circle");
              } else {
                row.child(formatDetails(proveedores[index])).show();
                tr.addClass("shown");
                $(this)
                  .find("i")
                  .removeClass("fa-plus-circle")
                  .addClass("fa-minus-circle");
              }
            }
          );

          $('[data-bs-toggle="tooltip"]').tooltip();
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if ($.fn.DataTable.isDataTable("#proveedores-table")) {
          $("#proveedores-table").DataTable().destroy();
        }
      };
    }
  }, [loading, proveedores]);

  // Handlers para botones de exportación (Igual que en usuarios)
  const handleExport = (type) => {
    const table = $("#proveedores-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
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
        await api.delete(`/proveedores/${id}`);
        Swal.fire("¡Eliminado!", "El proveedor ha sido eliminado.", "success");
        fetchProveedores();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el proveedor.", "error");
      }
    }
  };

  if (loading) return <div className="p-4">Cargando proveedores...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Listado de Proveedores</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title my-1">Proveedores registrados</h3>
                <div className="card-tools">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginRight: "8px" }}
                    onClick={() =>
                      window.open("/api/proveedores/reporte", "_blank")
                    }
                  >
                    <i className="fa fa-file-pdf"></i> Reporte
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      (window.location.href = "/proveedores/crear")
                    }
                  >
                    <i className="fa fa-plus"></i> Crear nuevo
                  </button>
                </div>
              </div>

              <div className="card-body">
                {/* Barra superior de controles idéntica a Usuarios */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <label className="mr-2">Mostrar</label>
                    <select
                      className="form-control form-control-sm mr-2"
                      style={{ width: "60px" }}
                      onChange={(e) =>
                        $("#proveedores-table")
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
                    <span>registros</span>

                    <div className="dt-buttons btn-group ml-3">
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
                      className="form-control form-control-sm mr-2"
                      placeholder="Buscar..."
                      style={{ width: "200px" }}
                      onChange={(e) =>
                        $("#proveedores-table")
                          .DataTable()
                          .search(e.target.value)
                          .draw()
                      }
                    />
                  </div>
                </div>

                <table
                  id="proveedores-table"
                  className="table table-striped table-bordered table-hover table-sm"
                >
                  <thead className="thead-dark">
                    <tr className="text-center">
                      <th style={{ width: "30px" }}></th>
                      <th style={{ width: "50px" }}>Nro.</th>
                      <th>Empresa</th>
                      <th>Marca</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Contacto</th>
                      <th>Celular</th>
                      <th>Deuda</th>
                      <th style={{ width: "150px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((p, index) => (
                      <tr key={p.id} data-index={index}>
                        <td
                          className="details-control text-center text-primary"
                          style={{ cursor: "pointer" }}
                        >
                          <i className="fas fa-plus-circle"></i>
                        </td>
                        <td className="text-center">{index + 1}</td>
                        <td>{p.empresa}</td>
                        <td>{p.marca}</td>
                        <td className="text-center">{p.telefono}</td>
                        <td>{p.email}</td>
                        <td>{p.contacto}</td>
                        <td className="text-center">{p.celular}</td>
                        <td
                          className={`text-right font-weight-bold ${
                            p.deuda > 0 ? "text-danger" : "text-success"
                          }`}
                        >
                          ${" "}
                          {parseFloat(p.deuda).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-info btn-sm"
                              data-bs-toggle="tooltip"
                              title="Ver Proveedor"
                              onClick={() =>
                                (window.location.href = `/proveedores/ver/${p.id}`)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              data-bs-toggle="tooltip"
                              title="Editar Proveedor"
                              onClick={() =>
                                (window.location.href = `/proveedores/editar/${p.id}`)
                              }
                            >
                              <i className="fas fa-pencil"></i>
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              data-bs-toggle="tooltip"
                              title="Ver Movimientos"
                              onClick={() =>
                                (window.location.href = `/proveedores/movimientos/${p.id}`)
                              }
                            >
                              <i className="fas fa-exchange-alt"></i>
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              data-bs-toggle="tooltip"
                              title="Ir a Pagos"
                              onClick={() =>
                                (window.location.href = `/proveedores/pagos/${p.id}`)
                              }
                            >
                              <i className="fas fa-money-bill-wave"></i>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              data-bs-toggle="tooltip"
                              title="Eliminar Proveedor"
                              onClick={() => handleEliminar(p.id)}
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

export default ListadoProveedores;
