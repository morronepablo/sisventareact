// src/pages/proveedores/ListadoProveedores.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const ListadoProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // OBJETO DE IDIOMA LOCAL (Evita errores de carga externa)
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

  const formatDetails = (d) => {
    let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';
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
          <td class="text-center text-capitalize">${p.metodo_pago}</td>
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
        const tableId = "#proveedores-table";
        if (window.$.fn.DataTable.isDataTable(tableId)) {
          window.$(tableId).DataTable().destroy();
        }

        const table = window.$(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 10,
          language: spanishLanguage, // APLICAR IDIOMA LOCAL
          lengthChange: false, // Desactivar el original para usar el manual superior
          searching: false, // Desactivar el original para usar el manual superior
          dom: "rtip", // Ocultar controles duplicados
          buttons: ["copy", "pdf", "csv", "excel", "print"],
          columnDefs: [
            { targets: 0, orderable: false },
            { targets: -1, orderable: false },
          ],
        });

        window.$(`${tableId} tbody`).off("click", "td.details-control");
        window
          .$(`${tableId} tbody`)
          .on("click", "td.details-control", function () {
            var tr = window.$(this).closest("tr");
            var row = table.row(tr);
            var index = tr.data("index");

            if (row.child.isShown()) {
              row.child.hide();
              tr.removeClass("shown");
              window
                .$(this)
                .find("i")
                .attr("class", "fas fa-plus-circle text-primary");
            } else {
              row.child(formatDetails(proveedores[index])).show();
              tr.addClass("shown");
              window
                .$(this)
                .find("i")
                .attr("class", "fas fa-minus-circle text-danger");
            }
          });

        if (window.$) window.$('[data-bs-toggle="tooltip"]').tooltip();
      }, 150);

      return () => {
        clearTimeout(timer);
        if (window.$) {
          window.$(".tooltip").remove();
          if (window.$.fn.DataTable.isDataTable("#proveedores-table")) {
            window.$("#proveedores-table").DataTable().destroy();
          }
        }
      };
    }
  }, [loading, proveedores]);

  const handleExport = (type) => {
    const table = window.$("#proveedores-table").DataTable();
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

  if (loading) return <LoadingSpinner />;

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
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Proveedores registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm mr-2"
                onClick={() =>
                  window.open(
                    "http://localhost:3001/api/proveedores/reporte",
                    "_blank"
                  )
                }
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/proveedores/crear")}
              >
                <i className="fa fa-plus"></i> Crear nuevo
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Barra superior manual corregida */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-2"
                  style={{ width: "65px" }}
                  onChange={(e) =>
                    window
                      .$("#proveedores-table")
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
                      .$("#proveedores-table")
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
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "30px" }}></th>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Empresa</th>
                  <th>Marca</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Contacto</th>
                  <th>Celular</th>
                  <th>Deuda</th>
                  <th style={{ width: "160px" }}>Acciones</th>
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
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="align-middle">{p.empresa}</td>
                    <td className="align-middle">{p.marca}</td>
                    <td className="text-center align-middle">{p.telefono}</td>
                    <td className="align-middle">{p.email}</td>
                    <td className="align-middle">{p.contacto}</td>
                    <td className="text-center align-middle">{p.celular}</td>
                    <td
                      className={`text-right align-middle font-weight-bold ${
                        p.deuda > 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      ${" "}
                      {parseFloat(p.deuda).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-bs-toggle="tooltip"
                          title="Ver"
                          onClick={() =>
                            navegarSinTooltips(`/proveedores/ver/${p.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          data-bs-toggle="tooltip"
                          title="Editar"
                          onClick={() =>
                            navegarSinTooltips(`/proveedores/editar/${p.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          data-bs-toggle="tooltip"
                          title="Movimientos"
                          onClick={() =>
                            navegarSinTooltips(
                              `/proveedores/movimientos/${p.id}`
                            )
                          }
                        >
                          <i className="fas fa-exchange-alt"></i>
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          data-bs-toggle="tooltip"
                          title="Pagos"
                          onClick={() =>
                            navegarSinTooltips(`/proveedores/pagos/${p.id}`)
                          }
                        >
                          <i className="fas fa-money-bill-wave"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          data-bs-toggle="tooltip"
                          title="Eliminar"
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
  );
};

export default ListadoProveedores;
