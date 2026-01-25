// src/pages/ventas/ListadoVentas.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoVentas = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { arqueoAbierto, refreshArqueoStatus } = useNotifications();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

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

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);

  const navegarSinTooltips = (url) => {
    if (window.$) {
      window.$(".tooltip").remove();
      window.$('[data-toggle="tooltip"]').tooltip("hide");
    }
    navigate(url);
  };

  const abrirReporte = (path) => {
    const token = localStorage.getItem("token");
    window.open(`${API_URL}${path}?token=${token}`, "_blank");
  };

  const fetchData = async () => {
    try {
      const resV = await api.get("/ventas");
      setVentas(resV.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    refreshArqueoStatus();
  }, [refreshArqueoStatus]);

  // 🎨 COMPONENTE PARA MOSTRAR FORMAS DE PAGO - SOLO ICONOS EN VISUAL CERRADA
  const FormasPago = ({ venta }) => {
    if (!venta) return null;

    // Obtener los montos directamente de los campos de la venta
    const efectivo = parseFloat(venta.efectivo || 0);
    const tarjeta = parseFloat(venta.tarjeta || 0);
    const mercadopago = parseFloat(venta.mercadopago || 0);
    const transferencia = parseFloat(venta.transferencia || 0);
    const billetera = parseFloat(venta.billetera || 0);
    const total = parseFloat(venta.precio_total || 0);

    // Determinar si es cuenta corriente
    const esCuentaCorriente =
      venta.es_cuenta_corriente === 1 || venta.es_cuenta_corriente === true;

    const formas = [];

    // Efectivo
    if (efectivo > 0) {
      formas.push({
        tipo: "efectivo",
        nombre: "Efectivo",
        icono: "fa-money-bill-wave",
        color: "success",
        monto: efectivo,
        porcentaje: ((efectivo / total) * 100).toFixed(1),
      });
    }

    // Tarjeta
    if (tarjeta > 0) {
      formas.push({
        tipo: "tarjeta",
        nombre: "Tarjeta",
        icono: "fa-credit-card",
        color: "primary",
        monto: tarjeta,
        porcentaje: ((tarjeta / total) * 100).toFixed(1),
      });
    }

    // Mercado Pago
    if (mercadopago > 0) {
      formas.push({
        tipo: "mercadopago",
        nombre: "MP",
        icono: "fa-mobile-alt",
        color: "info",
        monto: mercadopago,
        porcentaje: ((mercadopago / total) * 100).toFixed(1),
      });
    }

    // Transferencia
    if (transferencia > 0) {
      formas.push({
        tipo: "transferencia",
        nombre: "Transf.",
        icono: "fa-exchange-alt",
        color: "warning",
        monto: transferencia,
        porcentaje: ((transferencia / total) * 100).toFixed(1),
      });
    }

    // Billetera
    if (billetera > 0) {
      formas.push({
        tipo: "billetera",
        nombre: "Billetera",
        icono: "fa-wallet",
        color: "dark",
        monto: billetera,
        porcentaje: ((billetera / total) * 100).toFixed(1),
      });
    }

    // Cuenta Corriente
    if (esCuentaCorriente) {
      formas.push({
        tipo: "ctacte",
        nombre: "Cta. Cte.",
        icono: "fa-file-invoice-dollar",
        color: "secondary",
        monto: total,
        porcentaje: "100",
      });
    }

    // Si no hay formas de pago específicas pero el total es mayor a 0
    if (formas.length === 0 && total > 0) {
      // Intentar determinar si fue pagado en efectivo (caso común cuando no hay datos específicos)
      formas.push({
        tipo: "efectivo",
        nombre: "Efectivo",
        icono: "fa-money-bill-wave",
        color: "success",
        monto: total,
        porcentaje: "100",
      });
    }

    // En la vista cerrada solo mostramos iconos circulares
    return (
      <div className="text-center">
        <div className="d-flex justify-content-center flex-wrap">
          {formas.slice(0, 3).map((forma, idx) => (
            <div key={idx} className="position-relative mx-1">
              <span
                className={`badge badge-${forma.color}`}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  border: "2px solid white",
                }}
                title={`${forma.nombre}: ${formatMoney(forma.monto)} (${forma.porcentaje}%)`}
                data-toggle="tooltip"
                data-placement="top"
              >
                <i className={`fas ${forma.icono}`}></i>
              </span>
            </div>
          ))}
          {formas.length > 3 && (
            <span
              className="badge badge-light d-flex align-items-center justify-content-center mx-1"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "0.7rem",
              }}
              title={`${formas.length - 3} forma(s) más`}
              data-toggle="tooltip"
            >
              +{formas.length - 3}
            </span>
          )}
        </div>
        {formas.length === 1 && formas[0].porcentaje === "100" && (
          <small className="text-muted d-block mt-1">100%</small>
        )}
      </div>
    );
  };

  const formatDetails = (venta) => {
    let html = '<div class="p-2 bg-light rounded">';

    // 📊 SECCIÓN DE FORMAS DE PAGO - MUY MINIMALISTA
    const efectivo = parseFloat(venta.efectivo || 0);
    const tarjeta = parseFloat(venta.tarjeta || 0);
    const mercadopago = parseFloat(venta.mercadopago || 0);
    const transferencia = parseFloat(venta.transferencia || 0);
    const billetera = parseFloat(venta.billetera || 0);
    const total = parseFloat(venta.precio_total || 0);
    const esCuentaCorriente =
      venta.es_cuenta_corriente === 1 || venta.es_cuenta_corriente === true;

    // Solo mostrar formas de pago si hay más de una o es cuenta corriente
    const formasActivas = [
      {
        nombre: "Efectivo",
        monto: efectivo,
        icono: "fa-money-bill-wave",
        color: "success",
      },
      {
        nombre: "Tarjeta",
        monto: tarjeta,
        icono: "fa-credit-card",
        color: "primary",
      },
      {
        nombre: "MercadoPago",
        monto: mercadopago,
        icono: "fa-mobile-alt",
        color: "info",
      },
      {
        nombre: "Transferencia",
        monto: transferencia,
        icono: "fa-exchange-alt",
        color: "warning",
      },
      {
        nombre: "Billetera",
        monto: billetera,
        icono: "fa-wallet",
        color: "dark",
      },
    ].filter((f) => f.monto > 0);

    if (esCuentaCorriente) {
      formasActivas.push({
        nombre: "Cta. Cte.",
        monto: total,
        icono: "fa-file-invoice-dollar",
        color: "secondary",
        especial: true,
      });
    }

    // Solo mostrar sección si hay formas de pago específicas
    if (formasActivas.length > 0) {
      html += '<div class="mb-3 p-2 bg-white rounded border">';
      html +=
        '<div class="d-flex justify-content-between align-items-center mb-2">';
      html +=
        '<span class="font-weight-bold text-muted"><i class="fas fa-money-check-alt mr-1"></i> Formas de Pago</span>';
      html += `<span class="font-weight-bold text-success">${formatMoney(total)}</span>`;
      html += "</div>";

      // Mostrar formas de pago en una línea compacta
      html += '<div class="d-flex flex-wrap gap-1">';

      formasActivas.forEach((forma, idx) => {
        const porcentaje = ((forma.monto / total) * 100).toFixed(1);
        html += `<div class="d-flex align-items-center p-1 bg-${forma.color}-light border border-${forma.color} rounded" style="font-size: 0.85rem;">
          <i class="fas ${forma.icono} text-${forma.color} mr-1"></i>
          <span class="mr-1">${forma.nombre}:</span>
          <span class="font-weight-bold">${formatMoney(forma.monto)}</span>
          ${forma.especial ? '<span class="badge badge-secondary ml-1">Diferido</span>' : `<span class="text-muted ml-1">(${porcentaje}%)</span>`}
        </div>`;
      });

      html += "</div>";
      html += "</div>";
    }

    // 📦 SECCIÓN DE DETALLES DE PRODUCTOS - SIN CABECERA GRANDE
    html += '<div class="bg-white rounded border p-2">';
    html +=
      '<div class="d-flex justify-content-between align-items-center mb-2">';
    html +=
      '<span class="font-weight-bold text-muted"><i class="fas fa-boxes mr-1"></i> Productos</span>';
    html += `<span class="badge badge-primary">${venta.detalles?.length || 0} item(s)</span>`;
    html += "</div>";

    html += '<div style="max-height: 300px; overflow-y: auto;">';
    html +=
      '<table class="table table-sm table-borderless mb-0" style="font-size: 0.85rem;">';
    html += "<tbody>";

    if (venta.detalles && venta.detalles.length > 0) {
      venta.detalles.forEach((d, idx) => {
        const codigo = d.producto_codigo || d.combo_codigo || "";
        const nombre = d.producto_nombre || d.combo_nombre || "(Sin nombre)";
        const esBulto = d.es_bulto == 1;
        const factor = parseFloat(d.factor_utilizado) || 1;
        const cantidad = parseFloat(d.cantidad) || 0;
        const precioUnitario = parseFloat(
          d.precio_venta || d.precio_unitario || 0,
        );

        const unidadesTotales = esBulto ? cantidad * factor : cantidad;
        const importeTotal = unidadesTotales * precioUnitario;

        let cantidadMostrar = cantidad.toFixed(2);
        let unidadInfo = "";

        if (esBulto && factor > 1) {
          cantidadMostrar = `${cantidad.toFixed(0)} pack`;
          unidadInfo = `<small class="text-info d-block"><i class="fas fa-box mr-1"></i>${unidadesTotales} unid.</small>`;
        } else if (d.equivalencia_unidades && d.equivalencia_unidades > 1) {
          const totalUnidades = cantidad * d.equivalencia_unidades;
          unidadInfo = `<small class="text-success d-block"><i class="fas fa-calculator mr-1"></i>${totalUnidades} unid.</small>`;
        }

        html += `<tr class="${idx % 2 === 0 ? "bg-light" : ""}">
          <td class="align-middle" style="width: 40px;">
            <span class="badge badge-secondary">${codigo}</span>
          </td>
          <td class="align-middle">
            <div class="font-weight-bold">${nombre}</div>
            ${unidadInfo}
          </td>
          <td class="text-center align-middle" style="width: 80px;">
            <div class="font-weight-bold">${cantidadMostrar}</div>
          </td>
          <td class="text-right align-middle" style="width: 90px;">
            <div class="font-weight-bold">${formatMoney(precioUnitario)}</div>
            <small class="text-muted">${esBulto ? "por unidad" : "c/u"}</small>
          </td>
          <td class="text-right align-middle font-weight-bold text-success" style="width: 100px;">
            <div>${formatMoney(importeTotal)}</div>
          </td>
        </tr>`;
      });
    } else {
      html +=
        '<tr><td colspan="5" class="text-center text-muted">No hay productos</td></tr>';
    }

    html += "</tbody>";
    html += "</table>";
    html += "</div>";

    // Total compacto
    html += '<div class="mt-2 pt-2 border-top">';
    html += '<div class="d-flex justify-content-between align-items-center">';
    html += '<span class="font-weight-bold text-uppercase">Total:</span>';
    html += `<span class="font-weight-bold text-primary" style="font-size: 1.1rem;">${formatMoney(venta.precio_total)}</span>`;
    html += "</div>";
    html += "</div>";

    html += "</div>"; // Cierra sección de productos
    html += "</div>"; // Cierra div principal

    return html;
  };

  // 🔧 INICIALIZACIÓN DE DATATABLES Y HANDLERS
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      const $ = window.$;
      if (!$ || !$.fn.DataTable) return;

      const tableId = "#ventas-table";

      // Destruir DataTable existente si hay uno
      if ($.fn.DataTable.isDataTable(tableId)) {
        $(tableId).DataTable().destroy();
      }

      // Inicializar DataTable
      const table = $(tableId).DataTable({
        paging: true,
        ordering: true,
        info: true,
        responsive: true,
        pageLength: 10,
        language: spanishLanguage,
        lengthChange: false,
        searching: false,
        dom: "rtip",
        columnDefs: [
          { targets: 0, orderable: false },
          { targets: -1, orderable: false, width: "150px" },
          { targets: 5, orderable: false, width: "80px" },
        ],
        drawCallback: function () {
          if ($ && $.fn.tooltip) {
            $('[data-toggle="tooltip"]').tooltip("dispose");
            $('[data-toggle="tooltip"]').tooltip({
              trigger: "hover",
              boundary: "window",
            });
          }
        },
      });

      // Manejar clic en detalles
      $(`${tableId} tbody`).off("click", "td.details-control");
      $(`${tableId} tbody`).on("click", "td.details-control", function () {
        const $this = $(this);
        const tr = $this.closest("tr");
        const row = table.row(tr);
        const idx = tr.data("index");

        if (row.child.isShown()) {
          // Cerrar
          row.child.hide();
          tr.removeClass("shown");
          $this
            .find("i")
            .removeClass("fa-minus-circle text-danger")
            .addClass("fa-plus-circle text-primary");
        } else {
          // Abrir
          row.child(formatDetails(ventas[idx])).show();
          tr.addClass("shown");
          $this
            .find("i")
            .removeClass("fa-plus-circle text-primary")
            .addClass("fa-minus-circle text-danger");
        }
      });

      // Añadir botones de exportación
      new $.fn.dataTable.Buttons(table, {
        buttons: [
          {
            extend: "copy",
            text: '<i class="fas fa-copy"></i> Copiar',
            className: "btn btn-secondary btn-sm",
            title: "",
          },
          {
            extend: "pdf",
            text: '<i class="fas fa-file-pdf"></i> PDF',
            className: "btn btn-danger btn-sm",
            title: "Listado de Ventas",
          },
          {
            extend: "excel",
            text: '<i class="fas fa-file-excel"></i> Excel',
            className: "btn btn-success btn-sm",
            title: "Listado de Ventas",
          },
          {
            extend: "print",
            text: '<i class="fas fa-print"></i> Imprimir',
            className: "btn btn-warning btn-sm",
            title: "Listado de Ventas",
          },
        ],
      });

      table.buttons().container().appendTo(".dt-buttons");
    }, 150);

    return () => clearTimeout(timer);
  }, [loading, ventas]);

  const handleExport = (type) => {
    const $ = window.$;
    if (!$ || !$.fn.DataTable) return;

    const table = $("#ventas-table").DataTable();
    if (table) {
      table.button(`.buttons-${type}`).trigger();
    }
  };

  const handleEnviarWhatsApp = async (ventaId) => {
    Swal.fire({
      title: "Enviando Ticket...",
      text: "El bot de WhatsApp está procesando el envío.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const token = localStorage.getItem("token");
      await api.post(`/ventas/${ventaId}/enviar-whatsapp?token=${token}`);
      Swal.fire(
        "¡Enviado!",
        "El cliente recibió su ticket correctamente.",
        "success",
      );
    } catch (error) {
      const msg =
        error.response?.data?.message || "No se pudo enviar el mensaje.";
      Swal.fire("Atención", msg, "warning");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Listado de Ventas</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Ventas registradas</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm mr-2"
                onClick={() => abrirReporte("/api/ventas/reporte")}
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              {arqueoAbierto ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navegarSinTooltips("/ventas/crear")}
                >
                  <i className="fa fa-plus"></i> Crear nueva
                </button>
              ) : (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => navegarSinTooltips("/arqueos/crear")}
                >
                  <i className="fa fa-plus"></i> Abrir caja
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
                  onChange={(e) => {
                    const $ = window.$;
                    if ($ && $.fn.DataTable) {
                      const table = $("#ventas-table").DataTable();
                      if (table) {
                        table.page.len(e.target.value).draw();
                      }
                    }
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
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
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar..."
                style={{ width: "200px" }}
                onChange={(e) => {
                  const $ = window.$;
                  if ($ && $.fn.DataTable) {
                    const table = $("#ventas-table").DataTable();
                    if (table) {
                      table.search(e.target.value).draw();
                    }
                  }
                }}
              />
            </div>

            <table
              id="ventas-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "30px" }}></th>
                  <th>Nro.</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Precio Total</th>
                  <th>Formas de Pago</th>
                  <th>Caja</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v, index) => (
                  <tr key={v.id} data-index={index}>
                    <td
                      className="details-control text-center text-primary"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fas fa-plus-circle"></i>
                    </td>
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="text-center align-middle">
                      {new Date(v.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="text-center align-middle">
                      T {String(v.id).padStart(8, "0")}
                    </td>
                    <td className="text-right align-middle font-weight-bold text-primary">
                      {formatMoney(v.precio_total)}
                    </td>
                    <td className="align-middle">
                      <FormasPago venta={v} />
                    </td>
                    <td className="text-center align-middle font-weight-bold">
                      <span className="badge badge-info">
                        Caja {v.caja_id || v.caja_nombre || "N/A"}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      {v.usuario_nombre}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver Venta"
                          onClick={() =>
                            navegarSinTooltips(`/ventas/ver/${v.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          data-toggle="tooltip"
                          title="Imprimir Ticket"
                          onClick={() =>
                            abrirReporte(`/api/ventas/ticket/${v.id}`)
                          }
                        >
                          <i className="fas fa-print"></i>
                        </button>
                        {v.cliente_id !== 1 ? (
                          <button
                            className="btn btn-success btn-sm"
                            data-toggle="tooltip"
                            title="Enviar por WhatsApp"
                            onClick={() => handleEnviarWhatsApp(v.id)}
                          >
                            <i className="fab fa-whatsapp"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm disabled"
                            style={{ opacity: 0.5, cursor: "not-allowed" }}
                            title="No disponible para Consumidor Final"
                          >
                            <i className="fab fa-whatsapp"></i>
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

export default ListadoVentas;
