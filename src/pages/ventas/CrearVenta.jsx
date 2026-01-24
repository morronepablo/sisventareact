// // src/pages/ventas/CrearVenta.jsx
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from "react";
// import api from "../../services/api";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
// import { useNotifications } from "../../context/NotificationContext";
// import { useAuth } from "../../context/AuthContext";
// import LoadingSpinner from "../../components/LoadingSpinner";

// const CrearVenta = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { refreshAll, arqueoAbierto } = useNotifications();
//   const API_URL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3001"
//       : "https://sistema-ventas-backend-3nn3.onrender.com";

//   // --- ⏰ ESTADO DEL RELOJ ---
//   const [currentTime, setCurrentTime] = useState("");

//   // --- CONFIGURACIÓN DE IDIOMA LOCAL ---
//   const spanishLanguage = {
//     sProcessing: "Procesando...",
//     sLengthMenu: "Mostrar _MENU_ registros",
//     sZeroRecords: "No se encontraron resultados",
//     sEmptyTable: "Ningún dato disponible en esta tabla",
//     sInfo: "Mostrando _START_ a _END_ de _TOTAL_ registros",
//     sSearch: "Buscar:",
//     oPaginate: {
//       sFirst: "Primero",
//       sLast: "Último",
//       sNext: "Siguiente",
//       sPrevious: "Anterior",
//     },
//   };

//   const [loading, setLoading] = useState(true);
//   const [productos, setProductos] = useState([]);
//   const [combos, setCombos] = useState([]);
//   const [clientes, setClientes] = useState([]);
//   const [tmpVentas, setTmpVentas] = useState([]);
//   const [promos, setPromos] = useState([]);
//   const [dolar, setDolar] = useState(1499.5);
//   const [cantidad, setCantidad] = useState(1);
//   const [codigo, setCodigo] = useState("");
//   // 🕵️‍♂️ ESTADOS CONSULTADOR 🕵️‍♂️
//   const [busquedaConsulta, setBusquedaConsulta] = useState("");
//   const [productoConsultado, setProductoConsultado] = useState(null);
//   const [fecha, setFecha] = useState(() => {
//     const hoy = new Date();
//     const offset = hoy.getTimezoneOffset() * 60000;
//     return new Date(hoy - offset).toISOString().split("T")[0];
//   });
//   const [clienteSel, setClienteSel] = useState({
//     id: 1,
//     nombre_cliente: "Consumidor Final",
//     cuil_codigo: "00000000000",
//     puntos: 0,
//     saldo_billetera: 0,
//   });
//   const [deudaInfo, setDeudaInfo] = useState({ deuda_total: 0, dias_mora: 0 });
//   const [descPorcentaje, setDescPorcentaje] = useState(0);
//   const [descMonto, setDescMonto] = useState(0);
//   const [pagos, setPagos] = useState({
//     efectivo: 0,
//     tarjeta: 0,
//     mercadopago: 0,
//     transferencia: 0,
//     billetera: 0,
//   });
//   const [esCtaCte, setEsCtaCte] = useState(false);
//   const [vueltoABilletera, setVueltoABilletera] = useState(false);
//   const [nuevoCliente, setNuevoCliente] = useState({
//     nombre_cliente: "",
//     cuil_codigo: "",
//     telefono: "",
//     email: "",
//   });

//   const formatMoney = (val) =>
//     new Intl.NumberFormat("es-AR", {
//       style: "currency",
//       currency: "ARS",
//       minimumFractionDigits: 2,
//     }).format(val || 0);

//   const calcularAhorroItem = (item) => {
//     const promo = promos.find(
//       (p) => p.producto_id === item.producto_id && p.estado === 1,
//     );
//     if (!promo) return 0;
//     const precio = parseFloat(item.precio_venta || 0);
//     const cant = parseFloat(item.cantidad || 0);
//     if (promo.tipo === "3x2" && cant >= 3) return Math.floor(cant / 3) * precio;
//     if (promo.tipo === "2da_al_70" && cant >= 2)
//       return Math.floor(cant / 2) * (precio * 0.7);
//     if (promo.tipo === "2da_al_50" && cant >= 2)
//       return Math.floor(cant / 2) * (precio * 0.5);
//     if (promo.tipo === "4x3" && cant >= 4) return Math.floor(cant / 4) * precio;
//     return 0;
//   };

//   const totalCantidad = tmpVentas.reduce(
//     (acc, it) => acc + parseFloat(it.cantidad),
//     0,
//   );
//   const subtotalBruto = tmpVentas.reduce((acc, it) => {
//     let precio = parseFloat(it.precio_venta || it.combo_precio || 0);
//     if (it.aplicar_porcentaje)
//       precio =
//         parseFloat(it.precio_compra) *
//         (1 + parseFloat(it.valor_porcentaje) / 100);
//     return acc + parseFloat(it.cantidad) * precio;
//   }, 0);
//   const ahorroTotalPromos = tmpVentas.reduce(
//     (acc, it) => acc + calcularAhorroItem(it),
//     0,
//   );
//   const totalDescuentoManual =
//     (subtotalBruto - ahorroTotalPromos) *
//       (parseFloat(descPorcentaje || 0) / 100) +
//     parseFloat(descMonto || 0);
//   const totalFinal = Math.max(
//     subtotalBruto - ahorroTotalPromos - totalDescuentoManual,
//     0,
//   );
//   const totalDolares = totalFinal / dolar;
//   const totalPagado = Object.values(pagos).reduce(
//     (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
//     0,
//   );
//   const montoSaldar = Math.max(totalFinal - totalPagado, 0);
//   const otrosMediosSinBilletera =
//     parseFloat(pagos.tarjeta || 0) +
//     parseFloat(pagos.mercadopago || 0) +
//     parseFloat(pagos.transferencia || 0);
//   const saldoUsadoBilletera = parseFloat(pagos.billetera || 0);
//   // ✅ CÁLCULO CORREGIDO DEL VUELTO (sin redeclarar totalPagado)
//   const efectivoPagado = parseFloat(pagos.efectivo || 0);
//   const totalPagadoSinEfectivo =
//     parseFloat(pagos.tarjeta || 0) +
//     parseFloat(pagos.mercadopago || 0) +
//     parseFloat(pagos.transferencia || 0) +
//     parseFloat(pagos.billetera || 0);
//   // El vuelto es la diferencia entre lo pagado y el total final
//   const vueltoFisicoReal = Math.max(totalPagado - totalFinal, 0);
//   // El efectivo necesario es el total final menos lo pagado con otros medios (incluyendo billetera)
//   const efectivoNecesario = Math.max(totalFinal - totalPagadoSinEfectivo, 0);

//   const fetchData = async () => {
//     if (!user) return;
//     try {
//       const [resP, resCl, resCo, resTmp, resDolar, resPromos] =
//         await Promise.all([
//           api.get("/productos"),
//           api.get("/clientes"),
//           api.get("/combos").catch(() => ({ data: [] })),
//           api.get(`/ventas/tmp?usuario_id=${user.id}`),
//           fetch("https://dolarapi.com/v1/dolares/bolsa")
//             .then((r) => r.json())
//             .catch(() => ({ venta: 1476.1 })),
//           api.get("/promociones").catch(() => ({ data: [] })),
//         ]);
//       setProductos(resP.data);
//       setClientes(resCl.data);
//       setCombos(resCo.data);
//       setTmpVentas(resTmp.data);
//       setDolar(resDolar.venta || 1476.1);
//       setPromos(resPromos.data);
//       setLoading(false);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     if (arqueoAbierto === null || !user) return;
//     if (arqueoAbierto === false) {
//       Swal.fire({
//         icon: "error",
//         title: "Caja Cerrada",
//         text: "Debe abrir caja antes de realizar una venta",
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       navigate("/ventas/listado");
//       return;
//     }
//     fetchData();
//   }, [arqueoAbierto, user]);

