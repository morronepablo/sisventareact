// // src/pages/compras/RecibirOrdenCompra.jsx
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import LoadingSpinner from "../../components/LoadingSpinner";
// import Swal from "sweetalert2";

// const RecibirOrdenCompra = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [orden, setOrden] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api
//       .get(`/ordenes-compra/${id}`)
//       .then((res) => {
//         const itemsEditados = res.data.items.map((it) => ({
//           ...it,
//           cantidad_llegó: it.cantidad_pedida,
//         }));
//         setOrden({ ...res.data, items: itemsEditados });
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [id]);

//   const handleConfirmar = async () => {
//     const result = await Swal.fire({
//       title: "¿Confirmar Recepción?",
//       text: "Esto guardará las cantidades recibidas para auditar al proveedor. Recordá registrar la factura en el módulo de Compras para afectar stock y caja.",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Sí, confirmar conteo",
//       cancelButtonText: "Cancelar",
//     });

//     if (result.isConfirmed) {
//       try {
//         await api.post(`/ordenes-compra/${id}/recibir`, { items: orden.items });
//         Swal.fire(
//           "¡Auditado!",
//           "Cantidades guardadas. La orden se marcó como recibida.",
//           "success"
//         );
//         navigate("/compras/ordenes");
//       } catch (error) {
//         Swal.fire("Error", "No se pudo procesar la auditoría", "error");
//       }
//     }
//   };

//   if (loading) return <LoadingSpinner />;
//   if (!orden)
//     return <div className="p-4 text-center">Orden no encontrada.</div>;

//   return (
//     <div className="content-header">
//       <div className="container-fluid">
//         <div className="row mb-2">
//           <div className="col-sm-6">
//             <h1>
//               <i className="fas fa-clipboard-check mr-2 text-primary"></i>
//               <b>Auditoría de Recepción</b>
//             </h1>
//           </div>
//           <div className="col-sm-6 text-right">
//             <button
//               className="btn btn-secondary shadow-sm"
//               onClick={() => navigate("/compras/ordenes")}
//             >
//               <i className="fas fa-reply mr-1"></i> Volver
//             </button>
//           </div>
//         </div>
//         <p className="text-muted">
//           Comparando pedido <b>OC-{String(id).padStart(6, "0")}</b> de{" "}
//           <b>{orden.proveedor_nombre}</b>
//         </p>
//         <hr />

//         <div className="row d-flex justify-content-center">
//           <div className="col-md-10">
//             <div className="card card-outline card-primary shadow-sm">
//               <div className="card-header">
//                 <h3 className="card-title text-bold">
//                   ¿Qué llegó en el camión?
//                 </h3>
//               </div>
//               <div className="card-body p-0">
//                 <table className="table table-striped table-hover m-0">
//                   <thead className="bg-light text-center">
//                     <tr>
//                       <th className="text-left">Producto</th>
//                       <th>Cantidad Pedida</th>
//                       <th style={{ width: "200px" }}>Cantidad Real Recibida</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {orden.items.map((it, index) => (
//                       <tr key={it.id}>
//                         <td className="align-middle">
//                           <b>{it.producto_nombre}</b>
//                         </td>
//                         <td className="text-center align-middle h5">
//                           <span className="badge badge-secondary">
//                             {it.cantidad_pedida}
//                           </span>
//                         </td>
//                         <td className="align-middle">
//                           <input
//                             type="number"
//                             className="form-control text-center font-weight-bold border-primary"
//                             style={{ fontSize: "1.2rem" }}
//                             value={it.cantidad_llegó}
//                             onChange={(e) => {
//                               const newItems = [...orden.items];
//                               newItems[index].cantidad_llegó = e.target.value;
//                               setOrden({ ...orden, items: newItems });
//                             }}
//                           />
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="card-footer bg-white border-top">
//                 <button
//                   className="btn btn-primary float-right btn-lg shadow"
//                   onClick={handleConfirmar}
//                 >
//                   <i className="fas fa-save mr-2"></i> FINALIZAR AUDITORÍA DE
//                   PEDIDO
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RecibirOrdenCompra;

