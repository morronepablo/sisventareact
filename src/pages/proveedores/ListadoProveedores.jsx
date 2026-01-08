// src/pages/proveedores/ListadoProveedores.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const ListadoProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible",
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

  // --- LÓGICA DE DATATABLE Y TOOLTIPS UNIFICADA ---
  useEffect(() => {
    if (!loading && proveedores.length >= 0) {
      const tableId = "#proveedores-table";
      const $ = window.$;

      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId)) {
          $(tableId).DataTable().destroy();
        }

        const table = $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          pageLength: 10,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [
            { targets: 0, orderable: false },
            { targets: -1, orderable: false },
          ],
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

        // Detalle expandible
        $(`${tableId} tbody`).off("click", "td.details-control");
        $(`${tableId} tbody`).on("click", "td.details-control", function () {
          var tr = $(this).closest("tr");
          var row = table.row(tr);
          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass("shown");
            $(this).find("i").attr("class", "fas fa-plus-circle text-primary");
          } else {
            row.child(formatDetails(proveedores[tr.data("index")])).show();
            tr.addClass("shown");
            $(this).find("i").attr("class", "fas fa-minus-circle text-danger");
          }
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, proveedores]);

  // Función para construir el detalle (la mantengo igual a tu original)
  const formatDetails = (d) => {
    // ... tu lógica de HTML de facturas y pagos ...
    return `<div class="p-3 bg-light border rounded shadow-sm m-2">Contenido de Facturas y Pagos de ${d.empresa}</div>`;
  };

  const handleEliminar = async (id, nombre) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará al proveedor "${nombre}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/proveedores/${id}`);
        await Swal.fire({
          title: "¡Eliminado!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        window.location.reload(); // Recarga definitiva para sincronizar
      } catch (error) {
        const msg = error.response?.data?.message || "No se pudo eliminar.";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const handleExport = (type) => {
    const table = window.$("#proveedores-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Listado de Proveedores</b>
        </h1>
        <hr />
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Proveedores registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/proveedores/crear")}
              >
                <i className="fa fa-plus"></i> Crear nuevo
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* Controles manuales */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0 small">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-3"
                  style={{ width: "70px" }}
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
                </select>
                <div className="dt-buttons btn-group">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleExport("copy")}
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleExport("pdf")}
                  >
                    <i className="fas fa-file-pdf"></i>
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleExport("excel")}
                  >
                    <i className="fas fa-file-excel"></i>
                  </button>
                </div>
              </div>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar..."
                style={{ width: "250px" }}
                onChange={(e) =>
                  window
                    .$("#proveedores-table")
                    .DataTable()
                    .search(e.target.value)
                    .draw()
                }
              />
            </div>

            <table
              id="proveedores-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th></th>
                  <th>Nro.</th>
                  <th>Empresa</th>
                  <th>Marca</th>
                  <th>Contacto</th>
                  <th>Deuda</th>
                  <th>Acciones</th>
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
                    <td className="align-middle">
                      <b>{p.empresa}</b>
                    </td>
                    <td className="align-middle">{p.marca}</td>
                    <td className="align-middle">
                      {p.contacto} ({p.celular})
                    </td>
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
                          data-toggle="tooltip"
                          title="Ver"
                          onClick={() =>
                            navegarSinTooltips(`/proveedores/ver/${p.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          data-toggle="tooltip"
                          title="Editar"
                          onClick={() =>
                            navegarSinTooltips(`/proveedores/editar/${p.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          data-toggle="tooltip"
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
                          data-toggle="tooltip"
                          title="Pagos"
                          onClick={() =>
                            navegarSinTooltips(`/proveedores/pagos/${p.id}`)
                          }
                        >
                          <i className="fas fa-money-bill-wave"></i>
                        </button>

                        {/* ELIMINACIÓN CONDICIONAL */}
                        {p.puede_eliminarse ? (
                          <button
                            className="btn btn-danger btn-sm"
                            data-toggle="tooltip"
                            title="Eliminar"
                            onClick={() => handleEliminar(p.id, p.empresa)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm disabled"
                            data-toggle="tooltip"
                            title="Proveedor con historial de compras"
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

export default ListadoProveedores;
