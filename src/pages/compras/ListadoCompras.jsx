// src/pages/productos/ListadoCompras.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ListadoCompras = () => {
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arqueoAbierto, setArqueoAbierto] = useState(false);

  // FUNCIÓN PARA NAVEGAR LIMPIANDO TOOLTIPS
  const navegarSinTooltips = (url) => {
    if (window.$) window.$(".tooltip").remove();
    navigate(url);
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

  const handleReporte = () => {
    window.open("http://localhost:3001/api/compras/reporte", "_blank");
  };

  const formatDetails = (compra) => {
    let html =
      '<div class="p-3 bg-light border rounded shadow-sm m-2"><h6><strong>Productos en esta compra</strong></h6>';
    if (compra.detalles && compra.detalles.length > 0) {
      html +=
        '<table class="table table-sm table-bordered bg-white"><thead><tr class="bg-dark text-white text-center"><th>Código</th><th>Producto</th><th>Stock</th><th>Cant.</th></tr></thead><tbody>';
      compra.detalles.forEach((d) => {
        html += `<tr><td class="text-center">${
          d.producto_codigo || "N/A"
        }</td><td>${d.producto_nombre}</td><td class="text-right">${
          d.producto_stock
        }</td><td class="text-right">${d.cantidad}</td></tr>`;
      });
      html += "</tbody></table>";
    } else {
      html += '<p class="text-muted small">No hay detalles disponibles.</p>';
    }
    return html + "</div>";
  };

  // --- LÓGICA DE DATATABLES ---
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      const tableId = "#compras-table";

      if (window.$.fn.DataTable.isDataTable(tableId)) {
        window.$(tableId).DataTable().destroy();
      }

      const table = window.$(tableId).DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        responsive: true,
        pageLength: 10,
        language: {
          url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
        },
        buttons: ["copy", "pdf", "excel", "print"],
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
            window.$(this).find("i").attr("class", "fas fa-plus-circle");
          } else {
            row.child(formatDetails(compras[idx])).show();
            tr.addClass("shown");
            window.$(this).find("i").attr("class", "fas fa-minus-circle");
          }
        });

      window.$('[data-bs-toggle="tooltip"]').tooltip();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (window.$) {
        window.$(".tooltip").remove();
        if (window.$.fn.DataTable.isDataTable("#compras-table")) {
          window.$("#compras-table").DataTable().destroy();
        }
      }
    };
  }, [loading, compras]);

  if (loading)
    return (
      <div className="p-4 text-center">
        <h4>
          <i className="fas fa-spinner fa-spin"></i> Cargando compras...
        </h4>
      </div>
    );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Listado de Compras</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>
      <div className="container-fluid">
        <div className="card card-outline card-primary">
          <div className="card-header">
            <h3 className="card-title my-1">Compras registradas</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm mr-2"
                onClick={handleReporte}
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              {arqueoAbierto ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navegarSinTooltips("/compras/crear")}
                >
                  <i className="fa fa-plus"></i> Crear nueva
                </button>
              ) : (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => navegarSinTooltips("/arqueos/listado")}
                >
                  <i className="fa fa-plus"></i> Abrir caja
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div className="dt-buttons btn-group">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    window.$("#compras-table").DataTable().button(0).trigger()
                  }
                >
                  <i className="fas fa-copy"></i> Copiar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    window.$("#compras-table").DataTable().button(1).trigger()
                  }
                >
                  <i className="fas fa-file-pdf"></i> PDF
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() =>
                    window.$("#compras-table").DataTable().button(2).trigger()
                  }
                >
                  <i className="fas fa-file-excel"></i> Excel
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() =>
                    window.$("#compras-table").DataTable().button(3).trigger()
                  }
                >
                  <i className="fas fa-print"></i> Imprimir
                </button>
              </div>
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

            <table
              id="compras-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark">
                <tr className="text-center">
                  <th style={{ width: "30px" }}></th>
                  <th>Nro.</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Proveedor</th>
                  <th>Marca</th>
                  <th>Precio Total</th>
                  <th>Deuda</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c, index) => (
                  <tr key={c.id} data-index={index}>
                    <td
                      className="details-control text-center text-primary"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fas fa-plus-circle"></i>
                    </td>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">
                      {new Date(c.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="text-center">{c.comprobante}</td>
                    <td>{c.proveedor_nombre || "N/A"}</td>
                    <td>{c.proveedor_marca || "N/A"}</td>
                    <td className="text-right">
                      ${" "}
                      {parseFloat(c.precio_total).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`text-right font-weight-bold ${
                        parseFloat(c.deuda) > 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      ${" "}
                      {parseFloat(c.deuda).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-bs-toggle="tooltip"
                          title="Ver Compra"
                          onClick={() =>
                            navegarSinTooltips(`/compras/ver/${c.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          data-bs-toggle="tooltip"
                          title="Gestionar Pagos"
                          onClick={() =>
                            navegarSinTooltips(
                              `/proveedores/pagos/${c.proveedor_id}`
                            )
                          }
                        >
                          <i className="fas fa-money-bill"></i>
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

export default ListadoCompras;
