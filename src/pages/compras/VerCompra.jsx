// // src/pages/compras/VerCompra.jsx
// /* eslint-disable no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import LoadingSpinner from "../../components/LoadingSpinner";

// const VerCompra = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [compra, setCompra] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchCompra = async () => {
//     try {
//       const res = await api.get(`/compras/${id}`);
//       setCompra(res.data);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error al cargar la compra", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCompra();
//   }, [id]);

//   if (loading) return <LoadingSpinner />;
//   if (!compra)
//     return (
//       <div className="p-4 text-center">
//         <h4>Compra no encontrada.</h4>
//       </div>
//     );

//   // --- CÁLCULOS SEGUROS PARA EL FOOTER ---
//   const totalCantidad = compra.detalles?.reduce(
//     (acc, d) => acc + Number(d.cantidad || 0),
//     0
//   );

//   const totalCompraCalculado = compra.detalles?.reduce(
//     (acc, d) => acc + Number(d.cantidad || 0) * Number(d.precio_compra || 0),
//     0
//   );

//   const formatMoney = (val) =>
//     new Intl.NumberFormat("es-AR", {
//       style: "currency",
//       currency: "ARS",
//       minimumFractionDigits: 2,
//     }).format(val || 0);

//   return (
//     <div className="content-header">
//       <div className="container-fluid">
//         <div className="row mb-2">
//           <div className="col-sm-6">
//             <h1>
//               <b>Detalle de compra</b>
//             </h1>
//           </div>
//         </div>
//         <hr />
//       </div>

//       <div className="container-fluid">
//         <div className="card card-outline card-info shadow-sm">
//           <div className="card-header">
//             <h3 className="card-title text-bold">Datos registrados</h3>
//           </div>
//           <div className="card-body">
//             <div className="row">
//               {/* TABLA DE PRODUCTOS */}
//               <div className="col-md-8">
//                 <div className="table-responsive">
//                   <table className="table table-striped table-bordered table-hover table-sm">
//                     <thead className="thead-dark text-center">
//                       <tr>
//                         <th>Nro.</th>
//                         <th>Código</th>
//                         <th>Cantidad</th>
//                         <th>Producto</th>
//                         <th>Costo</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {compra.detalles?.map((detalle, index) => {
//                         const costo = Number(detalle.precio_compra || 0);
//                         const cant = Number(detalle.cantidad || 0);
//                         return (
//                           <tr key={detalle.id || index}>
//                             <td className="text-center align-middle">
//                               {index + 1}
//                             </td>
//                             <td className="text-center align-middle">
//                               {detalle.producto_codigo}
//                             </td>
//                             <td className="text-center align-middle">{cant}</td>
//                             <td className="align-middle">
//                               {detalle.producto_nombre}
//                             </td>
//                             <td className="text-right align-middle">
//                               {formatMoney(costo)}
//                             </td>
//                             <td className="text-right align-middle font-weight-bold">
//                               {formatMoney(cant * costo)}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                     <tfoot className="bg-light text-bold">
//                       <tr>
//                         <td colSpan="2" className="text-right">
//                           Total Cantidad
//                         </td>
//                         <td className="text-center text-primary">
//                           {totalCantidad}
//                         </td>
//                         <td colSpan="2" className="text-right">
//                           Total Compra
//                         </td>
//                         <td className="text-right text-primary">
//                           {formatMoney(compra.precio_total)}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>

//               {/* DATOS DE CABECERA */}
//               <div className="col-md-4">
//                 <div className="form-group">
//                   <label className="text-muted">
//                     <small>Proveedor</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control bg-light font-weight-bold"
//                     value={compra.proveedor_nombre || "N/A"}
//                     disabled
//                   />
//                 </div>
//                 <hr />
//                 <div className="row">
//                   <div className="col-md-5">
//                     <div className="form-group">
//                       <label className="text-muted">
//                         <small>Fecha</small>
//                       </label>
//                       <input
//                         type="text"
//                         className="form-control bg-light text-center"
//                         value={new Date(compra.fecha).toLocaleDateString(
//                           "es-AR"
//                         )}
//                         disabled
//                       />
//                     </div>
//                   </div>
//                   <div className="col-md-7">
//                     <div className="form-group">
//                       <label className="text-muted">
//                         <small>Comprobante</small>
//                       </label>
//                       <input
//                         type="text"
//                         className="form-control bg-light text-center"
//                         value={compra.comprobante}
//                         disabled
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label className="text-muted">
//                     <small>Precio Total *</small>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control text-right bg-warning font-weight-bold"
//                     style={{ fontSize: "1.3rem" }}
//                     value={formatMoney(compra.precio_total)}
//                     disabled
//                   />
//                 </div>
//               </div>
//             </div>

//             <hr />
//             <div className="row">
//               <div className="col-md-12">
//                 <button
//                   className="btn btn-secondary btn-sm shadow-sm"
//                   onClick={() => navigate("/compras/listado")}
//                 >
//                   <i className="fas fa-reply mr-1"></i> Volver al listado
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerCompra;

