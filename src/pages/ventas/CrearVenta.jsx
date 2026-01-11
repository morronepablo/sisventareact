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

//   // URL dinámica según el entorno
//   const API_URL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3001"
//       : "https://sistema-ventas-backend-3nn3.onrender.com";

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

//   // --- ESTADOS ---
//   const [loading, setLoading] = useState(true);
//   const [productos, setProductos] = useState([]);
//   const [combos, setCombos] = useState([]);
//   const [clientes, setClientes] = useState([]);
//   const [tmpVentas, setTmpVentas] = useState([]);
//   const [dolar, setDolar] = useState(1499.5);

//   const [cantidad, setCantidad] = useState(1);
//   const [codigo, setCodigo] = useState("");
//   const [fecha, setFecha] = useState(() => {
//     const hoy = new Date();
//     const offset = hoy.getTimezoneOffset() * 60000;
//     return new Date(hoy - offset).toISOString().split("T")[0];
//   });
//   const [clienteSel, setClienteSel] = useState({
//     id: 1,
//     nombre_cliente: "Consumidor Final",
//     cuil_codigo: "00000000000",
//   });
//   const [deudaInfo, setDeudaInfo] = useState({ deuda_total: 0, dias_mora: 0 });
//   const [descPorcentaje, setDescPorcentaje] = useState(0);
//   const [descMonto, setDescMonto] = useState(0);

//   const [pagos, setPagos] = useState({
//     efectivo: 0,
//     tarjeta: 0,
//     mercadopago: 0,
//     transferencia: 0,
//   });
//   const [esCtaCte, setEsCtaCte] = useState(false);
//   const [nuevoCliente, setNuevoCliente] = useState({
//     nombre_cliente: "",
//     cuil_codigo: "",
//     telefono: "",
//     email: "",
//   });

//   // --- CÁLCULOS (Declarados antes para evitar ReferenceError) ---
//   const totalCantidad = tmpVentas.reduce(
//     (acc, it) => acc + parseFloat(it.cantidad),
//     0
//   );

//   const subtotalBruto = tmpVentas.reduce((acc, it) => {
//     let precio = parseFloat(it.precio_venta || it.combo_precio || 0);
//     if (it.aplicar_porcentaje)
//       precio =
//         parseFloat(it.precio_compra) *
//         (1 + parseFloat(it.valor_porcentaje) / 100);
//     return acc + parseFloat(it.cantidad) * precio;
//   }, 0);

//   const totalDescuento =
//     subtotalBruto * (parseFloat(descPorcentaje || 0) / 100) +
//     parseFloat(descMonto || 0);
//   const totalFinal = Math.max(subtotalBruto - totalDescuento, 0);
//   const totalDolares = totalFinal / dolar;

//   const totalPagado = Object.values(pagos).reduce(
//     (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
//     0
//   );
//   const montoSaldar = Math.max(totalFinal - totalPagado, 0);
//   const otrosMedios =
//     parseFloat(pagos.tarjeta || 0) +
//     parseFloat(pagos.mercadopago || 0) +
//     parseFloat(pagos.transferencia || 0);
//   const restoParaEfectivo = totalFinal - otrosMedios;
//   const vuelto =
//     pagos.efectivo > restoParaEfectivo ? pagos.efectivo - restoParaEfectivo : 0;

//   // --- CARGA DE DATOS ---
//   const fetchData = async () => {
//     if (!user) return;
//     try {
//       const [resP, resCl, resCo, resTmp, resDolar] = await Promise.all([
//         api.get("/productos"),
//         api.get("/clientes"),
//         api.get("/combos").catch(() => ({ data: [] })),
//         api.get(`/ventas/tmp?usuario_id=${user.id}`),
//         fetch("https://dolarapi.com/v1/dolares/bolsa")
//           .then((r) => r.json())
//           .catch(() => ({ compra: 1499.5 })),
//       ]);
//       setProductos(resP.data);
//       setClientes(resCl.data);
//       setCombos(resCo.data);
//       setTmpVentas(resTmp.data);
//       setDolar(resDolar.compra || 1499.5);
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

//   // --- RESETEO ---
//   const resetForm = () => {
//     setPagos({ efectivo: 0, tarjeta: 0, mercadopago: 0, transferencia: 0 });
//     setClienteSel({
//       id: 1,
//       nombre_cliente: "Consumidor Final",
//       cuil_codigo: "00000000000",
//     });
//     setDescPorcentaje(0);
//     setDescMonto(0);
//     setEsCtaCte(false);
//     setCodigo("");
//     setCantidad(1);
//     setDeudaInfo({ deuda_total: 0, dias_mora: 0 });
//   };

//   // --- FUNCIONES DE ACCIÓN ---

//   const handleConfirmarVenta = async () => {
//     if (!esCtaCte && totalPagado < totalFinal)
//       return Swal.fire("Error", "Monto insuficiente", "error");
//     try {
//       const payload = {
//         cliente_id: clienteSel.id,
//         fecha,
//         precio_total: totalFinal,
//         pagos,
//         es_cuenta_corriente: esCtaCte,
//         usuario_id: user.id,
//         empresa_id: user.empresa_id,
//         items: tmpVentas,
//         descuento_porcentaje: descPorcentaje,
//         descuento_monto: descMonto,
//       };
//       const res = await api.post("/ventas", payload);
//       if (res.data.success) {
//         if (refreshAll) await refreshAll();
//         window.dispatchEvent(new Event("forceRefreshNotifications"));
//         window.$("#modal-pagos").modal("hide");
//         await Swal.fire({
//           position: "center",
//           icon: "success",
//           title: "¡Éxito!",
//           text: "Venta registrada satisfactoriamente",
//           showConfirmButton: false,
//           timer: 2500,
//         });
//         if (res.data.venta_id)
//           window.open(
//             `${API_URL}/api/ventas/ticket/${
//               res.data.venta_id
//             }?token=${localStorage.getItem("token")}`,
//             "_blank"
//           );
//         resetForm();
//         fetchData();
//       }
//     } catch (e) {
//       Swal.fire("Error", "Fallo al registrar", "error");
//     }
//   };

//   // --- LÓGICA DE ATAJOS (F5) ---
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "F5") {
//         e.preventDefault();
//         if (tmpVentas.length > 0) {
//           const modalPagos = document.getElementById("modal-pagos");
//           // Si el modal NO está abierto, lo abrimos
//           if (modalPagos && !modalPagos.classList.contains("show")) {
//             window.$("#modal-pagos").modal("show");
//           } else {
//             // Si el modal YA está abierto, ejecutamos la confirmación
//             handleConfirmarVenta();
//           }
//         } else {
//           // RESTAURADO: Alerta si el carrito está vacío al presionar F5
//           Swal.fire(
//             "Carrito vacío",
//             "Agregue productos antes de registrar la venta",
//             "info"
//           );
//         }
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [tmpVentas, totalPagado, totalFinal, esCtaCte, clienteSel]);

//   const updateQty = async (id, currentQty, delta) => {
//     const newQty = parseFloat(currentQty) + delta;
//     if (newQty < 1) return;
//     try {
//       const res = await api.put(`/ventas/tmp/${id}`, { cantidad: newQty });
//       if (res.data.success) fetchData();
//     } catch (e) {
//       Swal.fire("Error", "No se pudo actualizar la cantidad", "error");
//     }
//   };

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