// src/pages/compras/RecibirOrdenCompra.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const RecibirOrdenCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/ordenes-compra/${id}`)
      .then((res) => {
        // Inicializamos lo que "llegó" con lo que se "pidió" en la misma escala
        const itemsEditados = res.data.items.map((it) => ({
          ...it,
          cantidad_llegó: it.cantidad_pedida, // Walter cuenta "bultos" o "unidades" según se pidió
        }));
        setOrden({ ...res.data, items: itemsEditados });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleConfirmar = async () => {
    const result = await Swal.fire({
      title: "¿Confirmar Recepción?",
      text: "Esto guardará las cantidades recibidas. Recordá que la suma al stock real se hace al registrar la Factura en el módulo de Compras.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, finalizar conteo",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#007bff",
    });

    if (result.isConfirmed) {
      try {
        // Enviamos los ítems. El backend se encargará de convertir cantidad_llegó
        // a unidades base usando el factor_utilizado de la OC.
        await api.post(`/ordenes-compra/${id}/recibir`, { items: orden.items });

        Swal.fire({
          icon: "success",
          title: "¡Auditado!",
          text: "Cantidades guardadas. La orden se marcó como recibida.",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/compras/ordenes");
      } catch (error) {
        Swal.fire("Error", "No se pudo procesar la auditoría", "error");
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!orden)
    return (
      <div className="p-4 text-center h4 text-muted">Orden no encontrada.</div>
    );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="text-bold">
              <i className="fas fa-clipboard-check mr-2 text-primary"></i>
              Auditoría de Recepción
            </h1>
          </div>
          <div className="col-sm-6 text-right">
            <button
              className="btn btn-secondary shadow-sm"
              onClick={() => navigate("/compras/ordenes")}
            >
              <i className="fas fa-reply mr-1"></i> Volver
            </button>
          </div>
        </div>
        <p className="text-muted">
          Verificando mercadería de <b>OC-{String(id).padStart(6, "0")}</b> |
          Proveedor: <b>{orden.proveedor_nombre}</b>
        </p>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow">
              <div className="card-header border-0">
                <h3 className="card-title text-bold">
                  Carga de Mercadería Recibida
                </h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-striped table-hover m-0">
                  <thead className="bg-dark text-center text-xs">
                    <tr>
                      <th className="text-left" style={{ width: "40%" }}>
                        PRODUCTO / ESCALA
                      </th>
                      <th style={{ width: "20%" }}>PEDIDO</th>
                      <th style={{ width: "25%" }}>REAL RECIBIDO</th>
                      <th style={{ width: "15%" }}>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.items.map((it, index) => {
                      const diferencia =
                        parseFloat(it.cantidad_llegó) -
                        parseFloat(it.cantidad_pedida);

                      return (
                        <tr key={it.id}>
                          <td className="align-middle">
                            <div className="text-bold text-uppercase">
                              {it.producto_nombre}
                            </div>
                            {it.es_bulto === 1 ? (
                              <span className="badge badge-info">
                                <i className="fas fa-box mr-1"></i> BULTO (x
                                {parseFloat(it.factor_utilizado)})
                              </span>
                            ) : (
                              <span className="badge badge-light border">
                                UNIDAD BASE
                              </span>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <div className="h5 mb-0 text-bold">
                              {it.cantidad_pedida}
                            </div>
                            <small className="text-muted uppercase">
                              Soliitado
                            </small>
                          </td>
                          <td className="align-middle bg-light">
                            <div className="input-group">
                              <input
                                type="number"
                                className={`form-control form-control-lg text-center font-weight-bold ${diferencia < 0 ? "text-danger border-danger" : "text-success border-success"}`}
                                value={it.cantidad_llegó}
                                onChange={(e) => {
                                  const newItems = [...orden.items];
                                  newItems[index].cantidad_llegó =
                                    e.target.value;
                                  setOrden({ ...orden, items: newItems });
                                }}
                              />
                            </div>
                            {it.es_bulto === 1 && (
                              <div className="text-center mt-1 small text-muted">
                                Ingresarán:{" "}
                                <b>
                                  {parseFloat(it.cantidad_llegó || 0) *
                                    parseFloat(it.factor_utilizado)}
                                </b>{" "}
                                {it.unidad_base_nombre}
                              </div>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            {diferencia === 0 && (
                              <i className="fas fa-check-circle text-success fa-2x"></i>
                            )}
                            {diferencia < 0 && (
                              <i
                                className="fas fa-exclamation-circle text-danger fa-2x"
                                title="Faltante"
                              ></i>
                            )}
                            {diferencia > 0 && (
                              <i
                                className="fas fa-plus-circle text-primary fa-2x"
                                title="Sobrante"
                              ></i>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-white border-top">
                <button
                  className="btn btn-primary float-right btn-lg shadow-lg text-bold"
                  onClick={handleConfirmar}
                >
                  <i className="fas fa-save mr-2"></i> FINALIZAR AUDITORÍA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecibirOrdenCompra;
