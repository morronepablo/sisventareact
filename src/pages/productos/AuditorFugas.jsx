// // // src/pages/productos/AuditorFugas.jsx
// // import React, { useEffect, useState } from "react";
// // import { Link } from "react-router-dom";
// // import api from "../../services/api";
// // import LoadingSpinner from "../../components/LoadingSpinner";

// // const AuditorFugas = () => {
// //   const [anomalias, setAnomalias] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const cargarAnomalias = async () => {
// //     try {
// //       const res = await api.get("/auditoria/anomalias");
// //       setAnomalias(res.data);
// //     } catch (err) {
// //       console.error("Error al cargar auditoría:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     cargarAnomalias();
// //   }, []);

// //   const formatMoney = (val) =>
// //     `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
// //       minimumFractionDigits: 2,
// //     })}`;

// //   if (loading) return <LoadingSpinner />;
// //   if (!anomalias)
// //     return (
// //       <div className="p-4 text-center">
// //         <h5>Error al cargar el motor de auditoría.</h5>
// //       </div>
// //     );

// //   return (
// //     <div className="container-fluid pt-3 pb-5">
// //       <h1 className="text-bold text-dark">
// //         <i className="fas fa-user-secret text-danger mr-2"></i> Auditor de Fugas
// //       </h1>
// //       <p className="text-muted">
// //         Detección de patrones inusuales y análisis de comportamiento humano.
// //       </p>