//   const handleAddProduct = async (e) => {
//     if (e.key === "Enter" && codigo) addItem(codigo);
//   };

//   const updateDeudaCliente = async (id) => {
//     try {
//       const res = await api.get(`/ventas/deuda-cliente/${id}`);
//       setDeudaInfo(res.data);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleFillTotal = (campo) => {
//     setPagos({
//       efectivo: 0,
//       tarjeta: 0,
//       mercadopago: 0,
//       transferencia: 0,
//       [campo]: totalFinal.toFixed(2),
//     });
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
//       const timer = setTimeout(() => {
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
//       return () => clearTimeout(timer);
//     }
//   }, [loading]);

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
//             <span className="badge badge-secondary p-2 ml-1">
//               F3: Listado Ventas
//             </span>
//             <span className="badge badge-danger p-2 ml-1">
//               F5: Registrar Venta
//             </span>
//           </div>
//         </div>
//         <hr />

//         <div className="row">
//           <div className="col-md-8">
//             <div className="card card-outline card-primary shadow-sm">
//               <div className="card-header">
//                 <h3 className="card-title">Ingrese los datos</h3>
//               </div>
//               <div className="card-body">
//                 <div className="row mb-3">
//                   <div className="col-md-2">
//                     <label>Cantidad *</label>
//                     <input
//                       type="number"
//                       className="form-control text-center"
//                       value={cantidad}
//                       onChange={(e) => setCantidad(e.target.value)}
//                       style={{ backgroundColor: "rgba(233,231,16,0.15)" }}
//                     />
//                   </div>
//                   <div className="col-md-7">
//                     <label>Código</label>
//                     <div className="input-group">
//                       <div className="input-group-prepend">
//                         <span className="input-group-text">
//                           <i className="fas fa-barcode"></i>
//                         </span>
//                       </div>
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={codigo}
//                         onChange={(e) => setCodigo(e.target.value)}
//                         onKeyDown={handleAddProduct}
//                         autoFocus
//                         placeholder="Código o nombre..."
//                       />
//                       <div className="input-group-append">
//                         <button
//                           className="btn btn-primary"
//                           type="button"
//                           data-toggle="modal"
//                           data-target="#modal-productos"
//                         >
//                           <i className="fas fa-search"></i>
//                         </button>
//                         <button
//                           className="btn btn-success"
//                           type="button"
//                           onClick={() => navigate("/productos/crear")}
//                           title="Crear nuevo producto"
//                         >
//                           <i className="fas fa-plus"></i>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="table-responsive">
//                   <table className="table table-sm table-striped table-bordered">
//                     <thead className="thead-dark text-center">
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
//                         let precio = parseFloat(
//                           it.precio_venta || it.combo_precio || 0
//                         );
//                         if (it.aplicar_porcentaje)
//                           precio =
//                             parseFloat(it.precio_compra) *
//                             (1 + parseFloat(it.valor_porcentaje) / 100);
//                         return (
//                           <tr key={it.id}>
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
//                                     updateQty(it.id, it.cantidad, -1)
//                                   }
//                                   disabled={it.cantidad <= 1}
//                                 >
//                                   <i className="fas fa-minus"></i>
//                                 </button>
//                                 <span
//                                   className="px-2 font-weight-bold align-self-center"
//                                   style={{ minWidth: "30px" }}
//                                 >
//                                   {it.cantidad}
//                                 </span>
//                                 <button
//                                   className="btn btn-outline-secondary btn-xs"
//                                   onClick={() =>
//                                     updateQty(it.id, it.cantidad, 1)
//                                   }
//                                 >
//                                   <i className="fas fa-plus"></i>
//                                 </button>
//                               </div>
//                             </td>
//                             <td className="align-middle">
//                               {it.nombre || it.combo_nombre}
//                             </td>
//                             <td className="text-center align-middle">
//                               {it.unidad_nombre || "N/A"}
//                             </td>
//                             <td className="text-right align-middle">
//                               ${" "}
//                               {precio.toLocaleString("es-AR", {
//                                 minimumFractionDigits: 2,
//                               })}
//                             </td>
//                             <td className="text-right align-middle text-bold">
//                               ${" "}
//                               {(it.cantidad * precio).toLocaleString("es-AR", {
//                                 minimumFractionDigits: 2,
//                               })}
//                             </td>
//                             <td className="text-center align-middle">
//                               <button
//                                 className="btn btn-danger btn-sm"
//                                 onClick={async () => {
//                                   await api.delete(`/ventas/tmp/${it.id}`);
//                                   fetchData();
//                                 }}
//                               >
//                                 <i className="fas fa-trash"></i>
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                       {tmpVentas.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan="8"
//                             className="text-center text-muted py-3 italic"
//                           >
//                             No hay productos en el carrito
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                     <tfoot className="bg-light">
//                       <tr className="text-bold">
//                         <td colSpan="2" className="text-right">
//                           Total Cantidad
//                         </td>
//                         <td className="text-center text-primary">
//                           {totalCantidad}
//                         </td>
//                         <td colSpan="3" className="text-right">
//                           Total Venta
//                         </td>
//                         <td className="text-right text-primary">
//                           ${" "}
//                           {subtotalBruto.toLocaleString("es-AR", {
//                             minimumFractionDigits: 2,
//                           })}
//                         </td>
//                         <td></td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//                 <button
//                   className="btn btn-secondary btn-sm mt-2"
//                   onClick={() => navigate("/ventas/listado")}
//                 >
//                   <i className="fas fa-reply"></i> Volver
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-4">
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <div className="row mb-3">
//                   <div className="col-9">
//                     <button
//                       className="btn btn-primary btn-sm btn-block"
//                       data-toggle="modal"
//                       data-target="#modal-clientes"
//                     >
//                       <i className="fas fa-search"></i> Buscar Cliente
//                     </button>
//                   </div>
//                   <div className="col-3">
//                     <button
//                       className="btn btn-success btn-sm btn-block"
//                       data-toggle="modal"
//                       data-target="#modal-crear-cliente"
//                     >
//                       <i className="fas fa-plus"></i>
//                     </button>
//                   </div>
//                 </div>
//                 <div className="row mb-2">
//                   <div className="col-md-7">
//                     <label>
//                       <small>Cliente</small>
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control form-control-sm bg-light"
//                       value={clienteSel.nombre_cliente}
//                       readOnly
//                     />
//                   </div>
//                   <div className="col-md-5">
//                     <label>
//                       <small>C.U.I.T.</small>
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control form-control-sm bg-light"
//                       value={clienteSel.cuil_codigo}
//                       readOnly
//                     />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Fecha de venta *</small>
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control form-control-sm"
//                     value={fecha}
//                     onChange={(e) => setFecha(e.target.value)}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Total *</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold bg-warning"
//                     value={`$ ${subtotalBruto.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Dólar</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-white"
//                     style={{ backgroundColor: "#17a2b8" }}
//                     value={`$ ${dolar.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Total en Dólares</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-white bg-primary"
//                     value={`$USD ${totalDolares.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div className="row mb-2">
//                   <div className="col-6">
//                     <label>
//                       <small>Desc. %</small>
//                     </label>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm text-right"
//                       value={descPorcentaje}
//                       onChange={(e) => setDescPorcentaje(e.target.value)}
//                     />
//                   </div>
//                   <div className="col-6">
//                     <label>
//                       <small>Desc. Monto</small>
//                     </label>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm text-right"
//                       value={descMonto}
//                       onChange={(e) => setDescMonto(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Total con Descuento</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-white bg-success"
//                     value={`$ ${totalFinal.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div
//                   className={`p-2 text-right border rounded mb-3 text-white font-weight-bold ${
//                     deudaInfo.deuda_total > 0 ? "bg-danger" : "bg-success"
//                   }`}
//                 >
//                   <small>DEUDA ACTUAL DEL CLIENTE</small>
//                   <div className="h6 m-0">
//                     ${" "}
//                     {parseFloat(deudaInfo.deuda_total).toLocaleString("es-AR")}{" "}
//                     ({deudaInfo.dias_mora} días mora)
//                   </div>
//                 </div>
//                 <button
//                   className="btn btn-primary btn-block btn-lg shadow-sm"
//                   data-toggle="modal"
//                   data-target="#modal-pagos"
//                 >
//                   <i className="fas fa-cash-register"></i> Registrar Venta (F5)
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODAL PAGOS */}
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
//               {["efectivo", "tarjeta", "mercadopago", "transferencia"].map(
//                 (m) => (
//                   <div className="form-group row mb-2" key={m}>
//                     <label className="col-sm-5 text-capitalize text-bold">
//                       {m}
//                     </label>
//                     <div className="col-sm-7 input-group">
//                       <input
//                         type="number"
//                         className="form-control text-right font-weight-bold"
//                         style={{
//                           backgroundColor:
//                             m === "efectivo" ? "#d4edda" : "#e9ecef",
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
//                           onClick={() => handleFillTotal(m)}
//                         >
//                           $
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               )}
//               <hr />
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold">Total a Pagar</label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold bg-light"
//                     style={{ fontSize: "1.4rem" }}
//                     value={`$ ${totalFinal.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold text-success">
//                   Vuelto (Efectivo)
//                 </label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-success bg-light"
//                     style={{ fontSize: "1.4rem" }}
//                     value={`$ ${vuelto.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
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
//                     value={`$ ${montoSaldar.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//               </div>
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