// src/pages/compras/VerCompra.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompra = async () => {
    try {
      const res = await api.get(`/compras/${id}`);
      setCompra(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar la compra", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompra();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!compra)
    return (
      <div className="p-4 text-center">
        <h4>Compra no encontrada.</h4>
      </div>
    );

  // --- CÁLCULOS SINCERADOS ---
  // Sumamos el total de unidades base que entraron al stock
  const totalUnidadesBase = compra.detalles?.reduce(
    (acc, d) => acc + Number(d.cantidad_unidades_base || d.cantidad || 0),
    0,
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="text-bold">
              <i className="fas fa-receipt text-info mr-2"></i>
              Detalle de compra
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-info shadow-lg">
          <div className="card-header border-0">
            <h3 className="card-title text-bold">
              Información de Factura Registrada
            </h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* TABLA DE PRODUCTOS (LÓGICA HÍBRIDA) */}
              <div className="col-md-8">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered table-hover table-sm">
                    <thead className="thead-dark text-center text-xs">
                      <tr>
                        <th>Nro.</th>
                        <th>Código</th>
                        <th style={{ width: "15%" }}>Cantidad</th>
                        <th>Producto / Escala</th>
                        <th>Costo Unit. Base</th>
                        <th>Subtotal Fila</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {compra.detalles?.map((detalle, index) => {
                        const costoBase = Number(detalle.precio_compra || 0);
                        const cantPedida = Number(detalle.cantidad || 0);
                        const factor = Number(detalle.factor_utilizado || 1);

                        // Si es bulto, el subtotal es (cantidad * factor * costoBase)
                        const subtotalFila =
                          detalle.es_bulto === 1
                            ? cantPedida * factor * costoBase
                            : cantPedida * costoBase;

                        return (
                          <tr key={detalle.id || index}>
                            <td className="text-center align-middle">
                              {index + 1}
                            </td>
                            <td className="text-center align-middle small">
                              {detalle.producto_codigo}
                            </td>
                            <td className="text-center align-middle font-weight-bold h6">
                              {cantPedida}
                              <small className="ml-1 text-muted text-uppercase">
                                {detalle.es_bulto === 1
                                  ? detalle.unidad_bulto_nombre || "Bultos"
                                  : detalle.unidad_base_nombre || "Unid."}
                              </small>
                            </td>
                            <td className="align-middle">
                              <div className="text-bold">
                                {detalle.producto_nombre}
                              </div>
                              {detalle.es_bulto === 1 && (
                                <div className="text-info small font-weight-bold">
                                  <i className="fas fa-link mr-1"></i>
                                  Equivale a: {
                                    detalle.cantidad_unidades_base
                                  }{" "}
                                  {detalle.unidad_base_nombre}
                                </div>
                              )}
                            </td>
                            <td className="text-right align-middle text-muted">
                              {formatMoney(costoBase)}
                            </td>
                            <td className="text-right align-middle font-weight-bold text-primary">
                              {formatMoney(subtotalFila)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-light">
                      <tr className="text-bold">
                        <td colSpan="2" className="text-right uppercase">
                          Volumen Base Total:
                        </td>
                        <td
                          className="text-center text-info"
                          style={{ fontSize: "1rem" }}
                        >
                          {totalUnidadesBase}
                        </td>
                        <td colSpan="2" className="text-right uppercase">
                          Total Facturado:
                        </td>
                        <td
                          className="text-right text-success"
                          style={{ fontSize: "1.1rem" }}
                        >
                          {formatMoney(compra.precio_total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* DATOS DE CABECERA */}
              <div className="col-md-4">
                <div className="card bg-light shadow-none border">
                  <div className="card-body p-3">
                    <label className="text-muted small uppercase mb-1">
                      Proveedor
                    </label>
                    <div className="h5 text-bold text-primary mb-3">
                      {compra.proveedor_nombre || "N/A"}
                    </div>

                    <div className="row">
                      <div className="col-6">
                        <label className="text-muted small uppercase mb-1">
                          Fecha
                        </label>
                        <div className="text-bold">
                          {new Date(compra.fecha).toLocaleDateString("es-AR")}
                        </div>
                      </div>
                      <div className="col-6 text-right">
                        <label className="text-muted small uppercase mb-1">
                          Comprobante
                        </label>
                        <div className="text-bold">{compra.comprobante}</div>
                      </div>
                    </div>

                    <hr />

                    <label className="text-muted small uppercase mb-1">
                      Monto Total Abonado
                    </label>
                    <div className="bg-warning p-2 rounded text-center shadow-sm">
                      <span className="h3 text-bold mb-0">
                        {formatMoney(compra.precio_total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-block shadow-sm mt-3"
                  onClick={() => navigate("/compras/listado")}
                >
                  <i className="fas fa-reply mr-2"></i> VOLVER AL LISTADO
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCompra;
