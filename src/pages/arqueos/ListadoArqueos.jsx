// src/pages/arqueos/ListadoArqueos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
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

  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount || 0);

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

  // --- 🚀 FUNCIÓN DEL ABANICO (DETALLE EXPANDIBLE) 🚀 ---
  const formatDetails = (d) => {
    if (!isAdmin)
      return '<div class="p-2 text-muted small">Detalle restringido.</div>';

    let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';
    html +=
      '<h6 class="mb-2"><strong>Desglose de Movimientos y Retiros</strong></h6>';

    if (d.movimientos && d.movimientos.length > 0) {
      html +=
        '<table class="table table-sm table-bordered bg-white mb-2 shadow-sm">';
      html +=
        '<thead class="thead-dark text-center" style="font-size:0.75rem"><tr><th>Tipo</th><th>Monto</th><th>Descripción</th></tr></thead><tbody>';
      d.movimientos.forEach((m) => {
        html += `<tr><td class="text-center"><span class="${
          m.tipo === "Ingreso" ? "text-success" : "text-danger"
        }"><b>${m.tipo}</b></span></td><td class="text-right">${formatMoney(
          m.monto
        )}</td><td>${m.descripcion || ""}</td></tr>`;
      });
      html += "</tbody></table>";
    } else {
      html +=
        '<p class="text-muted small">No hay movimientos manuales registrados.</p>';
    }

    if (parseFloat(d.total_retiros) > 0) {
      html += `<div class="alert alert-warning py-1 px-2 text-xs mb-0 mt-2 shadow-sm">
                <i class="fas fa-exclamation-triangle mr-1"></i> Se realizaron retiros de seguridad por: <b>${formatMoney(
                  d.total_retiros
                )}</b>
              </div>`;
    }
    html += "</div>";
    return html;
  };

  const fetchData = async () => {
    try {
      const response = await api.get("/arqueos");
      setArqueos(response.data);
      setArqueoAbierto(response.data.some((arq) => arq.fecha_cierre === null));
      setLoading(false);
    } catch (error) {
      console.error("Error cargando arqueos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- INICIALIZACIÓN DE DATATABLES CON EVENTO DE CLIC ---
  useEffect(() => {
    if (!loading && arqueos.length > 0) {
      const tableId = "#arqueos-table";
      const $ = window.$;

      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();

        const table = $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 8,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [{ targets: [0, -1], orderable: false }],
        });

        // 🟢 Vinculamos el evento de clic al botón (+) del abanico 🟢
        $(`${tableId} tbody`).off("click", "td.details-control"); // Limpiamos evento previo
        $(`${tableId} tbody`).on("click", "td.details-control", function () {
          const tr = $(this).closest("tr");
          const row = table.row(tr);
          const index = tr.data("index");

          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass("shown");
            $(this).find("i").attr("class", "fas fa-plus-circle text-primary");
          } else {
            row.child(formatDetails(arqueos[index])).show();
            tr.addClass("shown");
            $(this).find("i").attr("class", "fas fa-minus-circle text-danger");
          }
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, arqueos]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1 className="m-0 text-bold text-dark">Listado de Arqueos</h1>
        <hr />
        <div className="card card-outline card-primary shadow-sm mt-3">
          <div className="card-header">
            <h3 className="card-title text-bold">Historial de Cajas</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm mr-2 shadow-sm"
                onClick={() =>
                  window.open(
                    `${API_URL}/api/arqueos/reporte?token=${localStorage.getItem(
                      "token"
                    )}`,
                    "_blank"
                  )
                }
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              {!arqueoAbierto && (
                <button
                  className="btn btn-primary btn-sm shadow-sm"
                  onClick={() => navigate("/arqueos/crear")}
                >
                  <i className="fa fa-plus"></i> Abrir Caja
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            <table
              id="arqueos-table"
              className="table table-bordered table-striped table-hover table-sm shadow-sm"
            >
              <thead className="thead-dark text-center text-xs">
                <tr>
                  <th style={{ width: "30px" }}></th>
                  <th style={{ width: "40px" }}>Nro.</th>
                  <th>Apertura</th>
                  <th>M. Inicial</th>
                  <th>Cierre</th>
                  <th>M. Final</th>
                  <th>Efectivo</th>
                  <th>Tarjetas</th>
                  <th>M. Pago</th>
                  <th>Retiros</th>
                  {isAdmin && <th>Movimientos BI</th>}
                  <th>Usuario</th>
                  <th style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {arqueos.map((arq, index) => {
                  const m_ini = parseFloat(arq.monto_inicial || 0);
                  const v_efe = parseFloat(arq.ventas_efectivo || 0);
                  const ing = parseFloat(arq.total_ingresos || 0);
                  const egr = parseFloat(arq.total_egresos || 0);
                  const ret = parseFloat(arq.total_retiros || 0);
                  const m_fin = parseFloat(arq.monto_final || 0);
                  const isClosed = !!arq.fecha_cierre;

                  // LÓGICA BI: Saldo si está abierta, Diferencia si está cerrada.
                  const saldoActual = m_ini + v_efe + ing - egr - ret;
                  const valorAMostrar = isClosed
                    ? parseFloat(arq.diferencia)
                    : saldoActual;

                  return (
                    <tr key={arq.id} data-index={index}>
                      <td
                        className="details-control text-center"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-plus-circle text-primary shadow-sm"></i>
                      </td>
                      <td className="text-center font-weight-bold">
                        {index + 1}
                      </td>
                      <td className="text-center small">
                        {format24h(arq.fecha_apertura)}
                      </td>
                      <td className="text-right">{formatMoney(m_ini)}</td>
                      <td className="text-center small">
                        {isClosed ? format24h(arq.fecha_cierre) : "–"}
                      </td>
                      <td className="text-right font-weight-bold">
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
                      <td className="text-right text-danger font-weight-bold">
                        {ret > 0 ? `- ${formatMoney(ret)}` : formatMoney(0)}
                      </td>

                      {isAdmin && (
                        <td style={{ minWidth: "210px" }}>
                          <div
                            className="row text-center m-0"
                            style={{ fontSize: "0.68rem" }}
                          >
                            <div className="col-3 p-0 text-success">
                              <b>Ing.</b>
                              <br />
                              {formatMoney(v_efe + ing)}
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
                                isClosed && Math.abs(valorAMostrar) > 1
                                  ? "text-danger text-bold"
                                  : "text-primary text-bold"
                              }`}
                            >
                              <b>{isClosed ? "Dif." : "Saldo"}</b>
                              <br />
                              {formatMoney(valorAMostrar)}
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="text-center small">
                        {arq.usuario_nombre || "Admin"}
                      </td>
                      <td className="text-center">
                        <div className="btn-group shadow-sm">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => navigate(`/arqueos/ver/${arq.id}`)}
                            title="Ver Detalle"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {!isClosed && (
                            <>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  navigate(`/arqueos/movimiento/${arq.id}`)
                                }
                                title="Registrar Movimiento"
                              >
                                <i className="fas fa-cash-register"></i>
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  navigate(`/arqueos/cierre/${arq.id}`)
                                }
                                title="Cerrar Caja"
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