// //       {/* FILA 1: DEVOLUCIONES Y ARQUEOS */}
// //       <div className="row">
// //         <div className="col-md-6">
// //           <div className="card card-outline card-danger shadow-sm h-100">
// //             <div className="card-header">
// //               <h3 className="card-title text-bold">
// //                 <i className="fas fa-undo-alt mr-2"></i> Ráfagas de Devoluciones
// //               </h3>
// //             </div>
// //             <div className="card-body p-0">
// //               <table className="table table-sm table-striped">
// //                 <thead>
// //                   <tr className="bg-light">
// //                     <th>Usuario / Caja</th>
// //                     <th className="text-center">Cant.</th>
// //                     <th>Horario</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {anomalias.devoluciones_sospechosas?.length > 0 ? (
// //                     anomalias.devoluciones_sospechosas.map((d, i) => (
// //                       <tr key={i}>
// //                         <td>
// //                           <b>{d.usuario_nombre}</b> <br />{" "}
// //                           <small>Caja {d.caja_id}</small>
// //                         </td>
// //                         <td className="text-center align-middle">
// //                           <span className="badge badge-danger">
// //                             {d.cantidad_devoluciones} en 1h
// //                           </span>
// //                         </td>
// //                         <td className="text-danger align-middle small">
// //                           {new Date(d.inicio_periodo).toLocaleTimeString()} -{" "}
// //                           {new Date(d.fin_periodo).toLocaleTimeString()}
// //                         </td>
// //                       </tr>
// //                     ))
// //                   ) : (
// //                     <tr>
// //                       <td colSpan="3" className="text-center py-3 text-muted">
// //                         Sin ráfagas detectadas
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="col-md-6">
// //           <div className="card card-outline card-warning shadow-sm h-100">
// //             <div className="card-header">
// //               <h3 className="card-title text-bold">
// //                 <i className="fas fa-search-dollar mr-2"></i> Faltantes en
// //                 Arqueos
// //               </h3>
// //             </div>
// //             <div className="card-body p-0">
// //               <table className="table table-sm table-striped">
// //                 <thead>
// //                   <tr className="bg-light">
// //                     <th>Usuario</th>
// //                     <th>Diferencia</th>
// //                     <th>Fecha Cierre</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {anomalias.arqueos_con_faltante?.length > 0 ? (
// //                     anomalias.arqueos_con_faltante.map((a, i) => (
// //                       <tr key={i}>
// //                         <td>
// //                           {a.usuario_nombre} <br />{" "}
// //                           <small>Caja {a.caja_id}</small>
// //                         </td>
// //                         <td className="text-danger text-bold align-middle">
// //                           {formatMoney(a.diferencia)}
// //                         </td>
// //                         <td className="align-middle small">
// //                           {new Date(a.fecha_cierre).toLocaleString()}
// //                         </td>
// //                       </tr>
// //                     ))
// //                   ) : (
// //                     <tr>
// //                       <td colSpan="3" className="text-center py-3 text-muted">
// //                         Sin faltantes críticos
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* FILA 2: DESCUENTOS Y ANULACIONES */}
// //       <div className="row mt-4">
// //         <div className="col-md-6">
// //           <div className="card card-outline card-primary shadow-sm h-100">
// //             <div className="card-header">
// //               <h3 className="card-title text-bold">
// //                 <i className="fas fa-percentage mr-2"></i> Ranking de
// //                 Generosidad
// //               </h3>
// //             </div>
// //             <div className="card-body p-0">
// //               <table className="table table-sm table-striped">
// //                 <thead>
// //                   <tr className="bg-light">
// //                     <th>Cajero</th>
// //                     <th className="text-center">Promedio Desc.</th>
// //                     <th className="text-center">Tickets</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {anomalias.ranking_generosidad?.length > 0 ? (
// //                     anomalias.ranking_generosidad.map((u, i) => (
// //                       <tr key={i}>
// //                         <td>
// //                           <b>{u.usuario_nombre}</b>
// //                         </td>
// //                         <td className="text-center align-middle">
// //                           <span
// //                             className={`text-bold ${
// //                               parseFloat(u.promedio_descuento) > 10
// //                                 ? "text-danger"
// //                                 : "text-primary"
// //                             }`}
// //                           >
// //                             {parseFloat(u.promedio_descuento).toFixed(1)}%
// //                           </span>
// //                         </td>
// //                         <td className="text-center align-middle">
// //                           {u.total_ventas_con_desc}
// //                         </td>
// //                       </tr>
// //                     ))
// //                   ) : (
// //                     <tr>
// //                       <td colSpan="3" className="text-center py-3 text-muted">
// //                         Sin datos de descuentos
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="col-md-6">
// //           <div className="card card-outline card-dark shadow-sm h-100">
// //             <div className="card-header">
// //               <h3 className="card-title text-bold">
// //                 <i className="fas fa-trash-alt mr-2"></i> Tickets Anulados
// //                 (Borrados)
// //               </h3>
// //             </div>
// //             <div className="card-body p-0">
// //               <table className="table table-sm table-striped">
// //                 <thead>
// //                   <tr className="bg-light">
// //                     <th>Usuario</th>
// //                     <th className="text-center">Anulaciones</th>
// //                     <th className="text-center">Nivel</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {anomalias.tickets_anulados?.length > 0 ? (
// //                     anomalias.tickets_anulados.map((a, i) => (
// //                       <tr key={i}>
// //                         <td>
// //                           <b>{a.usuario_nombre}</b>
// //                         </td>
// //                         <td className="text-center text-bold h5 align-middle">
// //                           {a.cantidad_anulaciones}
// //                         </td>
// //                         <td className="text-center align-middle">
// //                           <span
// //                             className={`badge ${
// //                               a.cantidad_anulaciones > 5
// //                                 ? "badge-danger"
// //                                 : "badge-warning"
// //                             }`}
// //                           >
// //                             {a.cantidad_anulaciones > 5
// //                               ? "CRÍTICO"
// //                               : "SOSPECHOSO"}
// //                           </span>
// //                         </td>
// //                       </tr>
// //                     ))
// //                   ) : (
// //                     <tr>
// //                       <td colSpan="3" className="text-center py-3 text-muted">
// //                         Sin registros de ventas borradas
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* FILA 3: HORARIOS INUSUALES */}
// //       <div className="row mt-4">
// //         <div className="col-12">
// //           <div className="card card-outline card-info shadow-sm">
// //             <div className="card-header">
// //               <h3 className="card-title text-bold">
// //                 <i className="fas fa-moon mr-2"></i> Ventas en Horarios
// //                 Inusuales (22hs a 07hs)
// //               </h3>
// //             </div>
// //             <div className="card-body p-0">
// //               <table className="table table-striped mb-0">
// //                 <thead>
// //                   <tr>
// //                     <th>ID Venta</th>
// //                     <th>Cajero</th>
// //                     <th>Caja</th>
// //                     <th>Monto</th>
// //                     <th>Hora Exacta</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {anomalias.horarios_extranos?.length > 0 ? (
// //                     anomalias.horarios_extranos.map((v, i) => (
// //                       <tr key={i}>
// //                         <td className="align-middle">
// //                           <Link
// //                             to={`/ventas/ver/${v.id}`}
// //                             className="text-bold text-info"
// //                             title="Auditar Ticket"
// //                           >
// //                             <i className="fas fa-search mr-1"></i>T-
// //                             {String(v.id).padStart(8, "0")}
// //                           </Link>
// //                         </td>
// //                         <td>{v.usuario_nombre}</td>
// //                         <td>Caja {v.caja_id}</td>
// //                         <td className="text-bold">
// //                           {formatMoney(v.precio_total)}
// //                         </td>
// //                         <td className="text-primary text-bold">
// //                           {new Date(v.created_at).toLocaleTimeString()}
// //                         </td>
// //                       </tr>
// //                     ))
// //                   ) : (
// //                     <tr>
// //                       <td colSpan="5" className="text-center py-3 text-muted">
// //                         Sin ventas nocturnas detectadas
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AuditorFugas;

// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../../services/api";
// import LoadingSpinner from "../../components/LoadingSpinner";

// const AuditorFugas = () => {
//   const [anomalias, setAnomalias] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const spanishLanguage = {
//     sProcessing: "Procesando...",
//     sLengthMenu: "Ver _MENU_",
//     sZeroRecords: "Sin anomalías",
//     sEmptyTable: "Sin registros sospechosos",
//     sInfo: "_START_ a _END_ de _TOTAL_",
//     sSearch: "Buscar:",
//     oPaginate: {
//       sFirst: "Primero",
//       sLast: "Último",
//       sNext: "»",
//       sPrevious: "«",
//     },
//   };

//   const cargarAnomalias = async () => {
//     try {
//       const res = await api.get("/auditoria/anomalias");
//       setAnomalias(res.data);
//     } catch (err) {
//       console.error("Error al cargar auditoría:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     cargarAnomalias();
//   }, []);

//   // 🚀 INICIALIZACIÓN DE LOS 5 DATATABLES 🚀
//   useEffect(() => {
//     if (!loading && anomalias) {
//       const tables = [
//         "#table-devoluciones",
//         "#table-arqueos",
//         "#table-descuentos",
//         "#table-anulaciones",
//         "#table-horarios",
//       ];

//       const timer = setTimeout(() => {
//         const $ = window.$;
//         tables.forEach((id) => {
//           if ($.fn.DataTable.isDataTable(id)) $(id).DataTable().destroy();
//           $(id).DataTable({
//             paging: true,
//             ordering: true,
//             info: true,
//             responsive: true,
//             autoWidth: false,
//             pageLength: 5, // 👈 5 filas por página
//             language: spanishLanguage,
//             dom: "rtip", // Escondemos el buscador para mantener la estética de las cards
//           });
//         });
//       }, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [loading, anomalias]);

//   const formatMoney = (val) =>
//     `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
//       minimumFractionDigits: 2,
//     })}`;

//   if (loading) return <LoadingSpinner />;
//   if (!anomalias)
//     return (
//       <div className="p-4 text-center">
//         <h5>Error al cargar el motor de auditoría.</h5>
//       </div>
//     );

//   return (
//     <div className="container-fluid pt-3 pb-5">
//       <h1 className="text-bold text-dark">
//         <i className="fas fa-user-secret text-danger mr-2"></i> Auditor de Fugas
//       </h1>
//       <p className="text-muted">
//         Análisis de comportamiento humano y detección de patrones inusuales.
//       </p>

