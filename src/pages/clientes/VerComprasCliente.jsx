// src/pages/clientes/VerComprasCliente.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerComprasCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const formatDetails = (detalles) => {
    let html = `
    <div class="p-2 bg-light border rounded shadow-sm m-2">
      <table class="table table-sm table-bordered bg-white mb-0" style="width:100%; font-size: 0.85rem;">
        <thead class="thead-light">
          <tr>
            <th class="text-center">Producto / Combo</th>
            <th class="text-center">Cantidad</th>
          </tr>
        </thead>
        <tbody>`;

    detalles.forEach((d) => {
      const nombre = d.producto_nombre || d.combo_nombre || "N/A";
      const unidad = d.unidad_nombre || (d.combo_id ? "Combo" : "Unid.");
      const esCombo = d.combo_id !== null;

      // Fila principal del producto o combo
      html += `
      <tr style="${esCombo ? "background-color: #f1f1f1;" : ""}">
        <td class="${esCombo ? "font-weight-bold text-primary" : ""}">
          ${esCombo ? '<i class="fas fa-archive mr-1"></i>' : ""} ${nombre}
        </td>
        <td class="text-right font-weight-bold">${d.cantidad} ${unidad}</td>
      </tr>`;

      // 👇 Si es un combo y tiene componentes, los listamos debajo
      if (esCombo && d.componentes && d.componentes.length > 0) {
        d.componentes.forEach((comp) => {
          html += `
          <tr class="text-muted" style="font-size: 0.8rem;">
            <td style="padding-left: 30px;">
              <i class="fas fa-caret-right mr-2"></i> ${comp.nombre}
            </td>
            <td class="text-right italic">
              ${comp.cantidad} ${comp.unidad || "Unid."}
            </td>
          </tr>`;
        });
      }
    });

    html += `</tbody></table></div>`;
    return html;
  };

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const res = await api.get(`/clientes/${id}/compras`);
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        navigate("/clientes/listado");
      }
    };
    fetchCompras();
  }, [id, navigate]);

  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => {
        const tableId = "#compras-table";
        if ($.fn.DataTable.isDataTable(tableId)) {
          $(tableId).DataTable().destroy();
        }

        const table = $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [
            { targets: 0, orderable: false }, // Columna del icono
            { targets: "_all", className: "align-middle" },
          ],
        });

        // Evento para expandir/contraer
        $(`${tableId} tbody`).off("click", "td.details-control"); // Limpiar eventos previos
        $(`${tableId} tbody`).on("click", "td.details-control", function () {
          const tr = $(this).closest("tr");
          const row = table.row(tr);
          const idx = tr.data("index");

          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass("shown");
            $(this).find("i").attr("class", "fas fa-plus-circle text-success");
          } else {
            row.child(formatDetails(data.ventas[idx].detalles)).show();
            tr.addClass("shown");
            $(this).find("i").attr("class", "fas fa-minus-circle text-danger");
          }
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading)
    return (
      <div className="p-4 text-center">Cargando compras del cliente...</div>
    );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Compras de {data.cliente.nombre_cliente}</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title my-1">Compras registradas</h3>
                <div className="card-tools">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/clientes/listado")}
                  >
                    <i className="fas fa-arrow-left"></i> Volver a Clientes
                  </button>
                </div>
              </div>

              <div className="card-body">
                {/* BARRA SUPERIOR */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <label className="mr-2 mb-0">Mostrar</label>
                    <select
                      className="form-control form-control-sm mr-2"
                      style={{ width: "65px" }}
                      onChange={(e) =>
                        $("#compras-table")
                          .DataTable()
                          .page.len(e.target.value)
                          .draw()
                      }
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <div className="dt-buttons btn-group ml-3">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          $("#compras-table")
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
                          $("#compras-table")
                            .DataTable()
                            .button(".buttons-pdf")
                            .trigger()
                        }
                      >
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          $("#compras-table")
                            .DataTable()
                            .button(".buttons-excel")
                            .trigger()
                        }
                      >
                        <i className="fas fa-file-excel"></i> Excel
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar..."
                    style={{ width: "200px" }}
                    onChange={(e) =>
                      $("#compras-table")
                        .DataTable()
                        .search(e.target.value)
                        .draw()
                    }
                  />
                </div>

                <table
                  id="compras-table"
                  className="table table-striped table-bordered table-hover table-sm"
                >
                  <thead className="thead-dark text-center">
                    <tr>
                      <th style={{ width: "30px" }}></th>{" "}
                      {/* Columna para el icono */}
                      <th style={{ width: "50px" }}>Nro.</th>
                      <th>Fecha</th>
                      <th>Comprobante</th>
                      <th>Precio Total</th>
                      <th>Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ventas.map((v, index) => (
                      <tr key={v.id} data-index={index}>
                        {/* 👇 AQUÍ AGREGAMOS EL BOTÓN MANUALMENTE PARA QUE NO FALLE */}
                        <td
                          className="details-control text-center text-success"
                          style={{ cursor: "pointer" }}
                        >
                          <i className="fas fa-plus-circle"></i>
                        </td>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">
                          {new Date(v.fecha).toLocaleDateString("es-AR")}
                        </td>
                        <td className="text-center">
                          T {String(v.id).padStart(8, "0")}
                        </td>
                        <td className="text-right font-weight-bold">
                          ${" "}
                          {parseFloat(v.precio_total).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center">
                          {v.cantidad_productos} producto(s)
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

export default VerComprasCliente;
