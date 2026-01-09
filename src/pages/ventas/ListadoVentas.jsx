// // src/pages/ventas/ListadoVentas.jsx
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import api from "../../services/api";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { useNotifications } from "../../context/NotificationContext";
// import LoadingSpinner from "../../components/LoadingSpinner";

// const ListadoVentas = () => {
//   const navigate = useNavigate();
//   const { hasPermission } = useAuth();
//   const { arqueoAbierto, refreshArqueoStatus } = useNotifications();
//   const [ventas, setVentas] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const spanishLanguage = {
//     sProcessing: "Procesando...",
//     sLengthMenu: "Mostrar _MENU_ registros",
//     sZeroRecords: "No se encontraron resultados",
//     sEmptyTable: "Ningún dato disponible en esta tabla",
//     sInfo:
//       "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
//     sSearch: "Buscar:",
//     oPaginate: {
//       sFirst: "Primero",
//       sLast: "Último",
//       sNext: "Siguiente",
//       sPrevious: "Anterior",
//     },
//   };

//   const navegarSinTooltips = (url) => {
//     if (window.$) window.$(".tooltip").remove();
//     navigate(url);
//   };

//   const fetchData = async () => {
//     try {
//       const resV = await api.get("/ventas");
//       setVentas(resV.data);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error al cargar ventas:", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     refreshArqueoStatus();
//   }, [refreshArqueoStatus]);

//   const formatDetails = (venta) => {
//     let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';
//     html +=
//       '<table class="table table-sm table-bordered bg-white" style="width:100%; font-size: 0.85rem;">';
//     html +=
//       '<thead class="thead-dark text-center"><tr><th>Código</th><th>Producto/Combo</th><th class="text-center">Stock</th><th class="text-center">Cantidad</th></tr></thead><tbody>';

//     if (venta.detalles && venta.detalles.length > 0) {
//       venta.detalles.forEach((d) => {
//         const codigo = d.producto_codigo || d.combo_codigo || "(Sin código)";
//         const nombre = d.producto_nombre || d.combo_nombre || "(Sin nombre)";
//         const stock = d.producto_stock !== undefined ? d.producto_stock : "-";
//         const unidad = d.unidad_nombre || (d.combo_id ? "Combo" : "Unid.");

//         html += `<tr>
//           <td class="text-center">${codigo}</td>
//           <td>${nombre}</td>
//           <td class="text-right">${stock}</td>
//           <td class="text-right">${d.cantidad} ${unidad}</td>
//         </tr>`;
//       });
//     } else {
//       html +=
//         '<tr><td colspan="4" class="text-center">No hay productos para mostrar.</td></tr>';
//     }

//     html += "</tbody></table></div>";
//     return html;
//   };

//   useEffect(() => {
//     if (loading) return;

//     const timer = setTimeout(() => {
//       const tableId = "#ventas-table";
//       if (window.$.fn.DataTable.isDataTable(tableId)) {
//         window.$(tableId).DataTable().destroy();
//       }

//       const table = window.$(tableId).DataTable({
//         paging: true,
//         ordering: true,
//         info: true,
//         responsive: true,
//         pageLength: 10,
//         language: spanishLanguage,
//         // 👇 CONFIGURACIÓN PARA ELIMINAR DOBLE BÚSQUEDA Y SELECTOR
//         lengthChange: false,
//         searching: false,
//         dom: "rtip",
//         buttons: ["copy", "pdf", "csv", "excel", "print"],
//         columnDefs: [
//           { targets: 0, orderable: false },
//           { targets: -1, orderable: false },
//         ],
//       });

//       window.$(`${tableId} tbody`).off("click", "td.details-control");
//       window
//         .$(`${tableId} tbody`)
//         .on("click", "td.details-control", function () {
//           var tr = window.$(this).closest("tr");
//           var row = table.row(tr);
//           var idx = tr.data("index");

//           if (row.child.isShown()) {
//             row.child.hide();
//             tr.removeClass("shown");
//             window
//               .$(this)
//               .find("i")
//               .attr("class", "fas fa-plus-circle text-primary");
//           } else {
//             row.child(formatDetails(ventas[idx])).show();
//             tr.addClass("shown");
//             window
//               .$(this)
//               .find("i")
//               .attr("class", "fas fa-minus-circle text-danger");
//           }
//         });

//       if (window.$) window.$('[data-bs-toggle="tooltip"]').tooltip();
//     }, 150);

//     return () => {
//       clearTimeout(timer);
//       if (window.$) {
//         window.$(".tooltip").remove();
//         if (window.$.fn.DataTable.isDataTable("#ventas-table")) {
//           window.$("#ventas-table").DataTable().destroy();
//         }
//       }
//     };
//   }, [loading, ventas]);