//       {/* FILA 1: DEVOLUCIONES Y ARQUEOS */}
//       <div className="row">
//         <div className="col-md-6">
//           <div className="card card-outline card-danger shadow-sm h-100">
//             <div className="card-header">
//               <h3 className="card-title text-bold">Ráfagas de Devoluciones</h3>
//             </div>
//             <div className="card-body">
//               <table
//                 id="table-devoluciones"
//                 className="table table-sm table-striped table-hover"
//               >
//                 <thead className="bg-light">
//                   <tr>
//                     <th>Usuario / Caja</th>
//                     <th>Cant.</th>
//                     <th>Horario</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(anomalias.devoluciones_sospechosas || []).map((d, i) => (
//                     <tr key={i}>
//                       <td>
//                         <b>{d.usuario_nombre}</b> <br />{" "}
//                         <small>Caja {d.caja_id}</small>
//                       </td>
//                       <td className="text-center align-middle">
//                         <span className="badge badge-danger">
//                           {d.cantidad_devoluciones} en 1h
//                         </span>
//                       </td>
//                       <td className="text-danger align-middle small">
//                         {new Date(d.inicio_periodo).toLocaleTimeString()} -{" "}
//                         {new Date(d.fin_periodo).toLocaleTimeString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-6">
//           <div className="card card-outline card-warning shadow-sm h-100">
//             <div className="card-header">
//               <h3 className="card-title text-bold">Faltantes en Arqueos</h3>
//             </div>
//             <div className="card-body">
//               <table
//                 id="table-arqueos"
//                 className="table table-sm table-striped table-hover"
//               >
//                 <thead className="bg-light">
//                   <tr>
//                     <th>Usuario</th>
//                     <th>Diferencia</th>
//                     <th>Fecha Cierre</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(anomalias.arqueos_con_faltante || []).map((a, i) => (
//                     <tr key={i}>
//                       <td>
//                         <b>{a.usuario_nombre}</b> <br />{" "}
//                         <small>Caja {a.caja_id}</small>
//                       </td>
//                       {/* 🚀 EL MONTO AHORA SERÁ EL CALCULADO REAL 🚀 */}
//                       <td className="text-danger text-bold align-middle">
//                         {formatMoney(a.diferencia)}
//                       </td>
//                       <td className="align-middle small">
//                         {new Date(a.fecha_cierre).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FILA 2: DESCUENTOS Y ANULACIONES */}
//       <div className="row mt-4">
//         <div className="col-md-6">
//           <div className="card card-outline card-primary shadow-sm h-100">
//             <div className="card-header">
//               <h3 className="card-title text-bold">Ranking de Generosidad</h3>
//             </div>
//             <div className="card-body">
//               <table
//                 id="table-descuentos"
//                 className="table table-sm table-striped table-hover"
//               >
//                 <thead className="bg-light">
//                   <tr>
//                     <th>Cajero</th>
//                     <th className="text-center">Promedio Desc.</th>
//                     <th className="text-center">Tickets</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(anomalias.ranking_generosidad || []).map((u, i) => (
//                     <tr key={i}>
//                       <td className="align-middle">
//                         <b>{u.usuario_nombre}</b>
//                       </td>
//                       <td className="text-center align-middle">
//                         <span
//                           className={`text-bold ${
//                             parseFloat(u.promedio_descuento) > 10
//                               ? "text-danger"
//                               : "text-primary"
//                           }`}
//                         >
//                           {parseFloat(u.promedio_descuento).toFixed(1)}%
//                         </span>
//                       </td>
//                       <td className="text-center align-middle">
//                         {u.total_ventas_con_desc}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-6">
//           <div className="card card-outline card-dark shadow-sm h-100">
//             <div className="card-header">
//               <h3 className="card-title text-bold">
//                 Tickets Anulados (Borrados)
//               </h3>
//             </div>
//             <div className="card-body">
//               <table
//                 id="table-anulaciones"
//                 className="table table-sm table-striped table-hover"
//               >
//                 <thead className="bg-light">
//                   <tr>
//                     <th>Usuario</th>
//                     <th className="text-center">Anulaciones</th>
//                     <th className="text-center">Nivel</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(anomalias.tickets_anulados || []).map((a, i) => (
//                     <tr key={i}>
//                       <td className="align-middle">
//                         <b>{a.usuario_nombre}</b>
//                       </td>
//                       <td className="text-center text-bold h5 align-middle m-0">
//                         {a.cantidad_anulaciones}
//                       </td>
//                       <td className="text-center align-middle">
//                         <span
//                           className={`badge ${
//                             a.cantidad_anulaciones > 5
//                               ? "badge-danger"
//                               : "badge-warning"
//                           }`}
//                         >
//                           {a.cantidad_anulaciones > 5
//                             ? "CRÍTICO"
//                             : "SOSPECHOSO"}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FILA 3: HORARIOS INUSUALES */}
//       <div className="row mt-4">
//         <div className="col-12">
//           <div className="card card-outline card-info shadow-sm">
//             <div className="card-header">
//               <h3 className="card-title text-bold">
//                 Ventas en Horarios Inusuales (22hs a 07hs)
//               </h3>
//             </div>
//             <div className="card-body">
//               <table
//                 id="table-horarios"
//                 className="table table-striped table-hover table-sm"
//               >
//                 <thead className="bg-light">
//                   <tr>
//                     <th>ID Venta</th>
//                     <th>Cajero</th>
//                     <th>Caja</th>
//                     <th>Monto</th>
//                     <th>Hora Exacta</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(anomalias.horarios_extranos || []).map((v, i) => (
//                     <tr key={i}>
//                       <td className="align-middle">
//                         <Link
//                           to={`/ventas/ver/${v.id}`}
//                           className="text-bold text-info"
//                           title="Auditar Ticket"
//                         >
//                           <i className="fas fa-search mr-1"></i>T-
//                           {String(v.id).padStart(8, "0")}
//                         </Link>
//                       </td>
//                       <td className="align-middle">{v.usuario_nombre}</td>
//                       <td className="align-middle text-center">
//                         Caja {v.caja_id}
//                       </td>
//                       <td className="text-bold align-middle">
//                         {formatMoney(v.precio_total)}
//                       </td>
//                       <td className="text-primary text-bold align-middle">
//                         {new Date(v.created_at).toLocaleTimeString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuditorFugas;

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const AuditorFugas = () => {
  const [anomalias, setAnomalias] = useState(null);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Ver _MENU_",
    sZeroRecords: "Sin anomalías",
    sEmptyTable: "Sin registros sospechosos",
    sInfo: "_START_ a _END_ de _TOTAL_",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "»",
      sPrevious: "«",
    },
  };

  const cargarAnomalias = async () => {
    try {
      const res = await api.get("/auditoria/anomalias");
      setAnomalias(res.data);
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAnomalias();
  }, []);

  useEffect(() => {
    if (!loading && anomalias) {
      const tables = ["#t-dev", "#t-arq", "#t-des", "#t-anu", "#t-hor"];
      const timer = setTimeout(() => {
        const $ = window.$;
        tables.forEach((id) => {
          if ($.fn.DataTable.isDataTable(id)) $(id).DataTable().destroy();
          $(id).DataTable({
            paging: true,
            ordering: true,
            info: true,
            responsive: true,
            autoWidth: false,
            pageLength: 5,
            language: spanishLanguage,
            dom: "rtip",
          });
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, anomalias]);

  const formatMoney = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  if (loading) return <LoadingSpinner />;
  if (!anomalias)
    return (
      <div className="p-4 text-center">
        <h5>Error en el motor de auditoría.</h5>
      </div>
    );

  return (
    <div className="container-fluid pt-3 pb-5">
      <h1 className="text-bold text-dark">
        <i className="fas fa-user-secret text-danger mr-2"></i> Auditor de Fugas
      </h1>
      <p className="text-muted">
        Análisis de comportamiento humano y detección de patrones inusuales.
      </p>

      <div className="row">
        {/* RÁFAGAS DE DEVOLUCIONES */}
        <div className="col-md-6">
          <div className="card card-outline card-danger shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">Ráfagas de Devoluciones</h3>
            </div>
            <div className="card-body">
              <table
                id="t-dev"
                className="table table-sm table-striped table-hover"
              >
                <thead className="bg-light">
                  <tr>
                    <th>Usuario / Caja</th>
                    <th>Cant.</th>
                    <th>Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {(anomalias.devoluciones_sospechosas || []).map((d, i) => (
                    <tr key={i}>
                      <td>
                        <b>{d.usuario_nombre}</b> <br />{" "}
                        <small>Caja {d.caja_id}</small>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-danger">
                          {d.cantidad_devoluciones} en 1h
                        </span>
                      </td>
                      <td className="text-danger small">
                        {new Date(d.inicio_periodo).toLocaleTimeString()} -{" "}
                        {new Date(d.fin_periodo).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FALTANTES EN ARQUEOS */}
        <div className="col-md-6">
          <div className="card card-outline card-warning shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">Faltantes en Arqueos</h3>
            </div>
            <div className="card-body">
              <table
                id="t-arq"
                className="table table-sm table-striped table-hover"
              >
                <thead className="bg-light">
                  <tr>
                    <th>Usuario</th>
                    <th>Diferencia</th>
                    <th>Fecha Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {(anomalias.arqueos_con_faltante || []).map((a, i) => (
                    <tr key={i}>
                      <td>
                        <b>{a.usuario_nombre}</b> <br />{" "}
                        <small>Caja {a.caja_id}</small>
                      </td>
                      <td className="text-danger text-bold">
                        {formatMoney(a.diferencia)}
                      </td>
                      <td className="small">
                        {new Date(a.fecha_cierre).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        {/* RANKING DE GENEROSIDAD */}
        <div className="col-md-6">
          <div className="card card-outline card-primary shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">Ranking de Generosidad</h3>
            </div>
            <div className="card-body">
              <table
                id="t-des"
                className="table table-sm table-striped table-hover"
              >
                <thead className="bg-light">
                  <tr>
                    <th>Cajero</th>
                    <th>Promedio Desc.</th>
                    <th>Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  {(anomalias.ranking_generosidad || []).map((u, i) => (
                    <tr key={i}>
                      <td>
                        <b>{u.usuario_nombre}</b>
                      </td>
                      <td className="text-center">
                        <span
                          className={`text-bold ${
                            parseFloat(u.promedio_descuento) > 10
                              ? "text-danger"
                              : "text-primary"
                          }`}
                        >
                          {parseFloat(u.promedio_descuento).toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center">{u.total_ventas_con_desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TICKETS ANULADOS */}
        <div className="col-md-6">
          <div className="card card-outline card-dark shadow-sm h-100">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Tickets Anulados (Borrados)
              </h3>
            </div>
            <div className="card-body">
              <table
                id="t-anu"
                className="table table-sm table-striped table-hover"
              >
                <thead className="bg-light">
                  <tr>
                    <th>Usuario</th>
                    <th>Anulaciones</th>
                    <th>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {(anomalias.tickets_anulados || []).map((a, i) => (
                    <tr key={i}>
                      <td>
                        <b>{a.usuario_nombre}</b>
                      </td>
                      <td className="text-center text-bold h5">
                        {a.cantidad_anulaciones}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            a.cantidad_anulaciones > 5
                              ? "badge-danger"
                              : "badge-warning"
                          }`}
                        >
                          {a.cantidad_anulaciones > 5
                            ? "CRÍTICO"
                            : "SOSPECHOSO"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        {/* HORARIOS INUSUALES */}
        <div className="col-12">
          <div className="card card-outline card-info shadow-sm">
            <div className="card-header">
              <h3 className="card-title text-bold">
                Ventas en Horarios Inusuales (22hs a 07hs)
              </h3>
            </div>
            <div className="card-body">
              <table
                id="t-hor"
                className="table table-striped table-hover table-sm"
              >
                <thead className="bg-light">
                  <tr>
                    <th>ID Venta</th>
                    <th>Cajero</th>
                    <th>Caja</th>
                    <th>Monto</th>
                    <th>Hora Exacta</th>
                  </tr>
                </thead>
                <tbody>
                  {(anomalias.horarios_extranos || []).map((v, i) => (
                    <tr key={i}>
                      <td>
                        <Link
                          to={`/ventas/ver/${v.id}`}
                          className="text-bold text-info"
                        >
                          <i className="fas fa-search mr-1"></i>T-
                          {String(v.id).padStart(8, "0")}
                        </Link>
                      </td>
                      <td>{v.usuario_nombre}</td>
                      <td className="text-center">Caja {v.caja_id}</td>
                      <td className="text-bold">
                        {formatMoney(v.precio_total)}
                      </td>
                      <td className="text-primary text-bold">
                        {new Date(v.created_at).toLocaleTimeString()}
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
  );
};

export default AuditorFugas;
