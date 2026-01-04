// src/pages/devoluciones/ListadoDevoluciones.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoDevoluciones = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { arqueoAbierto, refreshArqueoStatus } = useNotifications();
  const [devoluciones, setDevoluciones] = useState([]);
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

  const navegarSinTooltips = (url) => {
    if (window.$) window.$(".tooltip").remove();
    navigate(url);
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/devoluciones");
      setDevoluciones(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar devoluciones:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    refreshArqueoStatus();
  }, []);

  const formatDetails = (devolucion) => {
    let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';
    html +=
      '<table class="table table-sm table-bordered bg-white" style="width:100%; font-size: 0.85rem;">';
    html +=
      '<thead class="thead-dark text-center"><tr><th>Código</th><th>Producto/Combo</th><th class="text-center">Stock</th><th class="text-center">Cantidad</th></tr></thead><tbody>';

    if (devolucion.detalles && devolucion.detalles.length > 0) {
      devolucion.detalles.forEach((d) => {
        const codigo = d.producto_codigo || d.combo_codigo || "(Sin código)";
        const nombre = d.producto_nombre || d.combo_nombre || "(Sin nombre)";
        const stock = d.producto_stock !== undefined ? d.producto_stock : "-";
        const unidad = d.unidad_nombre || (d.combo_id ? "Combo" : "Unid.");

        html += `<tr>
          <td class="text-center">${codigo}</td>
          <td>${nombre}</td>
          <td class="text-right">${stock}</td>
          <td class="text-right">${d.cantidad} ${unidad}</td>
        </tr>`;
      });
    } else {
      html +=
        '<tr><td colSpan="4" class="text-center">No hay detalles.</td></tr>';
    }
    html += "</tbody></table></div>";
    return html;
  };

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      const tableId = "#devoluciones-table";
      if (window.$.fn.DataTable.isDataTable(tableId)) {
        window.$(tableId).DataTable().destroy();
      }

      const table = window.$(tableId).DataTable({
        paging: true,
        ordering: true,
        info: true,
        responsive: true,
        pageLength: 10,
        language: spanishLanguage,
        lengthChange: false,
        searching: false,
        dom: "rtip",
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
          var idx = tr.data("index");

          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass("shown");
            window
              .$(this)
              .find("i")
              .attr("class", "fas fa-plus-circle text-success");
          } else {
            row.child(formatDetails(devoluciones[idx])).show();
            tr.addClass("shown");
            window
              .$(this)
              .find("i")
              .attr("class", "fas fa-minus-circle text-danger");
          }
        });
    }, 150);
    return () => clearTimeout(timer);
  }, [loading, devoluciones]);

  const handleExport = (type) => {
    const table = window.$("#devoluciones-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Listado de Devoluciones</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Devoluciones registradas</h3>
            <div className="card-tools">
              {arqueoAbierto ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navegarSinTooltips("/devoluciones/crear")}
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
            {/* BARRA MANUAL DE CONTROLES */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-2"
                  style={{ width: "65px" }}
                  onChange={(e) =>
                    window
                      .$("#devoluciones-table")
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
                  className="form-control form-control-sm"
                  placeholder="Buscar..."
                  style={{ width: "200px" }}
                  onChange={(e) =>
                    window
                      .$("#devoluciones-table")
                      .DataTable()
                      .search(e.target.value)
                      .draw()
                  }
                />
              </div>
            </div>

            <table
              id="devoluciones-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "30px" }}></th>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Productos</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {devoluciones.map((d, index) => (
                  <tr key={d.id} data-index={index}>
                    <td
                      className="details-control text-center"
                      style={{ cursor: "pointer" }}
                    >
                      <i
                        className="fas fa-plus-circle text-success"
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                    </td>
                    <td className="text-center align-middle">{d.id}</td>
                    <td className="text-center align-middle">
                      {new Date(d.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="align-middle">{d.cliente_nombre}</td>
                    <td className="text-right align-middle font-weight-bold">
                      ${" "}
                      {parseFloat(d.precio_total).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      {d.detalles?.length || 0} producto(s)
                    </td>
                    <td className="align-middle">{d.motivo}</td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() =>
                          navegarSinTooltips(`/devoluciones/ver/${d.id}`)
                        }
                      >
                        <i className="fas fa-eye"></i>
                      </button>
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

export default ListadoDevoluciones;