//       {/* MODAL PRODUCTOS CON IMAGEN */}
//       <div className="modal fade" id="modal-productos" tabIndex="-1">
//         <div className="modal-dialog modal-xl modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header bg-info text-white">
//               <h5>Listado de Ítems</h5>
//               <button className="close text-white" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <table
//                 id="prod-table"
//                 className="table table-striped table-bordered table-sm"
//                 style={{ width: "100%" }}
//               >
//                 <thead>
//                   <tr className="text-center">
//                     <th>Acción</th>
//                     <th>Imagen</th>
//                     <th>Código</th>
//                     <th>Nombre</th>
//                     <th>Stock</th>
//                     <th>Precio</th>
//                     <th>Tipo</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {productos.map((p) => (
//                     <tr key={`p-${p.id}`}>
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
//                             width="40px"
//                             height="40px"
//                             className="rounded shadow-sm"
//                             style={{ objectFit: "cover" }}
//                           />
//                         ) : (
//                           <small className="text-muted">N/A</small>
//                         )}
//                       </td>
//                       <td className="text-center align-middle">{p.codigo}</td>
//                       <td className="align-middle">{p.nombre}</td>
//                       <td className="text-center align-middle">{p.stock}</td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(p.precio_venta).toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-center align-middle">
//                         <span className="badge badge-primary">Producto</span>
//                       </td>
//                     </tr>
//                   ))}
//                   {combos.map((c) => (
//                     <tr key={`c-${c.id}`}>
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
//                       <td className="align-middle">{c.nombre}</td>
//                       <td className="text-center align-middle">N/A</td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(c.precio_venta).toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-center align-middle">
//                         <span className="badge badge-warning">Combo</span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODAL BUSCAR CLIENTE */}
//       <div className="modal fade" id="modal-clientes" tabIndex="-1">
//         <div className="modal-dialog modal-lg">
//           <div className="modal-content">
//             <div className="modal-header bg-info text-white">
//               <h5>Seleccionar Cliente</h5>
//               <button className="close text-white" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <table
//                 id="clie-table"
//                 className="table table-striped table-bordered table-sm"
//                 style={{ width: "100%" }}
//               >
//                 <thead>
//                   <tr className="text-center">
//                     <th>Acción</th>
//                     <th>C.U.I.L</th>
//                     <th>Nombre</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {clientes.map((cl) => (
//                     <tr key={cl.id}>
//                       <td className="text-center">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => {
//                             setClienteSel(cl);
//                             updateDeudaCliente(cl.id);
//                             window.$("#modal-clientes").modal("hide");
//                           }}
//                         >
//                           <i className="fas fa-check"></i>
//                         </button>
//                       </td>
//                       <td className="text-center">{cl.cuil_codigo}</td>
//                       <td>{cl.nombre_cliente}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODAL CREAR CLIENTE */}
//       <div className="modal fade" id="modal-crear-cliente" tabIndex="-1">
//         <div className="modal-dialog modal-lg modal-dialog-centered">
//           <div className="modal-content shadow-lg">
//             <div className="modal-header bg-primary text-white">
//               <h5 className="modal-title">Registrar nuevo cliente</h5>
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
//                   <label>Correo Electrónico</label>
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

//   // URL dinámica según el entorno
//   const API_URL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3001"
//       : "https://sistema-ventas-backend-3nn3.onrender.com";

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

//   // --- ESTADOS ---
//   const [loading, setLoading] = useState(true);
//   const [productos, setProductos] = useState([]);
//   const [combos, setCombos] = useState([]);
//   const [clientes, setClientes] = useState([]);
//   const [tmpVentas, setTmpVentas] = useState([]);
//   const [dolar, setDolar] = useState(1499.5);

//   const [cantidad, setCantidad] = useState(1);
//   const [codigo, setCodigo] = useState("");
//   const [fecha, setFecha] = useState(() => {
//     const hoy = new Date();
//     const offset = hoy.getTimezoneOffset() * 60000;
//     return new Date(hoy - offset).toISOString().split("T")[0];
//   });
//   const [clienteSel, setClienteSel] = useState({
//     id: 1,
//     nombre_cliente: "Consumidor Final",
//     cuil_codigo: "00000000000",
//   });
//   const [deudaInfo, setDeudaInfo] = useState({ deuda_total: 0, dias_mora: 0 });
//   const [descPorcentaje, setDescPorcentaje] = useState(0);
//   const [descMonto, setDescMonto] = useState(0);

//   const [pagos, setPagos] = useState({
//     efectivo: 0,
//     tarjeta: 0,
//     mercadopago: 0,
//     transferencia: 0,
//   });
//   const [esCtaCte, setEsCtaCte] = useState(false);
//   const [nuevoCliente, setNuevoCliente] = useState({
//     nombre_cliente: "",
//     cuil_codigo: "",
//     telefono: "",
//     email: "",
//   });

