// src/pages/arqueos/ListadoArqueos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const ListadoArqueos = () => {
  const [arqueos, setArqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arqueoAbierto, setArqueoAbierto] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.id === 1;

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

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  const abrirReporte = (path) => {
    const token = localStorage.getItem("token");
    window.open(`${API_URL}${path}?token=${token}`, "_blank");
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

  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);

  const formatDetails = (d) => {
    if (!isAdmin)
      return '<div class="p-3 bg-light border rounded m-2 text-center text-muted"><i class="fas fa-lock mr-2"></i>Detalle restringido.</div>';

    let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';
    html +=
      '<h6 class="mb-2"><strong>Desglose de Movimientos y Retiros</strong></h6>';

    // Tabla de Movimientos (Ingresos/Egresos)
    if (d.movimientos && d.movimientos.length > 0) {
      html +=
        '<table class="table table-sm table-bordered bg-white mb-2"><thead><tr className="bg-dark text-white"><th>Tipo</th><th>Monto</th><th>Descripción</th></tr></thead><tbody>';
      d.movimientos.forEach((m) => {
        html += `<tr><td><span class="${
          m.tipo === "Ingreso" ? "text-success" : "text-danger"
        }">${m.tipo}</span></td><td class="text-right">${formatMoney(
          m.monto
        )}</td><td>${m.descripcion || ""}</td></tr>`;
      });
      html += "</tbody></table>";
    }

    // Tabla de Retiros Parciales (Si existen)
    if (d.total_retiros > 0) {
      html +=
        '<p className="mb-1 text-xs text-danger"><b>Retiros de Seguridad:</b></p>';
      html += `<div className="alert alert-warning py-1 px-2 text-xs">Esta caja tuvo un retiro de seguridad por un total de <b>${formatMoney(
        d.total_retiros
      )}</b></div>`;
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
        }
      }, 150);
      return () => {
        clearTimeout(timer);
        if (window.$ && window.$.fn.DataTable.isDataTable("#arqueos-table"))
          window.$("#arqueos-table").DataTable().destroy();
      };
    }
  }, [loading, arqueos]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Listado de Arqueos</b>
        </h1>
        <hr />
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Arqueos registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm mr-2"
                onClick={() => abrirReporte("/api/arqueos/reporte")}
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
                  <th>Retiros</th> {/* 👈 NUEVA COLUMNA */}
                  {isAdmin && <th>Movimientos BI</th>}
                  <th>Usuario</th>
                  <th style={{ width: "150px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {arqueos.map((arq, index) => {
                  const m_ini = parseFloat(arq.monto_inicial || 0);
                  const ing = parseFloat(arq.total_ingresos || 0);
                  const egr = parseFloat(arq.total_egresos || 0);
                  const ret = parseFloat(arq.total_retiros || 0); // 👈 Captura de retiros
                  const m_fin = parseFloat(arq.monto_final || 0);

                  // LÓGICA DE TEÓRICO: Inicial + Ingresos - Egresos - Retiros
                  const teorico = m_ini + ing - egr - ret;
                  const isClosed = !!arq.fecha_cierre;

                  return (
                    <tr key={arq.id} data-index={index}>
                      <td className="details-control text-center">
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

                      {/* COLUMNA DE RETIROS */}
                      <td className="text-right text-danger font-weight-bold">
                        {ret > 0 ? `- ${formatMoney(ret)}` : formatMoney(0)}
                      </td>

                      {/* CELDA DE MOVIMIENTOS PARA ADMIN (Ajustada a 4 columnas) */}
                      {isAdmin && (
                        <td style={{ minWidth: "220px" }}>
                          <div
                            className="row text-center m-0"
                            style={{ fontSize: "0.68rem" }}
                          >
                            <div className="col-3 p-0 text-success">
                              <b>Ing.</b>
                              <br />
                              {formatMoney(ing)}
                            </div>
                            <div className="col-3 p-0 text-danger">
                              <b>Egr.</b>
                              <br />
                              {formatMoney(egr)}
                            </div>
                            <div className="col-3 p-0 text-maroon">
                              <b>Ret.</b>
                              <br />
                              {formatMoney(ret)}
                            </div>
                            <div
                              className={`col-3 p-0 ${
                                isClosed && Math.abs(teorico - m_fin) > 1
                                  ? "text-danger text-bold"
                                  : "text-primary"
                              }`}
                            >
                              <b>Dif.</b>
                              <br />
                              {formatMoney(
                                isClosed ? m_fin - teorico : teorico
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="text-center">
                        {arq.usuario_nombre || "Admin"}
                      </td>
                      <td className="text-center">
                        <div className="btn-group">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              navegarSinTooltips(`/arqueos/ver/${arq.id}`)
                            }
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {!isClosed && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  navegarSinTooltips(
                                    `/arqueos/editar/${arq.id}`
                                  )
                                }
                              >
                                <i className="fas fa-pencil-alt"></i>
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  navegarSinTooltips(
                                    `/arqueos/movimiento/${arq.id}`
                                  )
                                }
                              >
                                <i className="fas fa-cash-register"></i>
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  navegarSinTooltips(
                                    `/arqueos/cierre/${arq.id}`
                                  )
                                }
                              >
                                <i className="fas fa-lock"></i>
                              </button>
                            </>
                          )}
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