//   const handleConfirmarVenta = async () => {
//     if (!esCtaCte && totalPagado < totalFinal)
//       return Swal.fire("Error", "Monto insuficiente", "error");
//     if (parseFloat(pagos.billetera) > parseFloat(clienteSel.saldo_billetera))
//       return Swal.fire("Error", "Saldo insuficiente en billetera", "error");
//     Swal.fire({
//       title: "Procesando Venta...",
//       text: "Estamos registrando la operación y actualizando el stock.",
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       },
//     });
//     try {
//       const pagosSaneados = {
//         ...pagos,
//         efectivo: Math.max(
//           parseFloat(pagos.efectivo || 0) - vueltoFisicoReal,
//           0,
//         ),
//       };
//       const payload = {
//         cliente_id: clienteSel.id,
//         fecha,
//         precio_total: totalFinal,
//         pagos: { ...pagosSaneados, pago_billetera: pagos.billetera },
//         es_cuenta_corriente: esCtaCte,
//         usuario_id: user.id,
//         empresa_id: user.empresa_id,
//         items: tmpVentas,
//         descuento_porcentaje: descPorcentaje,
//         descuento_monto: descMonto,
//         puntos_canjeados:
//           Number(descMonto) === Number(clienteSel.puntos)
//             ? clienteSel.puntos
//             : 0,
//         cargar_vuelto_billetera:
//           document.getElementById("switch-vuelto-billetera")?.checked || false,
//         vuelto_monto: vueltoFisicoReal,
//       };
//       const res = await api.post("/ventas", payload);
//       if (res.data.success) {
//         window.$("#modal-pagos").modal("hide");
//         await new Promise((resolve) => setTimeout(resolve, 700));
//         if (refreshAll) await refreshAll();
//         if (res.data.venta_id) {
//           try {
//             const response = await api.get(
//               `/ventas/ticket/${res.data.venta_id}`,
//               { responseType: "blob" },
//             );
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement("a");
//             link.href = url;
//             link.setAttribute("download", `ticket_${res.data.venta_id}.pdf`);
//             document.body.appendChild(link);
//             link.click();
//             link.parentNode.removeChild(link);
//             window.URL.revokeObjectURL(url);
//           } catch (error) {
//             console.error("Error ticket", error);
//           }
//         }
//         await Swal.fire({
//           position: "center",
//           icon: "success",
//           title: "¡Venta Registrada!",
//           text: "La operación finalizó correctamente.",
//           showConfirmButton: false,
//           timer: 2000,
//         });
//         setPagos({
//           efectivo: 0,
//           tarjeta: 0,
//           mercadopago: 0,
//           transferencia: 0,
//           billetera: 0,
//         });
//         setClienteSel({
//           id: 1,
//           nombre_cliente: "Consumidor Final",
//           cuil_codigo: "00000000000",
//           puntos: 0,
//           saldo_billetera: 0,
//         });
//         setDeudaInfo({ deuda_total: 0, dias_mora: 0 });
//         setDescPorcentaje(0);
//         setDescMonto(0);
//         setCodigo("");
//         setCantidad(1);
//         setEsCtaCte(false);
//         setVueltoABilletera(false);
//         fetchData();
//       }
//     } catch (e) {
//       console.error(e);
//       Swal.fire("Error", "Fallo al registrar la venta", "error");
//     }
//   };

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.ctrlKey && e.key === "F9") {
//         e.preventDefault();
//         e.stopImmediatePropagation();
//         setBusquedaConsulta("");
//         setProductoConsultado(null);
//         window.$("#modal-consultador").modal("show");
//         setTimeout(
//           () => document.getElementById("input-consulta")?.focus(),
//           500,
//         );
//         return;
//       }
//       // ✅ F12: Enfocar efectivo
//       if (e.key === "F12") {
//         e.preventDefault();
//         if (tmpVentas.length > 0) {
//           window.$("#modal-pagos").modal("show");
//           setTimeout(() => {
//             const inp = document.getElementById("pago-efectivo");
//             if (inp) {
//               inp.focus();
//               inp.select();
//             }
//           }, 500);
//         }
//       }
//       // ✅ Ctrl + F12: Enfocar Mercado Pago
//       if (e.ctrlKey && e.key === "F12") {
//         e.preventDefault();
//         if (tmpVentas.length > 0) {
//           window.$("#modal-pagos").modal("show");
//           setTimeout(() => {
//             const inp = document.getElementById("pago-mercadopago");
//             if (inp) {
//               inp.focus();
//               inp.select();
//             }
//           }, 500);
//         }
//       }
//       // ✅ F5: Registrar venta
//       if (e.key === "F5") {
//         e.preventDefault();
//         if (tmpVentas.length > 0) {
//           const m = document.getElementById("modal-pagos");
//           if (m && !m.classList.contains("show"))
//             window.$("#modal-pagos").modal("show");
//           else handleConfirmarVenta();
//         }
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown, true);
//     return () => window.removeEventListener("keydown", handleKeyDown, true);
//   }, [
//     tmpVentas,
//     totalPagado,
//     totalFinal,
//     vueltoFisicoReal,
//     esCtaCte,
//     clienteSel,
//     pagos,
//   ]);