//   // --- CÁLCULOS ---
//   const totalCantidad = tmpVentas.reduce(
//     (acc, it) => acc + parseFloat(it.cantidad),
//     0
//   );

//   const subtotalBruto = tmpVentas.reduce((acc, it) => {
//     let precio = parseFloat(it.precio_venta || it.combo_precio || 0);
//     if (it.aplicar_porcentaje)
//       precio =
//         parseFloat(it.precio_compra) *
//         (1 + parseFloat(it.valor_porcentaje) / 100);
//     return acc + parseFloat(it.cantidad) * precio;
//   }, 0);

//   const totalDescuento =
//     subtotalBruto * (parseFloat(descPorcentaje || 0) / 100) +
//     parseFloat(descMonto || 0);
//   const totalFinal = Math.max(subtotalBruto - totalDescuento, 0);
//   const totalDolares = totalFinal / dolar;

//   const totalPagado = Object.values(pagos).reduce(
//     (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
//     0
//   );
//   const montoSaldar = Math.max(totalFinal - totalPagado, 0);
//   const otrosMedios =
//     parseFloat(pagos.tarjeta || 0) +
//     parseFloat(pagos.mercadopago || 0) +
//     parseFloat(pagos.transferencia || 0);
//   const restoParaEfectivo = totalFinal - otrosMedios;
//   const vuelto =
//     pagos.efectivo > restoParaEfectivo ? pagos.efectivo - restoParaEfectivo : 0;

//   // --- CARGA DE DATOS ---
//   const fetchData = async () => {
//     if (!user) return;
//     try {
//       const [resP, resCl, resCo, resTmp, resDolar] = await Promise.all([
//         api.get("/productos"),
//         api.get("/clientes"),
//         api.get("/combos").catch(() => ({ data: [] })),
//         api.get(`/ventas/tmp?usuario_id=${user.id}`),
//         fetch("https://dolarapi.com/v1/dolares/bolsa")
//           .then((r) => r.json())
//           .catch(() => ({ compra: 1499.5 })),
//       ]);
//       setProductos(resP.data);
//       setClientes(resCl.data);
//       setCombos(resCo.data);
//       setTmpVentas(resTmp.data);
//       setDolar(resDolar.compra || 1499.5);
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

//   // --- RESETEO ---
//   const resetForm = () => {
//     setPagos({ efectivo: 0, tarjeta: 0, mercadopago: 0, transferencia: 0 });
//     setClienteSel({
//       id: 1,
//       nombre_cliente: "Consumidor Final",
//       cuil_codigo: "00000000000",
//     });
//     setDescPorcentaje(0);
//     setDescMonto(0);
//     setEsCtaCte(false);
//     setCodigo("");
//     setCantidad(1);
//     setDeudaInfo({ deuda_total: 0, dias_mora: 0 });
//   };

//   // --- FUNCIONES DE ACCIÓN ---

//   const handleConfirmarVenta = async () => {
//     if (!esCtaCte && totalPagado < totalFinal)
//       return Swal.fire("Error", "Monto insuficiente", "error");
//     try {
//       const payload = {
//         cliente_id: clienteSel.id,
//         fecha,
//         precio_total: totalFinal,
//         pagos,
//         es_cuenta_corriente: esCtaCte,
//         usuario_id: user.id,
//         empresa_id: user.empresa_id,
//         items: tmpVentas,
//         descuento_porcentaje: descPorcentaje,
//         descuento_monto: descMonto,
//       };
//       const res = await api.post("/ventas", payload);
//       if (res.data.success) {
//         if (refreshAll) await refreshAll();
//         window.dispatchEvent(new Event("forceRefreshNotifications"));
//         window.$("#modal-pagos").modal("hide");
//         await Swal.fire({
//           position: "center",
//           icon: "success",
//           title: "¡Éxito!",
//           text: "Venta registrada satisfactoriamente",
//           showConfirmButton: false,
//           timer: 2500,
//         });
//         if (res.data.venta_id)
//           window.open(
//             `${API_URL}/api/ventas/ticket/${
//               res.data.venta_id
//             }?token=${localStorage.getItem("token")}`,
//             "_blank"
//           );
//         resetForm();
//         fetchData();
//       }
//     } catch (e) {
//       Swal.fire("Error", "Fallo al registrar", "error");
//     }
//   };

//   // --- LÓGICA DE ATAJOS (F5 y F12) ---
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       // ATAJO F5
//       if (e.key === "F5") {
//         e.preventDefault();
//         if (tmpVentas.length > 0) {
//           const modalPagos = document.getElementById("modal-pagos");
//           if (modalPagos && !modalPagos.classList.contains("show")) {
//             window.$("#modal-pagos").modal("show");
//           } else {
//             handleConfirmarVenta();
//           }
//         } else {
//           Swal.fire(
//             "Carrito vacío",
//             "Agregue productos antes de registrar la venta",
//             "info"
//           );
//         }
//       }

//       // 👈 NUEVO ATAJO F12
//       if (e.key === "F12") {
//         e.preventDefault();
//         if (tmpVentas.length > 0) {
//           const modalPagos = window.$("#modal-pagos");
//           // Abrimos el modal
//           modalPagos.modal("show");
//           // Esperamos a que el modal termine de abrirse para dar el foco
//           setTimeout(() => {
//             const inputEfectivo = document.getElementById("pago-efectivo");
//             if (inputEfectivo) {
//               inputEfectivo.focus();
//               inputEfectivo.select(); // Selecciona el texto para sobreescribir rápido
//             }
//           }, 500);
//         }
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [tmpVentas, totalPagado, totalFinal, esCtaCte, clienteSel]);

//   const updateQty = async (id, currentQty, delta) => {
//     const newQty = parseFloat(currentQty) + delta;
//     if (newQty < 1) return;
//     try {
//       const res = await api.put(`/ventas/tmp/${id}`, { cantidad: newQty });
//       if (res.data.success) fetchData();
//     } catch (e) {
//       Swal.fire("Error", "No se pudo actualizar la cantidad", "error");
//     }
//   };

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

//   const handleAddProduct = async (e) => {
//     if (e.key === "Enter" && codigo) addItem(codigo);
//   };

//   const updateDeudaCliente = async (id) => {
//     try {
//       const res = await api.get(`/ventas/deuda-cliente/${id}`);
//       setDeudaInfo(res.data);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleFillTotal = (campo) => {
//     setPagos({
//       efectivo: 0,
//       tarjeta: 0,
//       mercadopago: 0,
//       transferencia: 0,
//       [campo]: totalFinal.toFixed(2),
//     });
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
//       const timer = setTimeout(() => {
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
//       return () => clearTimeout(timer);
//     }
//   }, [loading]);

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
//             <span className="badge badge-secondary p-2 ml-1">
//               F3: Listado Ventas
//             </span>
//             <span className="badge badge-danger p-2 ml-1">
//               F5: Registrar Venta
//             </span>
//           </div>
//         </div>
//         <hr />

