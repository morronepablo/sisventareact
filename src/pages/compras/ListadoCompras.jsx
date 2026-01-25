// src/pages/compras/ListadoCompras.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const ListadoCompras = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arqueoAbierto, setArqueoAbierto] = useState(false);

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
      const [resC, resA] = await Promise.all([
        api.get("/compras"),
        api.get("/arqueos/estado-abierto"),
      ]);
      setCompras(resC.data);
      setArqueoAbierto(resA.data.arqueoAbierto);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDetails = (compra) => {
    let html =
      '<div class="p-3 bg-light border rounded shadow-sm m-2"><h6 class="mb-3"><strong><i class="fas fa-boxes mr-2"></i>Productos en esta compra</strong></h6>';

    if (compra.detalles && compra.detalles.length > 0) {
      html += `
      <div class="table-responsive">
        <table class="table table-sm table-bordered bg-white table-hover">
          <thead>
            <tr class="bg-primary text-white text-center">
              <th style="width: 10%">Código</th>
              <th style="width: 30%">Producto</th>
              <th style="width: 15%">Cantidad</th>
              <th style="width: 15%">Precio Unit.</th>
              <th style="width: 20%">Subtotal</th>
            </tr>
          </thead>
          <tbody>`;

      compra.detalles.forEach((d) => {
        const esBulto = d.es_bulto;
        const factor = d.factor_utilizado || 1;
        const cantidad = parseFloat(d.cantidad) || 0;
        const precioPorUnidad = parseFloat(d.costo_unitario) || 0; // 🚀 PRECIO POR UNIDAD
        const subtotal = parseFloat(d.importe_total) || 0;

        // 🚗 CALCULAR UNIDADES TOTALES
        const totalUnidades = esBulto ? cantidad * factor : cantidad;

        // 🚀 CALCULAR SUBTOTAL CORRECTO: unidades totales × precio por unidad
        const subtotalCalculado = totalUnidades * precioPorUnidad;

        // Información de bultos
        const infoBulto = esBulto
          ? `<div class="small text-success">
          <i class="fas fa-box mr-1"></i>${totalUnidades.toLocaleString("es-AR")} unid. total
          <span class="text-muted ml-2">(${cantidad} bultos × ${factor})</span>
         </div>`
          : "";

        // Unidad de compra
        const unidadMostrar = esBulto
          ? `<span class="badge badge-warning">BULTO (×${factor})</span>`
          : `<span class="badge badge-info">UNIDAD</span>`;

        // 🚀 MOSTRAR PRECIO
        const precioMostrar = `<div>
           <div class="font-weight-bold">$${precioPorUnidad.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</div>
           <div class="small text-muted">por unidad</div>
         </div>`;

        // 🚀 FÓRMULA CORRECTA
        const formulaMostrar = esBulto
          ? `${totalUnidades} × $${precioPorUnidad.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
          : `${cantidad} × $${precioPorUnidad.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

        html += `<tr>
        <td class="text-center align-middle">
          <span class="badge badge-secondary">${d.producto_codigo || "N/A"}</span>
        </td>
        <td class="align-middle">
          <div class="font-weight-bold">${d.producto_nombre}</div>
          <div class="d-flex align-items-center mt-1">
            ${unidadMostrar}
            ${infoBulto}
          </div>
        </td>
        <td class="text-center align-middle">
          <div class="font-weight-bold">${cantidad.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</div>
          ${
            esBulto
              ? `<div class="small text-info">
              <i class="fas fa-boxes mr-1"></i>${factor} unid/bulto
             </div>`
              : ""
          }
        </td>
        <td class="text-right align-middle">
          ${precioMostrar}
        </td>
        <td class="text-right align-middle font-weight-bold bg-light">
          <div class="text-primary" style="font-size: 1.1em;">
            $${subtotalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div class="small text-muted mt-1">
            ${formulaMostrar}
          </div>
        </td>
      </tr>`;
      });

      html += `</tbody>
      <tfoot>
        <tr class="bg-light">
          <td colspan="4" class="text-right font-weight-bold">
            <i class="fas fa-calculator mr-1"></i>TOTAL COMPRA:
          </td>
          <td class="text-right font-weight-bold text-primary" style="font-size: 1.2em;">
            $${parseFloat(compra.precio_total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </td>
        </tr>
      </tfoot>
    </table></div>`;
    } else {
      html +=
        '<p class="text-muted small"><i class="fas fa-info-circle mr-1"></i>No hay detalles disponibles.</p>';
    }

    return html + "</div>";
  };

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      const tableId = "#compras-table";
      const $ = window.$;
      if (!$) return;

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
        lengthChange: false,
        searching: false,
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

      // Lógica de expansión de filas
      $(`${tableId} tbody`).off("click", "td.details-control");
      $(`${tableId} tbody`).on("click", "td.details-control", function () {
        var tr = $(this).closest("tr");
        var row = table.row(tr);
        var idx = tr.data("index");
        if (row.child.isShown()) {
          row.child.hide();
          tr.removeClass("shown");
          $(this).find("i").attr("class", "fas fa-plus-circle text-primary");
        } else {
          row.child(formatDetails(compras[idx])).show();
          tr.addClass("shown");
          $(this).find("i").attr("class", "fas fa-minus-circle text-danger");
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [loading, compras]);

  const handleExport = (type) => {
    const table = window.$("#compras-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>
                <i className="fas fa-shopping-cart mr-2"></i>Listado de Compras
              </b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">
              <i className="fas fa-list mr-1"></i>Compras registradas
            </h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm mr-2"
                onClick={() => abrirReporte("/api/compras/reporte")}
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              {arqueoAbierto ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navegarSinTooltips("/compras/crear")}
                >
                  <i className="fa fa-plus"></i> Nueva compra
                </button>
              ) : (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => navegarSinTooltips("/arqueos/listado")}
                >
                  <i className="fa fa-cash-register"></i> Abrir caja
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
                      .$("#compras-table")
                      .DataTable()
                      .page.len(e.target.value)
                      .draw()
                  }
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
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar..."
                  style={{ width: "200px" }}
                  onChange={(e) =>
                    window
                      .$("#compras-table")
                      .DataTable()
                      .search(e.target.value)
                      .draw()
                  }
                />
              </div>
            </div>

            <table
              id="compras-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "40px" }}></th>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Proveedor</th>
                  <th>Total</th>
                  <th style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c, index) => (
                  <tr key={c.id} data-index={index}>
                    <td
                      className="details-control text-center"
                      style={{ cursor: "pointer" }}
                    >
                      <i
                        className="fas fa-plus-circle text-primary"
                        data-toggle="tooltip"
                        title="Ver detalles de la compra"
                      ></i>
                    </td>
                    <td className="text-center align-middle">
                      <span className="badge badge-dark">{index + 1}</span>
                    </td>
                    <td className="text-center align-middle">
                      <div className="font-weight-bold">
                        {new Date(c.fecha).toLocaleDateString("es-AR")}
                      </div>
                    </td>
                    <td className="text-center align-middle">
                      <span className="badge badge-info">{c.comprobante}</span>
                    </td>
                    <td className="align-middle">
                      <div className="font-weight-bold">
                        {c.proveedor_nombre || "N/A"}
                      </div>
                    </td>
                    <td className="text-right align-middle font-weight-bold text-primary">
                      ${" "}
                      {parseFloat(c.precio_total).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-info"
                          data-toggle="tooltip"
                          title="Ver Compra Completa"
                          onClick={() =>
                            navegarSinTooltips(`/compras/ver/${c.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-warning"
                          data-toggle="tooltip"
                          title="Gestionar Pagos"
                          onClick={() =>
                            navegarSinTooltips(
                              `/proveedores/pagos/${c.proveedor_id}`,
                            )
                          }
                        >
                          <i className="fas fa-money-bill-wave"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {compras.length > 0 && (
            <div className="card-footer">
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">
                    <i className="fas fa-info-circle mr-1"></i>
                    Haz clic en{" "}
                    <i className="fas fa-plus-circle text-primary mx-1"></i>{" "}
                    para ver detalles
                  </small>
                </div>
                <div className="col-md-6 text-right">
                  <span className="badge badge-primary">
                    <i className="fas fa-boxes mr-1"></i>
                    {compras.reduce(
                      (sum, c) => sum + (c.detalles?.length || 0),
                      0,
                    )}{" "}
                    productos total
                  </span>
                  <span className="badge badge-success ml-2">
                    <i className="fas fa-dollar-sign mr-1"></i>$
                    {compras
                      .reduce(
                        (sum, c) => sum + parseFloat(c.precio_total || 0),
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListadoCompras;