//   const addItem = async (codigoItem) => {
//     try {
//       const res = await api.post("/ventas/tmp", {
//         codigo: codigoItem.trim(),
//         cantidad,
//         usuario_id: user.id,
//       });
//       if (res.data.success) {
//         setCodigo("");
//         setCantidad(1);
//         fetchData();
//       } else {
//         Swal.fire("Error", res.data.message, "error");
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleGuardarNuevoCliente = async () => {
//     try {
//       const res = await api.post("/clientes", {
//         ...nuevoCliente,
//         empresa_id: user.empresa_id,
//       });
//       if (res.data.id) {
//         window.$("#modal-crear-cliente").modal("hide");
//         fetchData();
//         Swal.fire({
//           icon: "success",
//           title: "Cliente registrado",
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     } catch (e) {
//       Swal.fire("Error", "No se pudo crear", "error");
//     }
//   };

//   useEffect(() => {
//     if (!loading) {
//       setTimeout(() => {
//         ["#prod-table", "#clie-table"].forEach((id) => {
//           if (window.$.fn.DataTable.isDataTable(id))
//             window.$(id).DataTable().destroy();
//           window.$(id).DataTable({
//             paging: true,
//             pageLength: 5,
//             language: spanishLanguage,
//             autoWidth: false,
//           });
//         });
//       }, 400);
//     }
//   }, [loading]);

//   // --- ⏰ EFECTO DEL RELOJ ---
//   useEffect(() => {
//     const updateTime = () => {
//       const now = new Date();
//       const hours = String(now.getHours()).padStart(2, "0");
//       const minutes = String(now.getMinutes()).padStart(2, "0");
//       const seconds = String(now.getSeconds()).padStart(2, "0");
//       setCurrentTime(`${hours}:${minutes}:${seconds}`);
//     };

//     updateTime(); // Inicializa el reloj
//     const intervalId = setInterval(updateTime, 1000); // Actualiza cada segundo

//     return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
//   }, []);

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="content-header">
//       <div className="container-fluid">
//         <div className="row mb-2">
//           <div className="col-sm-6">
//             <h1>
//               <b>Registro de una nueva venta</b>
//             </h1>
//           </div>
//           <div className="col-sm-6 text-right">
//             <span className="badge badge-info p-2 ml-1 shadow-sm">
//               CTRL+F9: Consultar
//             </span>
//             <span className="badge badge-secondary p-2 ml-1 shadow-sm">
//               SHIFT+F1: Listado Ventas
//             </span>
//             <span className="badge badge-danger p-2 ml-1 shadow-sm">
//               F5: Registrar Venta
//             </span>
//             <span className="badge badge-success p-2 ml-1 shadow-sm">
//               F12: Efectivo
//             </span>
//           </div>
//         </div>
//         <hr />
//         <div className="row">
//           {/* 🎨 PANEL IZQUIERDO CON ESTILO OSCURO */}
//           <div className="col-md-8">
//             <div
//               className="card card-outline shadow-lg h-100"
//               style={{
//                 backgroundColor: "#1e2229",
//                 borderTop: "4px solid #00f2fe",
//                 borderLeft: "none",
//                 borderRight: "none",
//                 borderBottom: "none",
//               }}
//             >
//               <div className="card-body">
//                 <div className="row mb-3">
//                   <div className="col-md-2">
//                     <label className="text-muted text-xs mb-1">
//                       Cantidad *
//                     </label>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm bg-dark text-white text-center"
//                       value={cantidad}
//                       onChange={(e) => setCantidad(e.target.value)}
//                       style={{ fontSize: "1rem" }}
//                     />
//                   </div>
//                   <div className="col-md-7">
//                     <label className="text-muted text-xs mb-1">Código</label>
//                     <div className="input-group">
//                       <div className="input-group-prepend">
//                         <span className="input-group-text bg-dark text-white">
//                           <i className="fas fa-barcode"></i>
//                         </span>
//                       </div>
//                       <input
//                         type="text"
//                         className="form-control form-control-sm bg-dark text-white"
//                         value={codigo}
//                         onChange={(e) => setCodigo(e.target.value)}
//                         onKeyDown={(e) => e.key === "Enter" && addItem(codigo)}
//                         autoFocus
//                         placeholder="Código o nombre..."
//                         style={{ fontSize: "1rem" }}
//                       />
//                       <div className="input-group-append">
//                         <button
//                           className="btn btn-primary btn-sm"
//                           data-toggle="modal"
//                           data-target="#modal-productos"
//                           style={{ fontSize: "1rem" }}
//                         >
//                           <i className="fas fa-search"></i>
//                         </button>
//                         <button
//                           className="btn btn-success btn-sm"
//                           onClick={() => navigate("/productos/crear")}
//                           style={{ fontSize: "1rem" }}
//                         >
//                           <i className="fas fa-plus"></i>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="table-responsive mt-3">
//                   <table className="table table-sm table-striped table-bordered">
//                     {/* 👇 CABECERA CON FONDO OSCURO Y TEXTO AZUL CIAN (#00f2fe) */}
//                     <thead
//                       className="text-center"
//                       style={{ backgroundColor: "#2d323b", color: "#00f2fe" }}
//                     >
//                       <tr>
//                         <th>Nro.</th>
//                         <th>Código</th>
//                         <th style={{ width: "120px" }}>Cantidad</th>
//                         <th>Producto/Combo</th>
//                         <th>Unidad</th>
//                         <th>Precio</th>
//                         <th>Total</th>
//                         <th>Acción</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {tmpVentas.map((it, i) => {
//                         const ahorro = calcularAhorroItem(it);
//                         const precioBase = parseFloat(
//                           it.precio_venta || it.combo_precio,
//                         );
//                         return (
//                           <tr
//                             key={it.id}
//                             style={{
//                               backgroundColor: "#2d323b",
//                               color: "white",
//                             }}
//                           >
//                             <td className="text-center align-middle">
//                               {i + 1}
//                             </td>
//                             <td className="text-center align-middle">
//                               {it.codigo || it.combo_codigo}
//                             </td>
//                             <td className="text-center align-middle">
//                               <div className="btn-group btn-group-sm">
//                                 <button
//                                   className="btn btn-outline-secondary btn-xs"
//                                   onClick={() =>
//                                     api
//                                       .put(`/ventas/tmp/${it.id}`, {
//                                         cantidad: parseFloat(it.cantidad) - 1,
//                                       })
//                                       .then(fetchData)
//                                   }
//                                   style={{ fontSize: "0.8rem" }}
//                                 >
//                                   -
//                                 </button>
//                                 <span
//                                   className="px-2 font-weight-bold align-self-center"
//                                   style={{ fontSize: "0.9rem" }}
//                                 >
//                                   {it.cantidad}
//                                 </span>
//                                 <button
//                                   className="btn btn-outline-secondary btn-xs"
//                                   onClick={() =>
//                                     api
//                                       .put(`/ventas/tmp/${it.id}`, {
//                                         cantidad: parseFloat(it.cantidad) + 1,
//                                       })
//                                       .then(fetchData)
//                                   }
//                                   style={{ fontSize: "0.8rem" }}
//                                 >
//                                   +
//                                 </button>
//                               </div>
//                             </td>
//                             <td className="align-middle">
//                               {it.nombre || it.combo_nombre}
//                               {ahorro > 0 && (
//                                 <span
//                                   className="badge badge-success ml-2"
//                                   style={{ fontSize: "0.7rem" }}
//                                 >
//                                   PROMO
//                                 </span>
//                               )}
//                             </td>
//                             <td className="text-center align-middle">
//                               {it.unidad_nombre || "Unid."}
//                             </td>
//                             <td className="text-right align-middle">
//                               {formatMoney(precioBase)}
//                             </td>
//                             <td className="text-right align-middle text-bold">
//                               {ahorro > 0 ? (
//                                 <div>
//                                   <del
//                                     className="text-muted small"
//                                     style={{ fontSize: "0.8rem" }}
//                                   >
//                                     {formatMoney(it.cantidad * precioBase)}
//                                   </del>
//                                   <br />
//                                   <span style={{ fontSize: "0.9rem" }}>
//                                     {formatMoney(
//                                       it.cantidad * precioBase - ahorro,
//                                     )}
//                                   </span>
//                                 </div>
//                               ) : (
//                                 formatMoney(it.cantidad * precioBase)
//                               )}
//                             </td>
//                             <td className="text-center align-middle">
//                               <button
//                                 className="btn btn-danger btn-sm"
//                                 onClick={async () => {
//                                   await api.delete(`/ventas/tmp/${it.id}`);
//                                   fetchData();
//                                 }}
//                                 style={{ fontSize: "0.8rem" }}
//                               >
//                                 <i className="fas fa-trash"></i>
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                     {/* 👇 FILA DE TOTALES CON COLOR AMARILLO BRILLANTE */}
//                     <tfoot className="bg-dark">
//                       <tr className="text-bold" style={{ color: "#ffc107" }}>
//                         <td colSpan="2" className="text-right">
//                           Total Cant.
//                         </td>
//                         <td className="text-center">{totalCantidad}</td>
//                         <td colSpan="3" className="text-right">
//                           Subtotal
//                         </td>
//                         <td className="text-right">
//                           {formatMoney(subtotalBruto)}
//                         </td>
//                         <td></td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* 🚀 LADO DERECHO: PANEL "THE ORACLE" */}
//           <div className="col-md-4">
//             <div
//               className="card card-outline card-dark shadow-lg h-100"
//               style={{
//                 backgroundColor: "#1e2229",
//                 borderTop: "4px solid #00f2fe",
//               }}
//             >
//               <div className="card-body">
//                 <div className="row mb-3">
//                   <div className="col-9">
//                     <button
//                       className="btn btn-primary btn-sm btn-block shadow-sm"
//                       data-toggle="modal"
//                       data-target="#modal-clientes"
//                     >
//                       <i className="fas fa-search mr-1"></i> BUSCAR CLIENTE
//                     </button>
//                   </div>
//                   <div className="col-3">
//                     <button
//                       className="btn btn-success btn-sm btn-block shadow-sm"
//                       data-toggle="modal"
//                       data-target="#modal-crear-cliente"
//                     >
//                       <i className="fas fa-plus"></i>
//                     </button>
//                   </div>
//                 </div>
//                 <div className="row mb-2">
//                   <div className="col-md-12">
//                     <label className="text-muted text-xs mb-1">
//                       CLIENTE SELECCIONADO
//                     </label>
//                     <div
//                       className="bg-black p-2 rounded border border-secondary text-info text-bold text-uppercase"
//                       style={{ fontSize: "0.9rem" }}
//                     >
//                       {clienteSel.nombre_cliente}{" "}
//                       <small className="float-right text-muted">
//                         {clienteSel.cuil_codigo}
//                       </small>
//                     </div>
//                   </div>
//                 </div>
//                 {/* INFO PUNTOS Y BILLETERA */}
//                 {clienteSel.id !== 1 && (
//                   <div className="mt-2 animate__animated animate__fadeIn">
//                     <div
//                       className="d-flex justify-content-between mb-1 p-2 rounded"
//                       style={{
//                         border: "1px dashed #ffc107",
//                         backgroundColor: "rgba(255,193,7,0.05)",
//                       }}
//                     >
//                       <span className="text-warning small text-bold">
//                         🌟 PUNTOS: {clienteSel.puntos} (
//                         {formatMoney(clienteSel.puntos)})
//                       </span>
//                       {clienteSel.puntos > 0 && (
//                         <button
//                           className="btn btn-xs btn-warning text-bold px-2"
//                           onClick={() => setDescMonto(clienteSel.puntos)}
//                         >
//                           CANJEAR
//                         </button>
//                       )}
//                     </div>
//                     {parseFloat(clienteSel.saldo_billetera) > 0 && (
//                       <div className="p-2 rounded mb-2 border border-success text-success small text-bold">
//                         <i className="fas fa-wallet mr-1"></i> BILLETERA:{" "}
//                         {formatMoney(clienteSel.saldo_billetera)}
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 <div className="form-group mt-3">
//                   <label className="text-muted text-xs text-bold text-uppercase">
//                     Total Neto a Cobrar
//                   </label>
//                   <div
//                     className="p-3 text-right rounded shadow-inset"
//                     style={{
//                       backgroundColor: "#000",
//                       border: "1px solid #28a745",
//                     }}
//                   >
//                     <span
//                       style={{
//                         fontSize: "2.8rem",
//                         fontWeight: "900",
//                         color: "#28a745",
//                         letterSpacing: "-1px",
//                       }}
//                     >
//                       {formatMoney(totalFinal)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className="col-6">
//                     <label className="text-muted text-xs">DESC. %</label>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm bg-dark text-white text-right border-secondary"
//                       value={descPorcentaje}
//                       onChange={(e) => setDescPorcentaje(e.target.value)}
//                     />
//                   </div>
//                   <div className="col-6">
//                     <label className="text-muted text-xs">DESC. $</label>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm bg-dark text-white text-right border-secondary"
//                       value={descMonto}
//                       onChange={(e) => setDescMonto(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className="col-6">
//                     <label className="text-muted text-xs text-uppercase text-bold">
//                       Dólar MEP (Vta)
//                     </label>
//                     <div className="p-2 bg-black border border-info rounded text-right text-info text-bold shadow-sm">
//                       {formatMoney(dolar)}
//                     </div>
//                   </div>
//                   <div className="col-6">
//                     <label className="text-muted text-xs text-uppercase text-bold">
//                       Total USD
//                     </label>
//                     <div className="p-2 bg-black border border-primary rounded text-right text-primary text-bold shadow-sm">
//                       U$D {totalDolares.toFixed(2)}
//                     </div>
//                   </div>
//                 </div>
//                 <div
//                   className={`p-3 text-right border rounded mb-3 ${
//                     deudaInfo.deuda_total > 0
//                       ? "border-danger"
//                       : "border-success"
//                   }`}
//                   style={{ backgroundColor: "#000", borderStyle: "dashed" }}
//                 >
//                   <small className="text-muted text-uppercase text-bold">
//                     Estado Cuenta Corriente
//                   </small>
//                   <div
//                     className={`h4 m-0 font-weight-bold ${
//                       deudaInfo.deuda_total > 0 ? "text-danger" : "text-success"
//                     }`}
//                   >
//                     {formatMoney(deudaInfo.deuda_total)}
//                   </div>
//                   <small className="text-muted font-italic">
//                     {deudaInfo.dias_mora} días de mora acumulada
//                   </small>
//                 </div>
//                 {/* --- ⏰ RELOJ EN FORMATO 24H --- */}
//                 <div
//                   className="p-2 mb-3 text-right"
//                   style={{
//                     backgroundColor: "#000",
//                     borderRadius: "5px",
//                     border: "1px solid #00f2fe",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "1.2rem",
//                       fontWeight: "bold",
//                       color: "#00f2fe",
//                     }}
//                   >
//                     {currentTime}
//                   </span>
//                 </div>
//                 <button
//                   className="btn btn-success btn-block btn-lg shadow-lg mt-3 text-bold"
//                   data-toggle="modal"
//                   data-target="#modal-pagos"
//                   style={{
//                     height: "70px",
//                     fontSize: "1.6rem",
//                     border: "none",
//                     background:
//                       "linear-gradient(180deg, #28a745 0%, #218838 100%)",
//                   }}
//                 >
//                   <i className="fa-regular fa-floppy-disk mr-2"></i> REGISTRAR
//                   (F5)
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* --- MODALES --- */}
//       <div className="modal fade" id="modal-consultador" tabIndex="-1">
//         <div className="modal-dialog modal-dialog-centered modal-lg">
//           <div
//             className="modal-content shadow-lg border-0"
//             style={{ borderRadius: "15px" }}
//           >
//             <div
//               className="modal-header bg-navy text-white"
//               style={{ borderRadius: "15px 15px 0 0" }}
//             >
//               <h5 className="modal-title font-weight-bold">
//                 <i className="fas fa-search-dollar mr-2"></i>Consultador de
//                 Precios Rápido
//               </h5>
//               <button className="close text-white" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body p-4">
//               <input
//                 id="input-consulta"
//                 type="text"
//                 className="form-control form-control-lg shadow-sm border-info"
//                 placeholder="Escanee código o escriba nombre..."
//                 autoComplete="off"
//                 value={busquedaConsulta}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   setBusquedaConsulta(val);
//                   if (val.length > 2) {
//                     const p = productos.find(
//                       (x) =>
//                         x.codigo === val ||
//                         x.nombre.toLowerCase().includes(val.toLowerCase()),
//                     );
//                     if (p) {
//                       setProductoConsultado({ ...p, esCombo: false });
//                       return;
//                     }
//                     const c = combos.find(
//                       (x) =>
//                         x.codigo === val ||
//                         x.nombre.toLowerCase().includes(val.toLowerCase()),
//                     );
//                     if (c) {
//                       setProductoConsultado({ ...c, esCombo: true });
//                     } else {
//                       setProductoConsultado(null);
//                     }
//                   } else {
//                     setProductoConsultado(null);
//                   }
//                 }}
//               />
//               {productoConsultado ? (
//                 <div className="card mt-4 animate__animated animate__fadeIn border shadow-none">
//                   <div className="card-body text-center">
//                     <span
//                       className={`badge ${
//                         productoConsultado.esCombo
//                           ? "badge-warning"
//                           : "badge-primary"
//                       } p-2 mb-2`}
//                     >
//                       {productoConsultado.esCombo
//                         ? "PAQUETE / COMBO"
//                         : "PRODUCTO INDIVIDUAL"}
//                     </span>
//                     <h3 className="text-bold text-navy">
//                       {productoConsultado.nombre}
//                     </h3>
//                     <div
//                       className="p-3 rounded mb-3"
//                       style={{ backgroundColor: "#f0f4f8" }}
//                     >
//                       <span className="text-muted d-block small uppercase text-bold">
//                         Precio de Venta Actual
//                       </span>
//                       <h1 className="display-3 font-weight-bold text-success mb-0">
//                         {formatMoney(productoConsultado.precio_venta)}
//                       </h1>
//                     </div>
//                     <div className="row">
//                       <div className="col-6 border-right">
//                         <span className="text-muted small d-block text-bold">
//                           STOCK
//                         </span>
//                         <h4
//                           className={
//                             productoConsultado.esCombo
//                               ? "text-muted"
//                               : productoConsultado.stock <=
//                                   productoConsultado.stock_minimo
//                                 ? "text-danger"
//                                 : "text-primary"
//                           }
//                         >
//                           {productoConsultado.esCombo
//                             ? "N/A"
//                             : `${productoConsultado.stock} unidades`}
//                         </h4>
//                       </div>
//                       <div className="col-6">
//                         <span className="text-muted small d-block text-bold">
//                           VENDIDOS
//                         </span>
//                         <h4 className="text-dark font-weight-bold">
//                           {productoConsultado.veces_vendido || 0} unidades
//                         </h4>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center p-5 text-muted">
//                   <i className="fas fa-barcode fa-4x mb-3 opacity-25"></i>
//                   <p>Ingrese código o nombre del producto...</p>
//                 </div>
//               )}
//             </div>
//             <div
//               className="modal-footer bg-light"
//               style={{ borderRadius: "0 0 15px 15px" }}
//             >
//               <button
//                 className="btn btn-secondary btn-block"
//                 data-dismiss="modal"
//               >
//                 CERRAR (ESC)
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* 💳 MODAL PAGOS (CORREGIDO Y ESTILIZADO) */}
//       <div className="modal fade" id="modal-pagos" tabIndex="-1">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content shadow-lg">
//             <div className="modal-header bg-primary text-white">
//               <h5>Ingresar Pago</h5>
//               <button className="close text-white" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="form-group row align-items-center mb-3">
//                 <label className="col-sm-5 text-bold">Cuenta Corriente</label>
//                 <div className="col-sm-7">
//                   <input
//                     type="checkbox"
//                     checked={esCtaCte}
//                     onChange={(e) => setEsCtaCte(e.target.checked)}
//                     style={{ width: "20px", height: "20px" }}
//                   />
//                 </div>
//               </div>
//               {[
//                 "efectivo",
//                 "tarjeta",
//                 "mercadopago",
//                 "transferencia",
//                 "billetera",
//               ].map((m) => {
//                 if (
//                   m === "billetera" &&
//                   (!clienteSel.saldo_billetera ||
//                     clienteSel.saldo_billetera <= 0)
//                 )
//                   return null;
//                 return (
//                   <div className="form-group row mb-2" key={m}>
//                     <label className="col-sm-5 text-capitalize text-bold">
//                       {m === "billetera" ? (
//                         <>
//                           <i className="fas fa-wallet text-success mr-1"></i>{" "}
//                           Billetera
//                         </>
//                       ) : (
//                         m
//                       )}
//                     </label>
//                     <div className="col-sm-7 input-group">
//                       <input
//                         id={
//                           m === "efectivo"
//                             ? "pago-efectivo"
//                             : m === "mercadopago"
//                               ? "pago-mercadopago"
//                               : ""
//                         }
//                         type="number"
//                         className="form-control text-right font-weight-bold"
//                         style={{
//                           backgroundColor:
//                             m === "efectivo"
//                               ? "#d4edda"
//                               : m === "billetera"
//                                 ? "#e1f5fe"
//                                 : "#e9ecef",
//                           fontSize: "1.4rem",
//                           height: "45px",
//                         }}
//                         value={pagos[m]}
//                         onChange={(e) =>
//                           setPagos({ ...pagos, [m]: e.target.value })
//                         }
//                       />
//                       <div className="input-group-append">
//                         <button
//                           className="btn btn-primary"
//                           onClick={() => {
//                             let max = totalFinal;
//                             if (m === "billetera")
//                               max = Math.min(
//                                 totalFinal,
//                                 clienteSel.saldo_billetera,
//                               );
//                             setPagos({ ...pagos, [m]: max.toFixed(2) });
//                           }}
//                         >
//                           $
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               <hr />
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold">Total a Pagar</label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold bg-light"
//                     style={{ fontSize: "1.4rem" }}
//                     value={formatMoney(totalFinal)}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold text-info">
//                   Precio Dólar
//                 </label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold bg-light text-info"
//                     style={{ fontSize: "1.2rem" }}
//                     value={formatMoney(dolar)}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold text-primary">
//                   Total USD
//                 </label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold bg-light text-primary"
//                     style={{ fontSize: "1.4rem" }}
//                     value={`$USD ${totalDolares.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               <div className="form-group row text-success">
//                 <label className="col-sm-5 text-bold">
//                   {vueltoABilletera
//                     ? "Vuelto a Cargar en Billetera"
//                     : "Vuelto en Efectivo"}
//                 </label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className={`form-control text-right font-weight-bold bg-light ${
//                       vueltoABilletera ? "text-primary" : "text-success"
//                     }`}
//                     style={{ fontSize: "1.4rem" }}
//                     value={formatMoney(vueltoFisicoReal)}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold">Monto a Saldar</label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className={`form-control text-right font-weight-bold bg-light ${
//                       montoSaldar > 0 ? "text-danger" : "text-success"
//                     }`}
//                     style={{ fontSize: "1.4rem" }}
//                     value={formatMoney(montoSaldar)}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               {/* ✅ SWITCH: Cargar vuelto a billetera */}
//               {clienteSel.id !== 1 && vueltoFisicoReal > 0 && (
//                 <div className="form-group row align-items-center">
//                   <label className="col-sm-5 text-bold">
//                     <i className="fas fa-wallet text-primary mr-1"></i>
//                     Cargar vuelto a billetera
//                   </label>
//                   <div className="col-sm-7">
//                     <div className="custom-control custom-switch">
//                       <input
//                         type="checkbox"
//                         className="custom-control-input"
//                         id="switch-vuelto-billetera"
//                         checked={vueltoABilletera}
//                         onChange={(e) => setVueltoABilletera(e.target.checked)}
//                       />
//                       <label
//                         className="custom-control-label text-muted"
//                         htmlFor="switch-vuelto-billetera"
//                       >
//                         {vueltoABilletera ? "Sí" : "No"}
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="modal-footer">
//               <button className="btn btn-secondary" data-dismiss="modal">
//                 Cancelar
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={handleConfirmarVenta}
//               >
//                 Finalizar Venta (F5)
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Otros modales sin cambios visuales */}
//       <div className="modal fade" id="modal-productos" tabIndex="-1">
//         <div className="modal-dialog modal-xl modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header bg-info text-white">
//               <h5>Listado de Ítems</h5>
//               <button className="close" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <table
//                 id="prod-table"
//                 className="table table-striped table-bordered table-sm w-100"
//               >
//                 <thead>
//                   <tr className="text-center">
//                     <th>Acción</th>
//                     <th>Imagen</th>
//                     <th>Código</th>
//                     <th>Nombre</th>
//                     <th>Stock</th>
//                     <th>Precio</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {productos.map((p) => (
//                     <tr key={p.id}>
//                       <td className="text-center align-middle">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => {
//                             addItem(p.codigo);
//                             window.$("#modal-productos").modal("hide");
//                           }}
//                         >
//                           <i className="fas fa-check"></i>
//                         </button>
//                       </td>
//                       <td className="text-center align-middle">
//                         {p.imagen ? (
//                           <img
//                             src={
//                               p.imagen.startsWith("http")
//                                 ? p.imagen
//                                 : `${API_URL}${p.imagen}`
//                             }
//                             width="40"
//                             height="40"
//                             className="rounded shadow-sm"
//                             style={{ objectFit: "cover" }}
//                           />
//                         ) : (
//                           <small className="text-muted">N/A</small>
//                         )}
//                       </td>
//                       <td className="text-center align-middle">{p.codigo}</td>
//                       <td>{p.nombre}</td>
//                       <td className="text-center font-weight-bold">
//                         {p.stock}
//                       </td>
//                       <td className="text-right">
//                         {formatMoney(parseFloat(p.precio_venta))}
//                       </td>
//                     </tr>
//                   ))}
//                   {combos.map((c) => (
//                     <tr key={c.id}>
//                       <td className="text-center align-middle">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => {
//                             addItem(c.codigo);
//                             window.$("#modal-productos").modal("hide");
//                           }}
//                         >
//                           <i className="fas fa-check"></i>
//                         </button>
//                       </td>
//                       <td className="text-center align-middle">
//                         <small className="text-muted">Combo</small>
//                       </td>
//                       <td className="text-center align-middle">{c.codigo}</td>
//                       <td>{c.nombre}</td>
//                       <td className="text-center font-weight-bold">N/A</td>
//                       <td className="text-right">
//                         {formatMoney(parseFloat(c.precio_venta))}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="modal fade" id="modal-clientes" tabIndex="-1">
//         <div className="modal-dialog modal-lg modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header bg-info text-white">
//               <h5>Seleccionar Cliente</h5>
//               <button className="close" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <table
//                 id="clie-table"
//                 className="table table-striped table-bordered table-sm w-100"
//               >
//                 <thead>
//                   <tr className="text-center">
//                     <th>Acción</th>
//                     <th>C.U.I.L</th>
//                     <th>Nombre</th>
//                     <th>Billetera</th>
//                     <th>Puntos</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {clientes.map((cl) => (
//                     <tr key={cl.id}>
//                       <td className="text-center align-middle">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => {
//                             setClienteSel(cl);
//                             api
//                               .get(`/ventas/deuda-cliente/${cl.id}`)
//                               .then((r) => setDeudaInfo(r.data));
//                             window.$("#modal-clientes").modal("hide");
//                           }}
//                         >
//                           <i className="fas fa-check"></i>
//                         </button>
//                       </td>
//                       <td className="text-center align-middle">
//                         {cl.cuil_codigo}
//                       </td>
//                       <td className="align-middle">{cl.nombre_cliente}</td>
//                       <td className="text-right text-success text-bold">
//                         {formatMoney(cl.saldo_billetera)}
//                       </td>
//                       <td className="text-center align-middle">
//                         <b>{cl.puntos || 0}</b>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="modal fade" id="modal-crear-cliente" tabIndex="-1">
//         <div className="modal-dialog modal-lg modal-dialog-centered">
//           <div className="modal-content shadow-lg">
//             <div className="modal-header bg-primary text-white">
//               <h5>Registrar nuevo cliente</h5>
//               <button className="close text-white" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="row mb-3">
//                 <div className="col-md-6 form-group">
//                   <label>Cliente</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     onChange={(e) =>
//                       setNuevoCliente({
//                         ...nuevoCliente,
//                         nombre_cliente: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//                 <div className="col-md-6 form-group">
//                   <label>C.U.I.T./D.N.I.</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     onChange={(e) =>
//                       setNuevoCliente({
//                         ...nuevoCliente,
//                         cuil_codigo: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 form-group">
//                   <label>Teléfono</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     onChange={(e) =>
//                       setNuevoCliente({
//                         ...nuevoCliente,
//                         telefono: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//                 <div className="col-md-6 form-group">
//                   <label>Correo</label>
//                   <input
//                     type="email"
//                     className="form-control"
//                     onChange={(e) =>
//                       setNuevoCliente({
//                         ...nuevoCliente,
//                         email: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer d-flex justify-content-between">
//               <button className="btn btn-secondary" data-dismiss="modal">
//                 Salir
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={handleGuardarNuevoCliente}
//               >
//                 <i className="fa-regular fa-floppy-disk mr-1"></i> Registrar
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CrearVenta;

