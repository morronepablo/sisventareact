// src/pages/arqueos/ListadoArqueos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoArqueos = () => {
  const [arqueos, setArqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arqueoAbierto, setArqueoAbierto] = useState(false);
  const navigate = useNavigate();

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

  const fetchData = async () => {
    try {
      const response = await api.get("/arqueos");
      setArqueos(response.data);
      setArqueoAbierto(response.data.some((arq) => arq.fecha_cierre === null));
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const format24h = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("es-AR", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDetails = (d) => {
    let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';
    html +=
      '<h6 class="mb-2"><strong>Detalle de Movimientos de Caja</strong></h6>';
    if (d.movimientos && d.movimientos.length > 0) {
      html +=
        '<table class="table table-sm table-bordered bg-white shadow-sm mb-0">';
      html +=
        '<thead class="thead-dark text-center"><tr><th>Tipo</th><th>Monto</th><th>Descripción</th><th>Fecha</th></tr></thead><tbody>';
      d.movimientos.forEach((m) => {
        const monto = new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(m.monto);
        html += `<tr><td class="text-center"><b><span class="${
          m.tipo === "Ingreso" ? "text-success" : "text-danger"
        }">${m.tipo}</span></b></td><td class="text-right">${monto}</td><td>${
          m.descripcion || ""
        }</td><td class="text-center">${format24h(m.created_at)}</td></tr>`;
      });
      html += "</tbody></table>";
    } else {
      html += '<p class="text-muted small">No hay movimientos registrados.</p>';
    }
    html += "</div>";
    return html;
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        const tableId = "#arqueos-table";
        if (window.$ && !$.fn.DataTable.isDataTable(tableId)) {
          const table = window.$(tableId).DataTable({
            paging: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            pageLength: 8,
            language: spanishLanguage,
            lengthChange: false,
            searching: false,
            dom: "rtip",
            columnDefs: [
              { targets: 0, orderable: false },
              { targets: -1, orderable: false },
            ],
          });

          window
            .$(`${tableId} tbody`)
            .on("click", "td.details-control", function () {
              var tr = window.$(this).closest("tr"),
                row = table.row(tr),
                index = tr.data("index");
              if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass("shown");
                window
                  .$(this)
                  .find("i")
                  .attr("class", "fas fa-plus-circle text-primary");
              } else {
                row.child(formatDetails(arqueos[index])).show();
                tr.addClass("shown");
                window
                  .$(this)
                  .find("i")
                  .attr("class", "fas fa-minus-circle text-danger");
              }
            });

          window.$('[data-bs-toggle="tooltip"]').tooltip();
        }
      }, 150);
      return () => {
        clearTimeout(timer);
        if (window.$) {
          window.$(".tooltip").remove();
          if (window.$.fn.DataTable.isDataTable("#arqueos-table"))
            window.$("#arqueos-table").DataTable().destroy();
        }
      };
    }
  }, [loading, arqueos]);

  const handleExport = (type) => {
    window.$("#arqueos-table").DataTable().button(`.buttons-${type}`).trigger();
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Listado de Arqueos</b>
            </h1>
          </div>
        </div>
        <hr />
        <br />
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Arqueos registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm mr-2"
                onClick={() =>
                  window.open(
                    "http://localhost:3001/api/arqueos/reporte",
                    "_blank"
                  )
                }
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              {!arqueoAbierto && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navegarSinTooltips("/arqueos/crear")}
                >
                  <i className="fa fa-plus"></i> Crear nuevo
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-2"
                  style={{ width: "65px" }}
                  onChange={(e) =>
                    window
                      .$("#arqueos-table")
                      .DataTable()
                      .page.len(e.target.value)
                      .draw()
                  }
                >
                  <option value="8">8</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
                <div className="btn-group ml-3">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleExport("copy")}
                  >
                    Copiar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleExport("pdf")}
                  >
                    PDF
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleExport("excel")}
                  >
                    Excel
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleExport("print")}
                  >
                    Imprimir
                  </button>
                </div>
              </div>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar..."
                style={{ width: "200px" }}
                onChange={(e) =>
                  window
                    .$("#arqueos-table")
                    .DataTable()
                    .search(e.target.value)
                    .draw()
                }
              />
            </div>

            <table
              id="arqueos-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "30px" }}></th>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Fecha Apertura</th>
                  <th>Monto Inicial</th>
                  <th>Fecha Cierre</th>
                  <th>Monto Final</th>
                  <th>Efectivo</th>
                  <th>Tarjetas</th>
                  <th>M. Pago</th>
                  <th>Descripción</th>
                  <th>Movimientos</th>
                  <th>Usuario</th>
                  <th style={{ width: "180px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {arqueos.map((arq, index) => {
                  const m_ini = parseFloat(arq.monto_inicial || 0);
                  const ing = parseFloat(arq.total_ingresos || 0);
                  const egr = parseFloat(arq.total_egresos || 0);
                  const m_fin = parseFloat(arq.monto_final || 0);
                  const teorico = m_ini + ing - egr;
                  const isClosed = !!arq.fecha_cierre;

                  return (
                    <tr key={arq.id} data-index={index}>
                      <td
                        className="details-control text-center"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-plus-circle text-primary"></i>
                      </td>
                      <td className="text-center font-weight-bold">
                        {index + 1}
                      </td>
                      <td className="text-center">
                        {format24h(arq.fecha_apertura)}
                      </td>
                      <td className="text-right">{formatMoney(m_ini)}</td>
                      <td className="text-center">
                        {isClosed ? format24h(arq.fecha_cierre) : "–"}
                      </td>
                      <td className="text-right">
                        {isClosed ? formatMoney(m_fin) : "–"}
                      </td>
                      <td className="text-right">
                        {formatMoney(arq.ventas_efectivo)}
                      </td>
                      <td className="text-right">
                        {formatMoney(arq.ventas_tarjeta)}
                      </td>
                      <td className="text-right">
                        {formatMoney(arq.ventas_mercadopago)}
                      </td>
                      <td>{arq.descripcion}</td>
                      <td style={{ minWidth: "200px" }}>
                        <div
                          className="row text-center m-0"
                          style={{ fontSize: "0.72rem" }}
                        >
                          <div className="col-4 p-0 text-success">
                            <b>Ingresos</b>
                            <br />
                            {formatMoney(ing)}
                          </div>
                          <div className="col-4 p-0 text-danger">
                            <b>Egresos</b>
                            <br />
                            {formatMoney(egr)}
                          </div>
                          <div className="col-4 p-0 text-warning">
                            <b>Dif.</b>
                            <br />
                            {formatMoney(isClosed ? teorico - m_fin : teorico)}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        {arq.usuario_nombre || "Admin"}
                      </td>
                      <td className="text-center">
                        <div className="btn-group">
                          <button
                            className="btn btn-info btn-sm"
                            data-bs-toggle="tooltip"
                            title="Ver Arqueo"
                            onClick={() =>
                              navegarSinTooltips(`/arqueos/ver/${arq.id}`)
                            }
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          {/* BOTONES CON LÓGICA DE DESHABILITADO */}
                          <button
                            className={`btn btn-success btn-sm ${
                              isClosed ? "disabled" : ""
                            }`}
                            data-bs-toggle="tooltip"
                            title="Editar Arqueo"
                            onClick={() =>
                              !isClosed &&
                              navegarSinTooltips(`/arqueos/editar/${arq.id}`)
                            }
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>

                          <button
                            className={`btn btn-warning btn-sm ${
                              isClosed ? "disabled" : ""
                            }`}
                            data-bs-toggle="tooltip"
                            title="Registrar Movimiento"
                            onClick={() =>
                              !isClosed &&
                              navegarSinTooltips(
                                `/arqueos/movimiento/${arq.id}`
                              )
                            }
                          >
                            <i className="fas fa-cash-register"></i>
                          </button>

                          <button
                            className={`btn btn-secondary btn-sm ${
                              isClosed ? "disabled" : ""
                            }`}
                            data-bs-toggle="tooltip"
                            title="Cerrar Arqueo"
                            onClick={() =>
                              !isClosed &&
                              navegarSinTooltips(`/arqueos/cierre/${arq.id}`)
                            }
                          >
                            <i className="fas fa-lock"></i>
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
  );
};

export default ListadoArqueos;