//         <div className="row">
//           <div className="col-md-8">
//             <div className="card card-outline card-primary shadow-sm">
//               <div className="card-header">
//                 <h3 className="card-title">Ingrese los datos</h3>
//               </div>
//               <div className="card-body">
//                 <div className="row mb-3">
//                   <div className="col-md-2">
//                     <label>Cantidad *</label>
//                     <input
//                       type="number"
//                       className="form-control text-center"
//                       value={cantidad}
//                       onChange={(e) => setCantidad(e.target.value)}
//                       style={{ backgroundColor: "rgba(233,231,16,0.15)" }}
//                     />
//                   </div>
//                   <div className="col-md-7">
//                     <label>Código</label>
//                     <div className="input-group">
//                       <div className="input-group-prepend">
//                         <span className="input-group-text">
//                           <i className="fas fa-barcode"></i>
//                         </span>
//                       </div>
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={codigo}
//                         onChange={(e) => setCodigo(e.target.value)}
//                         onKeyDown={handleAddProduct}
//                         autoFocus
//                         placeholder="Código o nombre..."
//                       />
//                       <div className="input-group-append">
//                         <button
//                           className="btn btn-primary"
//                           type="button"
//                           data-toggle="modal"
//                           data-target="#modal-productos"
//                         >
//                           <i className="fas fa-search"></i>
//                         </button>
//                         <button
//                           className="btn btn-success"
//                           type="button"
//                           onClick={() => navigate("/productos/crear")}
//                           title="Crear nuevo producto"
//                         >
//                           <i className="fas fa-plus"></i>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="table-responsive">
//                   <table className="table table-sm table-striped table-bordered">
//                     <thead className="thead-dark text-center">
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
//                         let precio = parseFloat(
//                           it.precio_venta || it.combo_precio || 0
//                         );
//                         if (it.aplicar_porcentaje)
//                           precio =
//                             parseFloat(it.precio_compra) *
//                             (1 + parseFloat(it.valor_porcentaje) / 100);
//                         return (
//                           <tr key={it.id}>
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
//                                     updateQty(it.id, it.cantidad, -1)
//                                   }
//                                   disabled={it.cantidad <= 1}
//                                 >
//                                   <i className="fas fa-minus"></i>
//                                 </button>
//                                 <span
//                                   className="px-2 font-weight-bold align-self-center"
//                                   style={{ minWidth: "30px" }}
//                                 >
//                                   {it.cantidad}
//                                 </span>
//                                 <button
//                                   className="btn btn-outline-secondary btn-xs"
//                                   onClick={() =>
//                                     updateQty(it.id, it.cantidad, 1)
//                                   }
//                                 >
//                                   <i className="fas fa-plus"></i>
//                                 </button>
//                               </div>
//                             </td>
//                             <td className="align-middle">
//                               {it.nombre || it.combo_nombre}
//                             </td>
//                             <td className="text-center align-middle">
//                               {it.unidad_nombre || "N/A"}
//                             </td>
//                             <td className="text-right align-middle">
//                               ${" "}
//                               {precio.toLocaleString("es-AR", {
//                                 minimumFractionDigits: 2,
//                               })}
//                             </td>
//                             <td className="text-right align-middle text-bold">
//                               ${" "}
//                               {(it.cantidad * precio).toLocaleString("es-AR", {
//                                 minimumFractionDigits: 2,
//                               })}
//                             </td>
//                             <td className="text-center align-middle">
//                               <button
//                                 className="btn btn-danger btn-sm"
//                                 onClick={async () => {
//                                   await api.delete(`/ventas/tmp/${it.id}`);
//                                   fetchData();
//                                 }}
//                               >
//                                 <i className="fas fa-trash"></i>
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                       {tmpVentas.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan="8"
//                             className="text-center text-muted py-3 italic"
//                           >
//                             No hay productos en el carrito
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                     <tfoot className="bg-light">
//                       <tr className="text-bold">
//                         <td colSpan="2" className="text-right">
//                           Total Cantidad
//                         </td>
//                         <td className="text-center text-primary">
//                           {totalCantidad}
//                         </td>
//                         <td colSpan="3" className="text-right">
//                           Total Venta
//                         </td>
//                         <td className="text-right text-primary">
//                           ${" "}
//                           {subtotalBruto.toLocaleString("es-AR", {
//                             minimumFractionDigits: 2,
//                           })}
//                         </td>
//                         <td></td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//                 <button
//                   className="btn btn-secondary btn-sm mt-2"
//                   onClick={() => navigate("/ventas/listado")}
//                 >
//                   <i className="fas fa-reply"></i> Volver
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-4">
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <div className="row mb-3">
//                   <div className="col-9">
//                     <button
//                       className="btn btn-primary btn-sm btn-block"
//                       data-toggle="modal"
//                       data-target="#modal-clientes"
//                     >
//                       <i className="fas fa-search"></i> Buscar Cliente
//                     </button>
//                   </div>
//                   <div className="col-3">
//                     <button
//                       className="btn btn-success btn-sm btn-block"
//                       data-toggle="modal"
//                       data-target="#modal-crear-cliente"
//                     >
//                       <i className="fas fa-plus"></i>
//                     </button>
//                   </div>
//                 </div>
//                 <div className="row mb-2">
//                   <div className="col-md-7">
//                     <label>
//                       <small>Cliente</small>
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control form-control-sm bg-light"
//                       value={clienteSel.nombre_cliente}
//                       readOnly
//                     />
//                   </div>
//                   <div className="col-md-5">
//                     <label>
//                       <small>C.U.I.T.</small>
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control form-control-sm bg-light"
//                       value={clienteSel.cuil_codigo}
//                       readOnly
//                     />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Fecha de venta *</small>
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control form-control-sm"
//                     value={fecha}
//                     onChange={(e) => setFecha(e.target.value)}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Total *</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold bg-warning"
//                     value={`$ ${subtotalBruto.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Dólar</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-white"
//                     style={{ backgroundColor: "#17a2b8" }}
//                     value={`$ ${dolar.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Total en Dólares</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-white bg-primary"
//                     value={`$USD ${totalDolares.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div className="row mb-2">
//                   <div className="col-6">
//                     <label>
//                       <small>Desc. %</small>
//                     </label>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm text-right"
//                       value={descPorcentaje}
//                       onChange={(e) => setDescPorcentaje(e.target.value)}
//                     />
//                   </div>
//                   <div className="col-6">
//                     <label>
//                       <small>Desc. Monto</small>
//                     </label>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm text-right"
//                       value={descMonto}
//                       onChange={(e) => setDescMonto(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     <small>Precio Total con Descuento</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-white bg-success"
//                     value={`$ ${totalFinal.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//                 <div
//                   className={`p-2 text-right border rounded mb-3 text-white font-weight-bold ${
//                     deudaInfo.deuda_total > 0 ? "bg-danger" : "bg-success"
//                   }`}
//                 >
//                   <small>DEUDA ACTUAL DEL CLIENTE</small>
//                   <div className="h6 m-0">
//                     ${" "}
//                     {parseFloat(deudaInfo.deuda_total).toLocaleString("es-AR")}{" "}
//                     ({deudaInfo.dias_mora} días mora)
//                   </div>
//                 </div>
//                 <button
//                   className="btn btn-primary btn-block btn-lg shadow-sm"
//                   data-toggle="modal"
//                   data-target="#modal-pagos"
//                 >
//                   <i className="fas fa-cash-register"></i> Registrar Venta (F5)
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODAL PAGOS */}
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
//               {["efectivo", "tarjeta", "mercadopago", "transferencia"].map(
//                 (m) => (
//                   <div className="form-group row mb-2" key={m}>
//                     <label className="col-sm-5 text-capitalize text-bold">
//                       {m}
//                     </label>
//                     <div className="col-sm-7 input-group">
//                       <input
//                         id={m === "efectivo" ? "pago-efectivo" : ""} // 👈 ID PARA EL FOCO
//                         type="number"
//                         className="form-control text-right font-weight-bold"
//                         style={{
//                           backgroundColor:
//                             m === "efectivo" ? "#d4edda" : "#e9ecef",
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
//                           onClick={() => handleFillTotal(m)}
//                         >
//                           $
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               )}
//               <hr />
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold">Total a Pagar</label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold bg-light"
//                     style={{ fontSize: "1.4rem" }}
//                     value={`$ ${totalFinal.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//               </div>
//               <div className="form-group row">
//                 <label className="col-sm-5 text-bold text-success">
//                   Vuelto (Efectivo)
//                 </label>
//                 <div className="col-sm-7">
//                   <input
//                     type="text"
//                     className="form-control text-right font-weight-bold text-success bg-light"
//                     style={{ fontSize: "1.4rem" }}
//                     value={`$ ${vuelto.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
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
//                     value={`$ ${montoSaldar.toLocaleString("es-AR", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                     readOnly
//                   />
//                 </div>
//               </div>
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