//   const handleExport = (type) => {
//     const table = window.$("#ventas-table").DataTable();
//     table.button(`.buttons-${type}`).trigger();
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="content-header">
//       <div className="container-fluid">
//         <div className="row mb-2">
//           <div className="col-sm-6">
//             <h1 className="m-0">
//               <b>Listado de Ventas</b>
//             </h1>
//           </div>
//         </div>
//         <hr />
//       </div>

//       <div className="container-fluid">
//         <div className="card card-outline card-primary shadow-sm">
//           <div className="card-header">
//             <h3 className="card-title my-1">Ventas registradas</h3>
//             <div className="card-tools">
//               <button
//                 className="btn btn-secondary btn-sm mr-2"
//                 onClick={() =>
//                   window.open(
//                     "http://localhost:3001/api/ventas/reporte",
//                     "_blank"
//                   )
//                 }
//               >
//                 <i className="fa fa-file-pdf"></i> Reporte
//               </button>
//               {arqueoAbierto ? (
//                 <button
//                   className="btn btn-primary btn-sm"
//                   onClick={() => navegarSinTooltips("/ventas/crear")}
//                 >
//                   <i className="fa fa-plus"></i> Crear nueva
//                 </button>
//               ) : (
//                 <button
//                   className="btn btn-warning btn-sm"
//                   onClick={() => navegarSinTooltips("/arqueos/crear")}
//                 >
//                   <i className="fa fa-plus"></i> Abrir caja
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="card-body">
//             {/* BARRA MANUAL DE CONTROLES */}
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <div className="d-flex align-items-center">
//                 <label className="mr-2 mb-0">Mostrar</label>
//                 <select
//                   className="form-control form-control-sm mr-2"
//                   style={{ width: "65px" }}
//                   onChange={(e) =>
//                     window
//                       .$("#ventas-table")
//                       .DataTable()
//                       .page.len(e.target.value)
//                       .draw()
//                   }
//                 >
//                   <option value="10">10</option>
//                   <option value="25">25</option>
//                   <option value="50">50</option>
//                   <option value="100">100</option>
//                 </select>
//                 <span className="mr-3">registros</span>

//                 <div className="dt-buttons btn-group">
//                   <button
//                     className="btn btn-secondary btn-sm"
//                     onClick={() => handleExport("copy")}
//                   >
//                     <i className="fas fa-copy"></i> Copiar
//                   </button>
//                   <button
//                     className="btn btn-danger btn-sm"
//                     onClick={() => handleExport("pdf")}
//                   >
//                     <i className="fas fa-file-pdf"></i> PDF
//                   </button>
//                   <button
//                     className="btn btn-info btn-sm"
//                     onClick={() => handleExport("csv")}
//                   >
//                     <i className="fas fa-file-csv"></i> CSV
//                   </button>
//                   <button
//                     className="btn btn-success btn-sm"
//                     onClick={() => handleExport("excel")}
//                   >
//                     <i className="fas fa-file-excel"></i> Excel
//                   </button>
//                   <button
//                     className="btn btn-warning btn-sm"
//                     onClick={() => handleExport("print")}
//                   >
//                     <i className="fas fa-print"></i> Imprimir
//                   </button>
//                 </div>
//               </div>

//               <div className="d-flex align-items-center">
//                 <input
//                   type="text"
//                   className="form-control form-control-sm"
//                   placeholder="Buscar..."
//                   style={{ width: "200px" }}
//                   onChange={(e) =>
//                     window
//                       .$("#ventas-table")
//                       .DataTable()
//                       .search(e.target.value)
//                       .draw()
//                   }
//                 />
//               </div>
//             </div>

//             <table
//               id="ventas-table"
//               className="table table-striped table-bordered table-hover table-sm"
//             >
//               <thead className="thead-dark text-center">
//                 <tr>
//                   <th style={{ width: "30px" }}></th>
//                   <th>Nro.</th>
//                   <th>Fecha</th>
//                   <th>Comprobante</th>
//                   <th>Precio Original</th>
//                   <th>Desc. %</th>
//                   <th>Desc. Monto</th>
//                   <th>Precio Total</th>
//                   <th>Productos</th>
//                   <th>Efectivo</th>
//                   <th>Tarjeta</th>
//                   <th>M. Pago</th>
//                   <th>Transf.</th>
//                   <th>Usuario</th>
//                   <th>Acciones</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {ventas.map((v, index) => {
//                   const pDescMonto =
//                     parseFloat(v.precio_total) +
//                     parseFloat(v.descuento_monto || 0);
//                   const pOriginal =
//                     v.descuento_porcentaje > 0
//                       ? pDescMonto / (1 - v.descuento_porcentaje / 100)
//                       : pDescMonto;