// src/pages/ventas/CrearVenta.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const CrearVenta = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshAll, arqueoAbierto } = useNotifications();
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  // --- ⏰ ESTADO DEL RELOJ ---
  const [currentTime, setCurrentTime] = useState("");

  // --- CONFIGURACIÓN DE IDIOMA LOCAL ---
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

  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tmpVentas, setTmpVentas] = useState([]);
  const [promos, setPromos] = useState([]);
  const [dolar, setDolar] = useState(1499.5);
  const [cantidad, setCantidad] = useState(1);
  const [codigo, setCodigo] = useState("");
  // 🕵️‍♂️ ESTADOS CONSULTADOR 🕵️‍♂️
  const [busquedaConsulta, setBusquedaConsulta] = useState("");
  const [productoConsultado, setProductoConsultado] = useState(null);
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset() * 60000;
    return new Date(hoy - offset).toISOString().split("T")[0];
  });
  const [clienteSel, setClienteSel] = useState({
    id: 1,
    nombre_cliente: "Consumidor Final",
    cuil_codigo: "00000000000",
    puntos: 0,
    saldo_billetera: 0,
  });
  const [deudaInfo, setDeudaInfo] = useState({ deuda_total: 0, dias_mora: 0 });
  const [descPorcentaje, setDescPorcentaje] = useState(0);
  const [descMonto, setDescMonto] = useState(0);
  const [pagos, setPagos] = useState({
    efectivo: 0,
    tarjeta: 0,
    mercadopago: 0,
    transferencia: 0,
    billetera: 0,
  });
  const [esCtaCte, setEsCtaCte] = useState(false);
  const [vueltoABilletera, setVueltoABilletera] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre_cliente: "",
    cuil_codigo: "",
    telefono: "",
    email: "",
  });

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  // 🚀 LÓGICA DE AHORRO SINCERADA CON FACTOR DE BULTO 🚀
  const calcularAhorroItem = (item) => {
    const promo = promos.find(
      (p) => p.producto_id === item.producto_id && p.estado === 1,
    );
    if (!promo) return 0;

    const factor = parseFloat(item.factor_utilizado || 1);
    const multiplicador = item.es_bulto === 1 ? factor : 1;
    const precio = parseFloat(item.precio_venta || 0) * multiplicador;

    const cant = parseFloat(item.cantidad || 0);
    if (promo.tipo === "3x2" && cant >= 3) return Math.floor(cant / 3) * precio;
    if (promo.tipo === "2da_al_70" && cant >= 2)
      return Math.floor(cant / 2) * (precio * 0.7);
    if (promo.tipo === "2da_al_50" && cant >= 2)
      return Math.floor(cant / 2) * (precio * 0.5);
    if (promo.tipo === "4x3" && cant >= 4) return Math.floor(cant / 4) * precio;
    return 0;
  };

  const totalCantidad = tmpVentas.reduce(
    (acc, it) => acc + parseFloat(it.cantidad),
    0,
  );

  // 🚀 SUBTOTAL BRUTO SINCERADO CON ESCALAS (UNIDAD/BULTO) 🚀
  const subtotalBruto = tmpVentas.reduce((acc, it) => {
    let precio = parseFloat(it.precio_venta || it.combo_precio || 0);
    if (it.aplicar_porcentaje)
      precio =
        parseFloat(it.precio_compra) *
        (1 + parseFloat(it.valor_porcentaje) / 100);

    const factor = parseFloat(it.factor_utilizado || 1);
    const multiplicador = it.es_bulto === 1 ? factor : 1;

    return acc + parseFloat(it.cantidad) * (precio * multiplicador);
  }, 0);

  const ahorroTotalPromos = tmpVentas.reduce(
    (acc, it) => acc + calcularAhorroItem(it),
    0,
  );
  const totalDescuentoManual =
    (subtotalBruto - ahorroTotalPromos) *
      (parseFloat(descPorcentaje || 0) / 100) +
    parseFloat(descMonto || 0);
  const totalFinal = Math.max(
    subtotalBruto - ahorroTotalPromos - totalDescuentoManual,
    0,
  );
  const totalDolares = totalFinal / dolar;
  const totalPagado = Object.values(pagos).reduce(
    (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
    0,
  );
  const montoSaldar = Math.max(totalFinal - totalPagado, 0);
  const vueltoFisicoReal = Math.max(totalPagado - totalFinal, 0);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [resP, resCl, resCo, resTmp, resDolar, resPromos] =
        await Promise.all([
          api.get("/productos"),
          api.get("/clientes"),
          api.get("/combos").catch(() => ({ data: [] })),
          api.get(`/ventas/tmp?usuario_id=${user.id}`),
          fetch("https://dolarapi.com/v1/dolares/bolsa")
            .then((r) => r.json())
            .catch(() => ({ venta: 1476.1 })),
          api.get("/promociones").catch(() => ({ data: [] })),
        ]);
      setProductos(resP.data);
      setClientes(resCl.data);
      setCombos(resCo.data);
      setTmpVentas(resTmp.data);
      setDolar(resDolar.venta || 1476.1);
      setPromos(resPromos.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (arqueoAbierto === null || !user) return;
    if (arqueoAbierto === false) {
      Swal.fire({
        icon: "error",
        title: "Caja Cerrada",
        text: "Debe abrir caja antes de realizar una venta",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/ventas/listado");
      return;
    }
    fetchData();
  }, [arqueoAbierto, user]);

  // --- 🚀 FUNCIÓN PARA EL SWITCH DE ESCALA ---
  const toggleBulto = async (id, valorActual) => {
    try {
      const nuevoValor = valorActual === 1 ? 0 : 1;
      await api.put(`/ventas/tmp/bulto/${id}`, { es_bulto: nuevoValor });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmarVenta = async () => {
    if (!esCtaCte && totalPagado < totalFinal)
      return Swal.fire("Error", "Monto insuficiente", "error");
    if (parseFloat(pagos.billetera) > parseFloat(clienteSel.saldo_billetera))
      return Swal.fire("Error", "Saldo insuficiente en billetera", "error");
    Swal.fire({
      title: "Procesando Venta...",
      text: "Estamos registrando la operación.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const pagosSaneados = {
        ...pagos,
        efectivo: Math.max(
          parseFloat(pagos.efectivo || 0) - vueltoFisicoReal,
          0,
        ),
      };
      const payload = {
        cliente_id: clienteSel.id,
        fecha,
        precio_total: totalFinal,
        pagos: { ...pagosSaneados, pago_billetera: pagos.billetera },
        es_cuenta_corriente: esCtaCte,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        items: tmpVentas,
        descuento_porcentaje: descPorcentaje,
        descuento_monto: descMonto,
        puntos_canjeados:
          Number(descMonto) === Number(clienteSel.puntos)
            ? clienteSel.puntos
            : 0,
        cargar_vuelto_billetera: vueltoABilletera,
        vuelto_monto: vueltoFisicoReal,
      };
      const res = await api.post("/ventas", payload);
      if (res.data.success) {
        window.$("#modal-pagos").modal("hide");
        if (refreshAll) await refreshAll();
        await Swal.fire({
          position: "center",
          icon: "success",
          title: "¡Éxito!",
          text: "Venta registrada.",
          showConfirmButton: false,
          timer: 2000,
        });
        setPagos({
          efectivo: 0,
          tarjeta: 0,
          mercadopago: 0,
          transferencial: 0,
          billetera: 0,
        });
        setClienteSel({
          id: 1,
          nombre_cliente: "Consumidor Final",
          cuil_codigo: "00000000000",
          puntos: 0,
          saldo_billetera: 0,
        });
        setDeudaInfo({ deuda_total: 0, dias_mora: 0 });
        setDescPorcentaje(0);
        setDescMonto(0);
        setCodigo("");
        setCantidad(1);
        setEsCtaCte(false);
        setVueltoABilletera(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Fallo al registrar la venta", "error");
    }
  };

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.ctrlKey && e.key === "F9") {
  //       e.preventDefault();
  //       setBusquedaConsulta("");
  //       setProductoConsultado(null);
  //       window.$("#modal-consultador").modal("show");
  //       setTimeout(
  //         () => document.getElementById("input-consulta")?.focus(),
  //         500,
  //       );
  //     }
  //     if (e.key === "F12") {
  //       e.preventDefault();
  //       if (tmpVentas.length > 0) {
  //         window.$("#modal-pagos").modal("show");
  //         setTimeout(() => {
  //           const inp = document.getElementById("pago-efectivo");
  //           if (inp) {
  //             inp.focus();
  //             inp.select();
  //           }
  //         }, 500);
  //       }
  //     }
  //     if (e.key === "F5") {
  //       e.preventDefault();
  //       if (tmpVentas.length > 0) {
  //         const m = document.getElementById("modal-pagos");
  //         if (m && !m.classList.contains("show"))
  //           window.$("#modal-pagos").modal("show");
  //         else handleConfirmarVenta();
  //       }
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown, true);
  //   return () => window.removeEventListener("keydown", handleKeyDown, true);
  // }, [
  //   tmpVentas,
  //   totalPagado,
  //   totalFinal,
  //   vueltoFisicoReal,
  //   esCtaCte,
  //   clienteSel,
  //   pagos,
  // ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ✅ CTRL+F9: Consultador
      if (e.ctrlKey && e.key === "F9") {
        e.preventDefault();
        setBusquedaConsulta("");
        setProductoConsultado(null);
        window.$("#modal-consultador").modal("show");
        setTimeout(
          () => document.getElementById("input-consulta")?.focus(),
          500,
        );
        return;
      }

      // ✅ F12: Modal Pagos
      if (e.key === "F12") {
        e.preventDefault();
        if (tmpVentas.length > 0) {
          window.$("#modal-pagos").modal("show");
          setTimeout(() => {
            const inp = document.getElementById("pago-efectivo");
            if (inp) {
              inp.focus();
              inp.select();
            }
          }, 500);
        }
        return;
      }

      // 🚀 F5: REGISTRAR (FIXED LÓGICA) 🚀
      if (e.key === "F5") {
        e.preventDefault();
        e.stopImmediatePropagation(); // Evita que el navegador refresque

        if (tmpVentas.length > 0) {
          const modalElem = document.getElementById("modal-pagos");
          const isModalOpen =
            modalElem &&
            (modalElem.classList.contains("show") ||
              window.$(modalElem).is(":visible"));

          if (!isModalOpen) {
            window.$("#modal-pagos").modal("show");
          } else {
            handleConfirmarVenta();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [
    tmpVentas,
    totalPagado,
    totalFinal,
    vueltoFisicoReal,
    esCtaCte,
    clienteSel,
    pagos,
    vueltoABilletera,
  ]);

  const addItem = async (codigoItem) => {
    try {
      const res = await api.post("/ventas/tmp", {
        codigo: codigoItem.trim(),
        cantidad,
        usuario_id: user.id,
      });
      if (res.data.success) {
        setCodigo("");
        setCantidad(1);
        fetchData();
      } else {
        Swal.fire("Error", res.data.message, "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuardarNuevoCliente = async () => {
    try {
      const res = await api.post("/clientes", {
        ...nuevoCliente,
        empresa_id: user.empresa_id,
      });
      if (res.data.id) {
        window.$("#modal-crear-cliente").modal("hide");
        fetchData();
        Swal.fire({
          icon: "success",
          title: "Cliente registrado",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (e) {
      Swal.fire("Error", "No se pudo crear", "error");
    }
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        ["#prod-table", "#clie-table"].forEach((id) => {
          if (window.$.fn.DataTable.isDataTable(id))
            window.$(id).DataTable().destroy();
          window.$(id).DataTable({
            paging: true,
            pageLength: 5,
            language: spanishLanguage,
            autoWidth: false,
          });
        });
      }, 400);
    }
  }, [loading]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
      );
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Registro de una nueva venta</b>
            </h1>
          </div>
          <div className="col-sm-6 text-right">
            <span className="badge badge-info p-2 ml-1 shadow-sm">
              CTRL+F9: Consultar
            </span>
            <span className="badge badge-secondary p-2 ml-1 shadow-sm">
              SHIFT+F1: Listado Ventas
            </span>
            <span className="badge badge-danger p-2 ml-1 shadow-sm">
              F5: Registrar Venta
            </span>
            <span className="badge badge-success p-2 ml-1 shadow-sm">
              F12: Efectivo
            </span>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-8">
            <div
              className="card card-outline shadow-lg h-100"
              style={{
                backgroundColor: "#1e2229",
                borderTop: "4px solid #00f2fe",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: "none",
              }}
            >
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-2">
                    <label className="text-muted text-xs mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-dark text-white text-center"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      style={{ fontSize: "1rem" }}
                    />
                  </div>
                  <div className="col-md-7">
                    <label className="text-muted text-xs mb-1">Código</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text bg-dark text-white">
                          <i className="fas fa-barcode"></i>
                        </span>
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem(codigo)}
                        autoFocus
                        placeholder="Código o nombre..."
                        style={{ fontSize: "1rem" }}
                      />
                      <div className="input-group-append">
                        <button
                          className="btn btn-primary btn-sm"
                          data-toggle="modal"
                          data-target="#modal-productos"
                          style={{ fontSize: "1rem" }}
                        >
                          <i className="fas fa-search"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => navigate("/productos/crear")}
                          style={{ fontSize: "1rem" }}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="table-responsive mt-3">
                  <table className="table table-sm table-striped table-bordered">
                    <thead
                      className="text-center"
                      style={{ backgroundColor: "#2d323b", color: "#00f2fe" }}
                    >
                      <tr>
                        <th>Nro.</th>
                        <th>Código</th>
                        <th style={{ width: "160px" }}>Cantidad / Escala</th>
                        <th>Producto/Combo</th>
                        <th>Unidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tmpVentas.map((it, i) => {
                        const ahorro = calcularAhorroItem(it);
                        const factor = parseFloat(it.factor_utilizado || 1);
                        const multiplicador = it.es_bulto === 1 ? factor : 1;
                        let precioBase = parseFloat(
                          it.precio_venta || it.combo_precio,
                        );
                        if (it.aplicar_porcentaje)
                          precioBase =
                            parseFloat(it.precio_compra) *
                            (1 + parseFloat(it.valor_porcentaje) / 100);

                        return (
                          <tr
                            key={it.id}
                            style={{
                              backgroundColor: "#2d323b",
                              color: "white",
                            }}
                          >
                            <td className="text-center align-middle">
                              {i + 1}
                            </td>
                            <td className="text-center align-middle">
                              {it.codigo || it.combo_codigo}
                            </td>
                            <td className="text-center align-middle">
                              {factor > 1 && (
                                <div className="btn-group btn-group-toggle mb-1 w-100">
                                  <button
                                    className={`btn btn-xs ${it.es_bulto === 0 ? "btn-primary" : "btn-outline-secondary text-white"}`}
                                    onClick={() =>
                                      toggleBulto(it.id, it.es_bulto)
                                    }
                                    style={{ fontSize: "0.6rem" }}
                                  >
                                    {it.unidad_nombre || "UNID."}
                                  </button>
                                  <button
                                    className={`btn btn-xs ${it.es_bulto === 1 ? "btn-info" : "btn-outline-secondary text-white"}`}
                                    onClick={() =>
                                      toggleBulto(it.id, it.es_bulto)
                                    }
                                    style={{ fontSize: "0.6rem" }}
                                  >
                                    {it.unidad_bulto_nombre || "BULTO"}
                                  </button>
                                </div>
                              )}
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary btn-xs text-white"
                                  onClick={() =>
                                    api
                                      .put(`/ventas/tmp/${it.id}`, {
                                        cantidad: parseFloat(it.cantidad) - 1,
                                      })
                                      .then(fetchData)
                                  }
                                >
                                  -
                                </button>
                                <span
                                  className="px-2 font-weight-bold"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {it.cantidad}
                                </span>
                                <button
                                  className="btn btn-outline-secondary btn-xs text-white"
                                  onClick={() =>
                                    api
                                      .put(`/ventas/tmp/${it.id}`, {
                                        cantidad: parseFloat(it.cantidad) + 1,
                                      })
                                      .then(fetchData)
                                  }
                                >
                                  +
                                </button>
                              </div>
                              {it.es_bulto === 1 && (
                                <div
                                  className="text-info text-bold mt-1"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Equiv: {it.cantidad * factor}{" "}
                                  {it.unidad_nombre}
                                </div>
                              )}
                            </td>
                            <td className="align-middle">
                              {it.nombre || it.combo_nombre}{" "}
                              {ahorro > 0 && (
                                <span
                                  className="badge badge-success ml-2"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  PROMO
                                </span>
                              )}
                            </td>
                            <td className="text-center align-middle">
                              {it.unidad_nombre || "Unid."}
                            </td>
                            <td className="text-right align-middle">
                              {formatMoney(precioBase)}
                            </td>
                            <td className="text-right align-middle text-bold">
                              {formatMoney(
                                it.cantidad * precioBase * multiplicador -
                                  ahorro,
                              )}
                            </td>
                            <td className="text-center align-middle">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  await api.delete(`/ventas/tmp/${it.id}`);
                                  fetchData();
                                }}
                                style={{ fontSize: "0.8rem" }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-dark">
                      <tr className="text-bold" style={{ color: "#ffc107" }}>
                        <td colSpan="2" className="text-right">
                          Total Cant.
                        </td>
                        <td className="text-center">{totalCantidad}</td>
                        <td colSpan="3" className="text-right">
                          Subtotal
                        </td>
                        <td className="text-right">
                          {formatMoney(subtotalBruto)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card card-outline card-dark shadow-lg h-100"
              style={{
                backgroundColor: "#1e2229",
                borderTop: "4px solid #00f2fe",
              }}
            >
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-9">
                    <button
                      className="btn btn-primary btn-sm btn-block shadow-sm"
                      data-toggle="modal"
                      data-target="#modal-clientes"
                    >
                      <i className="fas fa-search mr-1"></i> BUSCAR CLIENTE
                    </button>
                  </div>
                  <div className="col-3">
                    <button
                      className="btn btn-success btn-sm btn-block shadow-sm"
                      data-toggle="modal"
                      data-target="#modal-crear-cliente"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="bg-black p-2 rounded border border-secondary text-info text-bold text-uppercase mb-2">
                  {clienteSel.nombre_cliente}{" "}
                  <small className="float-right text-muted">
                    {clienteSel.cuil_codigo}
                  </small>
                </div>

                {/* 🛡️ SIDEBAR BILLETERA RESTAURADO 🛡️ */}
                {clienteSel.id !== 1 && (
                  <div className="mt-2 animate__animated animate__fadeIn">
                    <div
                      className="d-flex justify-content-between mb-1 p-2 rounded"
                      style={{
                        border: "1px dashed #ffc107",
                        backgroundColor: "rgba(255,193,7,0.05)",
                      }}
                    >
                      <span className="text-warning small text-bold">
                        🌟 PUNTOS: {clienteSel.puntos} (
                        {formatMoney(clienteSel.puntos)})
                      </span>
                      {clienteSel.puntos > 0 && (
                        <button
                          className="btn btn-xs btn-warning text-bold px-2"
                          onClick={() => setDescMonto(clienteSel.puntos)}
                        >
                          CANJEAR
                        </button>
                      )}
                    </div>
                    {parseFloat(clienteSel.saldo_billetera) > 0 && (
                      <div className="p-2 rounded mb-2 border border-success text-success small text-bold">
                        <i className="fas fa-wallet mr-1"></i> BILLETERA:{" "}
                        {formatMoney(clienteSel.saldo_billetera)}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group mt-3">
                  <label className="text-muted text-xs text-bold uppercase">
                    Total Neto a Cobrar
                  </label>
                  <div
                    className="p-3 text-right rounded"
                    style={{
                      backgroundColor: "#000",
                      border: "1px solid #28a745",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "2.8rem",
                        fontWeight: "900",
                        color: "#28a745",
                        letterSpacing: "-1px",
                      }}
                    >
                      {formatMoney(totalFinal)}
                    </span>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="text-muted text-xs">DESC. %</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-dark text-white text-right border-secondary"
                      value={descPorcentaje}
                      onChange={(e) => setDescPorcentaje(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-muted text-xs">DESC. $</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-dark text-white text-right border-secondary"
                      value={descMonto}
                      onChange={(e) => setDescMonto(e.target.value)}
                    />
                  </div>
                </div>
                <div
                  className="p-3 text-right border rounded mb-3 bg-black"
                  style={{
                    borderStyle: "dashed",
                    borderColor: deudaInfo.deuda_total > 0 ? "red" : "green",
                  }}
                >
                  <small className="text-muted text-uppercase text-bold">
                    Estado Cuenta Corriente
                  </small>
                  <div
                    className={`h4 m-0 font-weight-bold ${deudaInfo.deuda_total > 0 ? "text-danger" : "text-success"}`}
                  >
                    {formatMoney(deudaInfo.deuda_total)}
                  </div>
                </div>
                <div
                  className="p-2 mb-3 text-right"
                  style={{
                    backgroundColor: "#000",
                    borderRadius: "5px",
                    border: "1px solid #00f2fe",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "#00f2fe",
                    }}
                  >
                    {currentTime}
                  </span>
                </div>
                <button
                  className="btn btn-success btn-block btn-lg shadow-lg mt-3 text-bold"
                  data-toggle="modal"
                  data-target="#modal-pagos"
                  style={{
                    height: "70px",
                    fontSize: "1.6rem",
                    border: "none",
                    background:
                      "linear-gradient(180deg, #28a745 0%, #218838 100%)",
                  }}
                >
                  <i className="fa-regular fa-floppy-disk mr-2"></i> REGISTRAR
                  (F5)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💳 MODAL PAGOS (CORREGIDO Y ESTILIZADO) */}
      <div className="modal fade" id="modal-pagos" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5>Ingresar Pago</h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group row align-items-center mb-3">
                <label className="col-sm-5 text-bold">Cuenta Corriente</label>
                <div className="col-sm-7">
                  <input
                    type="checkbox"
                    checked={esCtaCte}
                    onChange={(e) => setEsCtaCte(e.target.checked)}
                    style={{ width: "20px", height: "20px" }}
                  />
                </div>
              </div>
              {[
                "efectivo",
                "tarjeta",
                "mercadopago",
                "transferencia",
                "billetera",
              ].map((m) => {
                if (
                  m === "billetera" &&
                  (!clienteSel.saldo_billetera ||
                    clienteSel.saldo_billetera <= 0)
                )
                  return null;
                return (
                  <div className="form-group row mb-2" key={m}>
                    <label className="col-sm-5 text-capitalize text-bold">
                      {m === "billetera" ? (
                        <>
                          <i className="fas fa-wallet text-success mr-1"></i>{" "}
                          Billetera
                        </>
                      ) : (
                        m
                      )}
                    </label>
                    <div className="col-sm-7 input-group">
                      <input
                        id={
                          m === "efectivo"
                            ? "pago-efectivo"
                            : m === "mercadopago"
                              ? "pago-mercadopago"
                              : ""
                        }
                        type="number"
                        className="form-control text-right font-weight-bold"
                        style={{
                          backgroundColor:
                            m === "efectivo"
                              ? "#d4edda"
                              : m === "billetera"
                                ? "#e1f5fe"
                                : "#e9ecef",
                          fontSize: "1.4rem",
                          height: "45px",
                        }}
                        value={pagos[m]}
                        onChange={(e) =>
                          setPagos({ ...pagos, [m]: e.target.value })
                        }
                      />
                      <div className="input-group-append">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            let max = totalFinal;
                            if (m === "billetera")
                              max = Math.min(
                                totalFinal,
                                clienteSel.saldo_billetera,
                              );
                            setPagos({ ...pagos, [m]: max.toFixed(2) });
                          }}
                        >
                          $
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <hr />
              <div className="form-group row">
                <label className="col-sm-5 text-bold">Total a Pagar</label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold bg-light"
                    style={{ fontSize: "1.4rem" }}
                    value={formatMoney(totalFinal)}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-5 text-bold text-info">
                  Precio Dólar
                </label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold bg-light text-info"
                    style={{ fontSize: "1.2rem" }}
                    value={formatMoney(dolar)}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-5 text-bold text-primary">
                  Total USD
                </label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold bg-light text-primary"
                    style={{ fontSize: "1.4rem" }}
                    value={`$USD ${totalDolares.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group row text-success">
                <label className="col-sm-5 text-bold">
                  {vueltoABilletera
                    ? "Vuelto a Cargar en Billetera"
                    : "Vuelto en Efectivo"}
                </label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className={`form-control text-right font-weight-bold bg-light ${
                      vueltoABilletera ? "text-primary" : "text-success"
                    }`}
                    style={{ fontSize: "1.4rem" }}
                    value={formatMoney(vueltoFisicoReal)}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-5 text-bold">Monto a Saldar</label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className={`form-control text-right font-weight-bold bg-light ${
                      montoSaldar > 0 ? "text-danger" : "text-success"
                    }`}
                    style={{ fontSize: "1.4rem" }}
                    value={formatMoney(montoSaldar)}
                    readOnly
                  />
                </div>
              </div>
              {/* ✅ SWITCH: Cargar vuelto a billetera */}
              {clienteSel.id !== 1 && vueltoFisicoReal > 0 && (
                <div className="form-group row align-items-center">
                  <label className="col-sm-5 text-bold">
                    <i className="fas fa-wallet text-primary mr-1"></i>
                    Cargar vuelto a billetera
                  </label>
                  <div className="col-sm-7">
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="switch-vuelto-billetera"
                        checked={vueltoABilletera}
                        onChange={(e) => setVueltoABilletera(e.target.checked)}
                      />
                      <label
                        className="custom-control-label text-muted"
                        htmlFor="switch-vuelto-billetera"
                      >
                        {vueltoABilletera ? "Sí" : "No"}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-dismiss="modal">
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmarVenta}
              >
                Finalizar Venta (F5)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALES PRODUCTOS, CLIENTES, CREAR CLIENTE (IGUAL AL ORIGINAL) --- */}
      <div className="modal fade" id="modal-consultador" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content shadow-lg border-0"
            style={{ borderRadius: "15px" }}
          >
            <div
              className="modal-header bg-navy text-white"
              style={{ borderRadius: "15px 15px 0 0" }}
            >
              <h5 className="modal-title font-weight-bold">
                <i className="fas fa-search-dollar mr-2"></i>Consultador de
                Precios Rápido
              </h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body p-4">
              <input
                id="input-consulta"
                type="text"
                className="form-control form-control-lg shadow-sm border-info"
                placeholder="Escanee código o escriba nombre..."
                autoComplete="off"
                value={busquedaConsulta}
                onChange={(e) => {
                  const val = e.target.value;
                  setBusquedaConsulta(val);
                  if (val.length > 2) {
                    const p = productos.find(
                      (x) =>
                        x.codigo === val ||
                        x.nombre.toLowerCase().includes(val.toLowerCase()),
                    );
                    if (p) {
                      setProductoConsultado({ ...p, esCombo: false });
                      return;
                    }
                    const c = combos.find(
                      (x) =>
                        x.codigo === val ||
                        x.nombre.toLowerCase().includes(val.toLowerCase()),
                    );
                    if (c) {
                      setProductoConsultado({ ...c, esCombo: true });
                    } else {
                      setProductoConsultado(null);
                    }
                  } else {
                    setProductoConsultado(null);
                  }
                }}
              />
              {productoConsultado ? (
                <div className="card mt-4 animate__animated animate__fadeIn border shadow-none">
                  <div className="card-body text-center">
                    <span
                      className={`badge ${productoConsultado.esCombo ? "badge-warning" : "badge-primary"} p-2 mb-2`}
                    >
                      {productoConsultado.esCombo
                        ? "PAQUETE / COMBO"
                        : "PRODUCTO INDIVIDUAL"}
                    </span>
                    <h3 className="text-bold text-navy">
                      {productoConsultado.nombre}
                    </h3>
                    <div
                      className="p-3 rounded mb-3"
                      style={{ backgroundColor: "#f0f4f8" }}
                    >
                      <span className="text-muted d-block small uppercase text-bold">
                        Precio de Venta Actual
                      </span>
                      <h1 className="display-3 font-weight-bold text-success mb-0">
                        {formatMoney(productoConsultado.precio_venta)}
                      </h1>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 text-muted">
                  <i className="fas fa-barcode fa-4x mb-3 opacity-25"></i>
                  <p>Ingrese código o nombre del producto...</p>
                </div>
              )}
            </div>
            <div
              className="modal-footer bg-light"
              style={{ borderRadius: "0 0 15px 15px" }}
            >
              <button
                className="btn btn-secondary btn-block"
                data-dismiss="modal"
              >
                CERRAR (ESC)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="modal-productos" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5>Listado de Ítems</h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <table
                id="prod-table"
                className="table table-striped table-bordered table-sm w-100"
              >
                <thead>
                  <tr className="text-center">
                    <th>Acción</th>
                    <th>Imagen</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Stock</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id}>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            addItem(p.codigo);
                            window.$("#modal-productos").modal("hide");
                          }}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </td>
                      <td className="text-center align-middle">
                        {p.imagen ? (
                          <img
                            src={
                              p.imagen.startsWith("http")
                                ? p.imagen
                                : `${API_URL}${p.imagen}`
                            }
                            width="40"
                            className="rounded shadow-sm"
                          />
                        ) : (
                          <small className="text-muted">N/A</small>
                        )}
                      </td>
                      <td className="text-center align-middle font-weight-bold">
                        {p.codigo}
                      </td>
                      <td>{p.nombre}</td>
                      <td className="text-center">{p.stock}</td>
                      <td className="text-right">
                        {formatMoney(p.precio_venta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- 🛡️ MODAL CLIENTES (SOLICITADO POR EL USUARIO) 🛡️ --- */}
      <div className="modal fade" id="modal-clientes" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5>Seleccionar Cliente</h5>
              <button className="close" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <table
                id="clie-table"
                className="table table-striped table-bordered table-sm w-100"
              >
                <thead>
                  <tr className="text-center">
                    <th>Acción</th>
                    <th>C.U.I.L</th>
                    <th>Nombre</th>
                    <th>Billetera</th>
                    <th>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cl) => (
                    <tr key={cl.id}>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setClienteSel(cl);
                            api
                              .get(`/ventas/deuda-cliente/${cl.id}`)
                              .then((r) => setDeudaInfo(r.data));
                            window.$("#modal-clientes").modal("hide");
                          }}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </td>
                      <td className="text-center align-middle">
                        {cl.cuil_codigo}
                      </td>
                      <td className="align-middle">{cl.nombre_cliente}</td>
                      <td className="text-right text-success text-bold">
                        {formatMoney(cl.saldo_billetera)}
                      </td>
                      <td className="text-center align-middle">
                        <b>{cl.puntos || 0}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="modal-crear-cliente" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5>Registrar nuevo cliente</h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6 form-group">
                  <label>Cliente</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        nombre_cliente: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>C.U.I.T.</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        cuil_codigo: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        telefono: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-dismiss="modal">
                Salir
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGuardarNuevoCliente}
              >
                <i className="fa-regular fa-floppy-disk mr-1"></i> Registrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearVenta;