//       {/* MODAL PRODUCTOS CON IMAGEN */}
//       <div className="modal fade" id="modal-productos" tabIndex="-1">
//         <div className="modal-dialog modal-xl modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header bg-info text-white">
//               <h5>Listado de Ítems</h5>
//               <button className="close text-white" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <table
//                 id="prod-table"
//                 className="table table-striped table-bordered table-sm"
//                 style={{ width: "100%" }}
//               >
//                 <thead>
//                   <tr className="text-center">
//                     <th>Acción</th>
//                     <th>Imagen</th>
//                     <th>Código</th>
//                     <th>Nombre</th>
//                     <th>Stock</th>
//                     <th>Precio</th>
//                     <th>Tipo</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {productos.map((p) => (
//                     <tr key={`p-${p.id}`}>
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
//                             width="40px"
//                             height="40px"
//                             className="rounded shadow-sm"
//                             style={{ objectFit: "cover" }}
//                           />
//                         ) : (
//                           <small className="text-muted">N/A</small>
//                         )}
//                       </td>
//                       <td className="text-center align-middle">{p.codigo}</td>
//                       <td className="align-middle">{p.nombre}</td>
//                       <td className="text-center align-middle">{p.stock}</td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(p.precio_venta).toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-center align-middle">
//                         <span className="badge badge-primary">Producto</span>
//                       </td>
//                     </tr>
//                   ))}
//                   {combos.map((c) => (
//                     <tr key={`c-${c.id}`}>
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
//                       <td className="align-middle">{c.nombre}</td>
//                       <td className="text-center align-middle">N/A</td>
//                       <td className="text-right align-middle">
//                         ${" "}
//                         {parseFloat(c.precio_venta).toLocaleString("es-AR", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td className="text-center align-middle">
//                         <span className="badge badge-warning">Combo</span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODAL BUSCAR CLIENTE */}
//       <div className="modal fade" id="modal-clientes" tabIndex="-1">
//         <div className="modal-dialog modal-lg">
//           <div className="modal-content">
//             <div className="modal-header bg-info text-white">
//               <h5>Seleccionar Cliente</h5>
//               <button className="close text-white" data-dismiss="modal">
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <table
//                 id="clie-table"
//                 className="table table-striped table-bordered table-sm"
//                 style={{ width: "100%" }}
//               >
//                 <thead>
//                   <tr className="text-center">
//                     <th>Acción</th>
//                     <th>C.U.I.L</th>
//                     <th>Nombre</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {clientes.map((cl) => (
//                     <tr key={cl.id}>
//                       <td className="text-center">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => {
//                             setClienteSel(cl);
//                             updateDeudaCliente(cl.id);
//                             window.$("#modal-clientes").modal("hide");
//                           }}
//                         >
//                           <i className="fas fa-check"></i>
//                         </button>
//                       </td>
//                       <td className="text-center">{cl.cuil_codigo}</td>
//                       <td>{cl.nombre_cliente}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODAL CREAR CLIENTE */}
//       <div className="modal fade" id="modal-crear-cliente" tabIndex="-1">
//         <div className="modal-dialog modal-lg modal-dialog-centered">
//           <div className="modal-content shadow-lg">
//             <div className="modal-header bg-primary text-white">
//               <h5 className="modal-title">Registrar nuevo cliente</h5>
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
//                   <label>Correo Electrónico</label>
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

  // URL dinámica según el entorno
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible en esta tabla",
    sInfo: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Siguiente",
      sPrevious: "Anterior",
    },
  };

  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tmpVentas, setTmpVentas] = useState([]);
  const [dolar, setDolar] = useState(1499.5);

  const [cantidad, setCantidad] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset() * 60000;
    return new Date(hoy - offset).toISOString().split("T")[0];
  });
  const [clienteSel, setClienteSel] = useState({
    id: 1,
    nombre_cliente: "Consumidor Final",
    cuil_codigo: "00000000000",
  });
  const [deudaInfo, setDeudaInfo] = useState({ deuda_total: 0, dias_mora: 0 });
  const [descPorcentaje, setDescPorcentaje] = useState(0);
  const [descMonto, setDescMonto] = useState(0);

  const [pagos, setPagos] = useState({
    efectivo: 0,
    tarjeta: 0,
    mercadopago: 0,
    transferencia: 0,
  });
  const [esCtaCte, setEsCtaCte] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre_cliente: "",
    cuil_codigo: "",
    telefono: "",
    email: "",
  });

  // --- CÁLCULOS ---
  const totalCantidad = tmpVentas.reduce(
    (acc, it) => acc + parseFloat(it.cantidad),
    0
  );

  const subtotalBruto = tmpVentas.reduce((acc, it) => {
    let precio = parseFloat(it.precio_venta || it.combo_precio || 0);
    if (it.aplicar_porcentaje)
      precio =
        parseFloat(it.precio_compra) *
        (1 + parseFloat(it.valor_porcentaje) / 100);
    return acc + parseFloat(it.cantidad) * precio;
  }, 0);

  const totalDescuento =
    subtotalBruto * (parseFloat(descPorcentaje || 0) / 100) +
    parseFloat(descMonto || 0);
  const totalFinal = Math.max(subtotalBruto - totalDescuento, 0);
  const totalDolares = totalFinal / dolar;

  const totalPagado = Object.values(pagos).reduce(
    (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
    0
  );
  const montoSaldar = Math.max(totalFinal - totalPagado, 0);
  const otrosMedios =
    parseFloat(pagos.tarjeta || 0) +
    parseFloat(pagos.mercadopago || 0) +
    parseFloat(pagos.transferencia || 0);
  const restoParaEfectivo = totalFinal - otrosMedios;
  const vuelto =
    pagos.efectivo > restoParaEfectivo ? pagos.efectivo - restoParaEfectivo : 0;

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    if (!user) return;
    try {
      const [resP, resCl, resCo, resTmp, resDolar] = await Promise.all([
        api.get("/productos"),
        api.get("/clientes"),
        api.get("/combos").catch(() => ({ data: [] })),
        api.get(`/ventas/tmp?usuario_id=${user.id}`),
        fetch("https://dolarapi.com/v1/dolares/bolsa")
          .then((r) => r.json())
          .catch(() => ({ compra: 1499.5 })),
      ]);
      setProductos(resP.data);
      setClientes(resCl.data);
      setCombos(resCo.data);
      setTmpVentas(resTmp.data);
      setDolar(resDolar.compra || 1499.5);
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

  // --- RESETEO ---
  const resetForm = () => {
    setPagos({ efectivo: 0, tarjeta: 0, mercadopago: 0, transferencia: 0 });
    setClienteSel({
      id: 1,
      nombre_cliente: "Consumidor Final",
      cuil_codigo: "00000000000",
    });
    setDescPorcentaje(0);
    setDescMonto(0);
    setEsCtaCte(false);
    setCodigo("");
    setCantidad(1);
    setDeudaInfo({ deuda_total: 0, dias_mora: 0 });
  };

  // --- FUNCIONES DE ACCIÓN ---

  const handleConfirmarVenta = async () => {
    if (!esCtaCte && totalPagado < totalFinal)
      return Swal.fire("Error", "Monto insuficiente", "error");
    try {
      // 👈 CORRECCIÓN CONTABLE: Restamos el vuelto del efectivo para que el arqueo de caja sea real
      const pagosSaneados = {
        ...pagos,
        efectivo: Math.max(parseFloat(pagos.efectivo || 0) - vuelto, 0),
      };

      const payload = {
        cliente_id: clienteSel.id,
        fecha,
        precio_total: totalFinal,
        pagos: pagosSaneados, // Enviamos el pago real neto (sin el vuelto)
        es_cuenta_corriente: esCtaCte,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        items: tmpVentas,
        descuento_porcentaje: descPorcentaje,
        descuento_monto: descMonto,
      };

      const res = await api.post("/ventas", payload);
      if (res.data.success) {
        if (refreshAll) await refreshAll();
        window.dispatchEvent(new Event("forceRefreshNotifications"));
        window.$("#modal-pagos").modal("hide");
        await Swal.fire({
          position: "center",
          icon: "success",
          title: "¡Éxito!",
          text: "Venta registrada satisfactoriamente",
          showConfirmButton: false,
          timer: 2500,
        });
        if (res.data.venta_id)
          window.open(
            `${API_URL}/api/ventas/ticket/${
              res.data.venta_id
            }?token=${localStorage.getItem("token")}`,
            "_blank"
          );
        resetForm();
        fetchData();
      }
    } catch (e) {
      Swal.fire("Error", "Fallo al registrar", "error");
    }
  };

  // --- LÓGICA DE ATAJOS (F5 y F12) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F5") {
        e.preventDefault();
        if (tmpVentas.length > 0) {
          const modalPagos = document.getElementById("modal-pagos");
          if (modalPagos && !modalPagos.classList.contains("show")) {
            window.$("#modal-pagos").modal("show");
          } else {
            handleConfirmarVenta();
          }
        } else {
          Swal.fire(
            "Carrito vacío",
            "Agregue productos antes de registrar la venta",
            "info"
          );
        }
      }

      if (e.key === "F12") {
        e.preventDefault();
        if (tmpVentas.length > 0) {
          window.$("#modal-pagos").modal("show");
          setTimeout(() => {
            const inputEfectivo = document.getElementById("pago-efectivo");
            if (inputEfectivo) {
              inputEfectivo.focus();
              inputEfectivo.select();
            }
          }, 500);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tmpVentas, totalPagado, totalFinal, esCtaCte, clienteSel, vuelto]);

  const updateQty = async (id, currentQty, delta) => {
    const newQty = parseFloat(currentQty) + delta;
    if (newQty < 1) return;
    try {
      const res = await api.put(`/ventas/tmp/${id}`, { cantidad: newQty });
      if (res.data.success) fetchData();
    } catch (e) {
      Swal.fire("Error", "No se pudo actualizar la cantidad", "error");
    }
  };

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

  const handleAddProduct = async (e) => {
    if (e.key === "Enter" && codigo) addItem(codigo);
  };

  const updateDeudaCliente = async (id) => {
    try {
      const res = await api.get(`/ventas/deuda-cliente/${id}`);
      setDeudaInfo(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFillTotal = (campo) => {
    setPagos({
      efectivo: 0,
      tarjeta: 0,
      mercadopago: 0,
      transferencia: 0,
      [campo]: totalFinal.toFixed(2),
    });
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
      const timer = setTimeout(() => {
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
      return () => clearTimeout(timer);
    }
  }, [loading]);

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
            <span className="badge badge-secondary p-2 ml-1">
              F3: Listado Ventas
            </span>
            <span className="badge badge-danger p-2 ml-1">
              F5: Registrar Venta
            </span>
            <span className="badge badge-success p-2 ml-1">
              F12: Efectivo
            </span>
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-md-8">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title">Ingrese los datos</h3>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-2">
                    <label>Cantidad *</label>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      style={{ backgroundColor: "rgba(233,231,16,0.15)" }}
                    />
                  </div>
                  <div className="col-md-7">
                    <label>Código</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-barcode"></i>
                        </span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        onKeyDown={handleAddProduct}
                        autoFocus
                        placeholder="Código o nombre..."
                      />
                      <div className="input-group-append">
                        <button
                          className="btn btn-primary"
                          type="button"
                          data-toggle="modal"
                          data-target="#modal-productos"
                        >
                          <i className="fas fa-search"></i>
                        </button>
                        <button
                          className="btn btn-success"
                          type="button"
                          onClick={() => navigate("/productos/crear")}
                          title="Crear nuevo producto"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-striped table-bordered">
                    <thead className="thead-dark text-center">
                      <tr>
                        <th>Nro.</th>
                        <th>Código</th>
                        <th style={{ width: "120px" }}>Cantidad</th>
                        <th>Producto/Combo</th>
                        <th>Unidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tmpVentas.map((it, i) => {
                        let precio = parseFloat(
                          it.precio_venta || it.combo_precio || 0
                        );
                        if (it.aplicar_porcentaje)
                          precio =
                            parseFloat(it.precio_compra) *
                            (1 + parseFloat(it.valor_porcentaje) / 100);
                        return (
                          <tr key={it.id}>
                            <td className="text-center align-middle">
                              {i + 1}
                            </td>
                            <td className="text-center align-middle">
                              {it.codigo || it.combo_codigo}
                            </td>
                            <td className="text-center align-middle">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary btn-xs"
                                  onClick={() =>
                                    updateQty(it.id, it.cantidad, -1)
                                  }
                                  disabled={it.cantidad <= 1}
                                >
                                  <i className="fas fa-minus"></i>
                                </button>
                                <span
                                  className="px-2 font-weight-bold align-self-center"
                                  style={{ minWidth: "30px" }}
                                >
                                  {it.cantidad}
                                </span>
                                <button
                                  className="btn btn-outline-secondary btn-xs"
                                  onClick={() =>
                                    updateQty(it.id, it.cantidad, 1)
                                  }
                                >
                                  <i className="fas fa-plus"></i>
                                </button>
                              </div>
                            </td>
                            <td className="align-middle">
                              {it.nombre || it.combo_nombre}
                            </td>
                            <td className="text-center align-middle">
                              {it.unidad_nombre || "N/A"}
                            </td>
                            <td className="text-right align-middle">
                              ${" "}
                              {precio.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="text-right align-middle text-bold">
                              ${" "}
                              {(it.cantidad * precio).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="text-center align-middle">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  await api.delete(`/ventas/tmp/${it.id}`);
                                  fetchData();
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {tmpVentas.length === 0 && (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center text-muted py-3 italic"
                          >
                            No hay productos en el carrito
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-light">
                      <tr className="text-bold">
                        <td colSpan="2" className="text-right">
                          Total Cantidad
                        </td>
                        <td className="text-center text-primary">
                          {totalCantidad}
                        </td>
                        <td colSpan="3" className="text-right">
                          Total Venta
                        </td>
                        <td className="text-right text-primary">
                          ${" "}
                          {subtotalBruto.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <button
                  className="btn btn-secondary btn-sm mt-2"
                  onClick={() => navigate("/ventas/listado")}
                >
                  <i className="fas fa-reply"></i> Volver
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-9">
                    <button
                      className="btn btn-primary btn-sm btn-block"
                      data-toggle="modal"
                      data-target="#modal-clientes"
                    >
                      <i className="fas fa-search"></i> Buscar Cliente
                    </button>
                  </div>
                  <div className="col-3">
                    <button
                      className="btn btn-success btn-sm btn-block"
                      data-toggle="modal"
                      data-target="#modal-crear-cliente"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-7">
                    <label>
                      <small>Cliente</small>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-light"
                      value={clienteSel.nombre_cliente}
                      readOnly
                    />
                  </div>
                  <div className="col-md-5">
                    <label>
                      <small>C.U.I.T.</small>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-light"
                      value={clienteSel.cuil_codigo}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <small>Fecha de venta *</small>
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <small>Precio Total *</small>
                  </label>
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold bg-warning"
                    value={`$ ${subtotalBruto.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>
                    <small>Precio Dólar</small>
                  </label>
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold text-white"
                    style={{ backgroundColor: "#17a2b8" }}
                    value={`$ ${dolar.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>
                    <small>Precio Total en Dólares</small>
                  </label>
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold text-white bg-primary"
                    value={`$USD ${totalDolares.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
                <div className="row mb-2">
                  <div className="col-6">
                    <label>
                      <small>Desc. %</small>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm text-right"
                      value={descPorcentaje}
                      onChange={(e) => setDescPorcentaje(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label>
                      <small>Desc. Monto</small>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm text-right"
                      value={descMonto}
                      onChange={(e) => setDescMonto(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <small>Precio Total con Descuento</small>
                  </label>
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold text-white bg-success"
                    value={`$ ${totalFinal.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
                <div
                  className={`p-2 text-right border rounded mb-3 text-white font-weight-bold ${
                    deudaInfo.deuda_total > 0 ? "bg-danger" : "bg-success"
                  }`}
                >
                  <small>DEUDA ACTUAL DEL CLIENTE</small>
                  <div className="h6 m-0">
                    ${" "}
                    {parseFloat(deudaInfo.deuda_total).toLocaleString("es-AR")}{" "}
                    ({deudaInfo.dias_mora} días mora)
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-block btn-lg shadow-sm"
                  data-toggle="modal"
                  data-target="#modal-pagos"
                >
                  <i className="fas fa-cash-register"></i> Registrar Venta (F5)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PAGOS */}
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
              {["efectivo", "tarjeta", "mercadopago", "transferencia"].map(
                (m) => (
                  <div className="form-group row mb-2" key={m}>
                    <label className="col-sm-5 text-capitalize text-bold">
                      {m}
                    </label>
                    <div className="col-sm-7 input-group">
                      <input
                        id={m === "efectivo" ? "pago-efectivo" : ""}
                        type="number"
                        className="form-control text-right font-weight-bold"
                        style={{
                          backgroundColor:
                            m === "efectivo" ? "#d4edda" : "#e9ecef",
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
                          onClick={() => handleFillTotal(m)}
                        >
                          $
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
              <hr />
              <div className="form-group row">
                <label className="col-sm-5 text-bold">Total a Pagar</label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold bg-light"
                    style={{ fontSize: "1.4rem" }}
                    value={`$ ${totalFinal.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-5 text-bold text-success">
                  Vuelto (Efectivo)
                </label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold text-success bg-light"
                    style={{ fontSize: "1.4rem" }}
                    value={`$ ${vuelto.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}`}
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
                    value={`$ ${montoSaldar.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
              </div>
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

      {/* MODAL PRODUCTOS CON IMAGEN */}
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
                className="table table-striped table-bordered table-sm"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr className="text-center">
                    <th>Acción</th>
                    <th>Imagen</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={`p-${p.id}`}>
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
                            width="40px"
                            height="40px"
                            className="rounded shadow-sm"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <small className="text-muted">N/A</small>
                        )}
                      </td>
                      <td className="text-center align-middle">{p.codigo}</td>
                      <td className="align-middle">{p.nombre}</td>
                      <td className="text-center align-middle">{p.stock}</td>
                      <td className="text-right align-middle">
                        ${" "}
                        {parseFloat(p.precio_venta).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-primary">Producto</span>
                      </td>
                    </tr>
                  ))}
                  {combos.map((c) => (
                    <tr key={`c-${c.id}`}>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            addItem(c.codigo);
                            window.$("#modal-productos").modal("hide");
                          }}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </td>
                      <td className="text-center align-middle">
                        <small className="text-muted">Combo</small>
                      </td>
                      <td className="text-center align-middle">{c.codigo}</td>
                      <td className="align-middle">{c.nombre}</td>
                      <td className="text-center align-middle">N/A</td>
                      <td className="text-right align-middle">
                        ${" "}
                        {parseFloat(c.precio_venta).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-warning">Combo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL BUSCAR CLIENTE */}
      <div className="modal fade" id="modal-clientes" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5>Seleccionar Cliente</h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <table
                id="clie-table"
                className="table table-striped table-bordered table-sm"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr className="text-center">
                    <th>Acción</th>
                    <th>C.U.I.L</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cl) => (
                    <tr key={cl.id}>
                      <td className="text-center">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setClienteSel(cl);
                            updateDeudaCliente(cl.id);
                            window.$("#modal-clientes").modal("hide");
                          }}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </td>
                      <td className="text-center">{cl.cuil_codigo}</td>
                      <td>{cl.nombre_cliente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CREAR CLIENTE */}
      <div className="modal fade" id="modal-crear-cliente" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Registrar nuevo cliente</h5>
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
                  <label>C.U.I.T./D.N.I.</label>
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
                  <label>Correo Electrónico</label>
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
            <div className="modal-footer d-flex justify-content-between">
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