//                   return (
//                     <tr key={v.id} data-index={index}>
//                       <td
//                         className="details-control text-center text-primary"
//                         style={{ cursor: "pointer" }}
//                       >
//                         <i className="fas fa-plus-circle"></i>
//                       </td>
//                       <td className="text-center align-middle">{index + 1}</td>
//                       <td className="text-center align-middle">
//                         {new Date(v.fecha).toLocaleDateString("es-AR")}
//                       </td>
//                       <td className="text-center align-middle">
//                         T {String(v.id).padStart(8, "0")}
//                       </td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {pOriginal.toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-right align-middle">
//                         {parseFloat(v.descuento_porcentaje || 0).toFixed(2)} %
//                       </td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(v.descuento_monto || 0).toLocaleString(
//                           "es-AR",
//                           { minimumFractionDigits: 2 }
//                         )}
//                       </td>
//                       <td className="text-right align-middle font-weight-bold text-primary">
//                         ${" "}
//                         {parseFloat(v.precio_total).toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-center align-middle">
//                         {v.detalles?.length || 0} producto(s)
//                       </td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(v.efectivo || 0).toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(v.tarjeta || 0).toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(v.mercadopago || 0).toLocaleString(
//                           "es-AR",
//                           { minimumFractionDigits: 2 }
//                         )}
//                       </td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(v.transferencia || 0).toLocaleString(
//                           "es-AR",
//                           { minimumFractionDigits: 2 }
//                         )}
//                       </td>
//                       <td className="text-center align-middle">
//                         {v.usuario_nombre}
//                       </td>
//                       <td className="text-center align-middle">
//                         <div className="btn-group">
//                           <button
//                             className="btn btn-info btn-sm"
//                             data-bs-toggle="tooltip"
//                             title="Ver Venta"
//                             onClick={() =>
//                               navegarSinTooltips(`/ventas/ver/${v.id}`)
//                             }
//                           >
//                             <i className="fas fa-eye"></i>
//                           </button>
//                           <button
//                             className="btn btn-warning btn-sm"
//                             data-bs-toggle="tooltip"
//                             title="Imprimir Ticket"
//                             onClick={() =>
//                               window.open(
//                                 `http://localhost:3001/api/ventas/ticket/${v.id}`,
//                                 "_blank"
//                               )
//                             }
//                           >
//                             <i className="fas fa-print"></i>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ListadoVentas;

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

  // URL dinámica para Reportes
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

  // Función para abrir reportes con TOKEN
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

  const formatDetails = (venta) => {
    let html = '<div class="p-3 bg-light border rounded shadow-sm m-2">';
    html +=
      '<table class="table table-sm table-bordered bg-white" style="width:100%; font-size: 0.85rem;">';
    html +=
      '<thead class="thead-dark text-center"><tr><th>Código</th><th>Producto/Combo</th><th class="text-center">Cantidad</th></tr></thead><tbody>';

    if (venta.detalles && venta.detalles.length > 0) {
      venta.detalles.forEach((d) => {
        const codigo = d.producto_codigo || d.combo_codigo || "(Sin código)";
        const nombre = d.producto_nombre || d.combo_nombre || "(Sin nombre)";
        const unidad = d.unidad_nombre || (d.combo_id ? "Combo" : "Unid.");
        html += `<tr><td class="text-center">${codigo}</td><td>${nombre}</td><td class="text-right">${d.cantidad} ${unidad}</td></tr>`;
      });
    } else {
      html +=
        '<tr><td colspan="3" class="text-center">No hay productos.</td></tr>';
    }
    html += "</tbody></table></div>";
    return html;
  };

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      const tableId = "#ventas-table";
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

      // LÓGICA DEL ABANICO (DETALLES)
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
          row.child(formatDetails(ventas[idx])).show();
          tr.addClass("shown");
          $(this).find("i").attr("class", "fas fa-minus-circle text-danger");
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [loading, ventas]);

  const handleExport = (type) => {
    const table = window.$("#ventas-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
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
                  onChange={(e) =>
                    window
                      .$("#ventas-table")
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
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar..."
                style={{ width: "200px" }}
                onChange={(e) =>
                  window
                    .$("#ventas-table")
                    .DataTable()
                    .search(e.target.value)
                    .draw()
                }
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
                      ${" "}
                      {parseFloat(v.precio_total).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
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
