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

  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tmpVentas, setTmpVentas] = useState([]);
  const [promos, setPromos] = useState([]);
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

  const calcularAhorroItem = (item) => {
    const promo = promos.find(
      (p) => p.producto_id === item.producto_id && p.estado === 1
    );
    if (!promo) return 0;
    const precio = parseFloat(item.precio_venta || 0);
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

  const ahorroTotalPromos = tmpVentas.reduce(
    (acc, it) => acc + calcularAhorroItem(it),
    0
  );
  const totalDescuentoManual =
    (subtotalBruto - ahorroTotalPromos) *
      (parseFloat(descPorcentaje || 0) / 100) +
    parseFloat(descMonto || 0);
  const totalFinal = Math.max(
    subtotalBruto - ahorroTotalPromos - totalDescuentoManual,
    0
  );
  const totalDolares = totalFinal / dolar;

  const totalPagado = Object.values(pagos).reduce(
    (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
    0
  );
  const montoSaldar = Math.max(totalFinal - totalPagado, 0);

  const otrosMediosSinBilletera =
    parseFloat(pagos.tarjeta || 0) +
    parseFloat(pagos.mercadopago || 0) +
    parseFloat(pagos.transferencia || 0);
  const saldoUsadoBilletera = parseFloat(pagos.billetera || 0);

  const efectivoNecesario = Math.max(
    totalFinal - otrosMediosSinBilletera - saldoUsadoBilletera,
    0
  );
  const vueltoFisico =
    parseFloat(pagos.efectivo) > efectivoNecesario
      ? parseFloat(pagos.efectivo) - efectivoNecesario
      : 0;

  const montoCargarBilletera = Math.max(
    parseFloat(pagos.efectivo || 0) - (totalFinal - otrosMediosSinBilletera),
    0
  );

  const saldoNetoMostrado = Math.max(
    montoCargarBilletera - saldoUsadoBilletera,
    0
  );

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
            .catch(() => ({ compra: 1499.5 })),
          api.get("/promociones").catch(() => ({ data: [] })),
        ]);
      setProductos(resP.data);
      setClientes(resCl.data);
      setCombos(resCo.data);
      setTmpVentas(resTmp.data);
      setDolar(resDolar.compra || 1499.5);
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

  // const handleConfirmarVenta = async () => {
  //   if (!esCtaCte && totalPagado < totalFinal)
  //     return Swal.fire("Error", "Monto insuficiente", "error");
  //   if (parseFloat(pagos.billetera) > parseFloat(clienteSel.saldo_billetera))
  //     return Swal.fire("Error", "Saldo insuficiente en billetera", "error");

  //   try {
  //     const pagosSaneados = {
  //       ...pagos,
  //       efectivo: Math.max(parseFloat(pagos.efectivo || 0) - vueltoFisico, 0),
  //     };

  //     const payload = {
  //       cliente_id: clienteSel.id,
  //       fecha,
  //       precio_total: totalFinal,
  //       pagos: { ...pagosSaneados, pago_billetera: pagos.billetera },
  //       es_cuenta_corriente: esCtaCte,
  //       usuario_id: user.id,
  //       empresa_id: user.empresa_id,
  //       items: tmpVentas,
  //       descuento_porcentaje: descPorcentaje,
  //       descuento_monto: descMonto,
  //       puntos_canjeados:
  //         Number(descMonto) === Number(clienteSel.puntos)
  //           ? clienteSel.puntos
  //           : 0,
  //       cargar_vuelto_billetera: vueltoABilletera,
  //       vuelto_monto: montoCargarBilletera,
  //     };

  //     const res = await api.post("/ventas", payload);

  //     if (res.data.success) {
  //       // 1. Cerramos el modal inmediatamente para mejorar la UX
  //       window.$("#modal-pagos").modal("hide");

  //       // 2. ESPERA DE SEGURIDAD (700ms)
  //       // Damos tiempo al servidor para que procese el descuento de stock y actualización de deudas
  //       await new Promise((resolve) => setTimeout(resolve, 700));

  //       // 3. ACTUALIZAR NAVBAR (Notificaciones de stock, deudas, etc.)
  //       if (refreshAll) {
  //         await refreshAll();
  //       }

  //       // 4. LÓGICA DE DESCARGA DE TICKET
  //       if (res.data.venta_id) {
  //         try {
  //           const response = await api.get(
  //             `/ventas/ticket/${res.data.venta_id}`,
  //             { responseType: "blob" }
  //           );
  //           const url = window.URL.createObjectURL(new Blob([response.data]));
  //           const link = document.createElement("a");
  //           link.href = url;
  //           link.setAttribute("download", `ticket_${res.data.venta_id}.pdf`);
  //           document.body.appendChild(link);
  //           link.click();
  //           link.parentNode.removeChild(link);
  //           window.URL.revokeObjectURL(url);
  //         } catch (error) {
  //           console.error("Error descargando el ticket", error);
  //         }
  //       }

  //       // 5. MENSAJE DE ÉXITO
  //       await Swal.fire({
  //         position: "center",
  //         icon: "success",
  //         title: "¡Venta Registrada!",
  //         text: "El stock y las notificaciones han sido actualizados.",
  //         showConfirmButton: false,
  //         timer: 2000,
  //       });

  //       // 6. RESETEO DE ESTADOS
  //       setPagos({
  //         efectivo: 0,
  //         tarjeta: 0,
  //         mercadopago: 0,
  //         transferencia: 0,
  //         billetera: 0,
  //       });
  //       setClienteSel({
  //         id: 1,
  //         nombre_cliente: "Consumidor Final",
  //         cuil_codigo: "00000000000",
  //         puntos: 0,
  //         saldo_billetera: 0,
  //       });
  //       setDescPorcentaje(0);
  //       setDescMonto(0);
  //       setCodigo("");
  //       setCantidad(1);
  //       setEsCtaCte(false);
  //       setVueltoABilletera(false);

  //       // 7. REFRESCAR DATOS DE LA PÁGINA ACTUAL
  //       fetchData();
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     Swal.fire("Error", "Fallo al registrar la venta", "error");
  //   }
  // };

  const handleConfirmarVenta = async () => {
    if (!esCtaCte && totalPagado < totalFinal)
      return Swal.fire("Error", "Monto insuficiente", "error");
    if (parseFloat(pagos.billetera) > parseFloat(clienteSel.saldo_billetera))
      return Swal.fire("Error", "Saldo insuficiente en billetera", "error");

    // 1. Mostrar Spinner de "Procesando"
    Swal.fire({
      title: "Procesando Venta...",
      text: "Estamos registrando la operación y actualizando el stock.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Esto activa el spinner de SweetAlert2
      },
    });

    try {
      const pagosSaneados = {
        ...pagos,
        efectivo: Math.max(parseFloat(pagos.efectivo || 0) - vueltoFisico, 0),
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
        vuelto_monto: montoCargarBilletera,
      };

      const res = await api.post("/ventas", payload);

      if (res.data.success) {
        // 2. Cerramos el modal de pagos
        window.$("#modal-pagos").modal("hide");

        // 3. ESPERA DE SEGURIDAD (700ms) para que impacte en DB
        await new Promise((resolve) => setTimeout(resolve, 700));

        // 4. ACTUALIZAR NAVBAR (Ahora será instantáneo con el cambio en el dropdown)
        if (refreshAll) {
          await refreshAll();
        }

        // 5. LÓGICA DE DESCARGA DE TICKET
        if (res.data.venta_id) {
          try {
            const response = await api.get(
              `/ventas/ticket/${res.data.venta_id}`,
              {
                responseType: "blob",
              }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `ticket_${res.data.venta_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Error descargando el ticket", error);
          }
        }

        // 6. MENSAJE DE ÉXITO (Esto reemplaza automáticamente al spinner de carga)
        await Swal.fire({
          position: "center",
          icon: "success",
          title: "¡Venta Registrada!",
          text: "La operación finalizó correctamente.",
          showConfirmButton: false,
          timer: 2000,
        });

        // 7. RESETEO DE ESTADOS
        setPagos({
          efectivo: 0,
          tarjeta: 0,
          mercadopago: 0,
          transferencia: 0,
          billetera: 0,
        });
        setClienteSel({
          id: 1,
          nombre_cliente: "Consumidor Final",
          cuil_codigo: "00000000000",
          puntos: 0,
          saldo_billetera: 0,
        });
        setDescPorcentaje(0);
        setDescMonto(0);
        setCodigo("");
        setCantidad(1);
        setEsCtaCte(false);
        setVueltoABilletera(false);

        // 8. REFRESCAR TABLA ACTUAL
        fetchData();
      }
    } catch (e) {
      console.error(e);
      // 9. Si hay error, cerramos el spinner y mostramos el error
      Swal.fire("Error", "Fallo al registrar la venta", "error");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F5") {
        e.preventDefault();
        if (tmpVentas.length > 0) {
          const m = document.getElementById("modal-pagos");
          if (m && !m.classList.contains("show"))
            window.$("#modal-pagos").modal("show");
          else handleConfirmarVenta();
        }
      }
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tmpVentas, totalPagado, totalFinal, vueltoFisico]);

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
            <span className="badge badge-success p-2 ml-1">F12: Efectivo</span>
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-md-8">
            <div className="card card-outline card-primary shadow-sm">
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
                        onKeyDown={(e) => e.key === "Enter" && addItem(codigo)}
                        autoFocus
                        placeholder="Código o nombre..."
                      />
                      <div className="input-group-append">
                        <button
                          className="btn btn-primary"
                          data-toggle="modal"
                          data-target="#modal-productos"
                        >
                          <i className="fas fa-search"></i>
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => navigate("/productos/crear")}
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
                        const ahorro = calcularAhorroItem(it);
                        const precioBase = parseFloat(
                          it.precio_venta || it.combo_precio
                        );
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
                                    api
                                      .put(`/ventas/tmp/${it.id}`, {
                                        cantidad: parseFloat(it.cantidad) - 1,
                                      })
                                      .then(fetchData)
                                  }
                                >
                                  -
                                </button>
                                <span className="px-2 font-weight-bold align-self-center">
                                  {it.cantidad}
                                </span>
                                <button
                                  className="btn btn-outline-secondary btn-xs"
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
                            </td>
                            <td className="align-middle">
                              {it.nombre || it.combo_nombre}
                              {ahorro > 0 && (
                                <span className="badge badge-success ml-2">
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
                              {ahorro > 0 ? (
                                <div>
                                  <del className="text-muted small">
                                    {formatMoney(it.cantidad * precioBase)}
                                  </del>
                                  <br />
                                  <span>
                                    {formatMoney(
                                      it.cantidad * precioBase - ahorro
                                    )}
                                  </span>
                                </div>
                              ) : (
                                formatMoney(it.cantidad * precioBase)
                              )}
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
                    </tbody>
                    <tfoot className="bg-light">
                      <tr className="text-bold">
                        <td colSpan="2" className="text-right">
                          Total Cant.
                        </td>
                        <td className="text-center text-primary">
                          {totalCantidad}
                        </td>
                        <td colSpan="3" className="text-right">
                          Subtotal
                        </td>
                        <td className="text-right text-primary">
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

                {clienteSel.id !== 1 &&
                  parseFloat(clienteSel.saldo_billetera) > 0 && (
                    <div className="alert alert-success p-2 text-center mb-2 shadow-sm border-0 animate__animated animate__fadeIn">
                      <i className="fas fa-wallet mr-1"></i> Billetera Virtual:{" "}
                      <b>{formatMoney(clienteSel.saldo_billetera)}</b>
                    </div>
                  )}

                {clienteSel.id !== 1 && (
                  <div
                    className="alert alert-info p-2 text-center mb-2"
                    style={{ border: "1px dashed #007bff" }}
                  >
                    <i className="fas fa-star text-warning"></i> Puntos:{" "}
                    <b>{clienteSel.puntos || 0}</b> (
                    {formatMoney(clienteSel.puntos)})
                    {clienteSel.puntos > 0 && (
                      <button
                        className="btn btn-xs btn-primary ml-2"
                        onClick={() => setDescMonto(clienteSel.puntos)}
                      >
                        Canjear
                      </button>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <small>Precio Total a Pagar</small>
                  </label>
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold text-white bg-success"
                    style={{ fontSize: "2rem", height: "auto" }}
                    value={formatMoney(totalFinal)}
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
                      <small>Desc. $</small>
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
                    <small>Precio Dólar</small>
                  </label>
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold bg-info text-white"
                    value={formatMoney(dolar)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>
                    <small>Precio Total USD</small>
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

                <div
                  className={`p-2 text-right border rounded mb-3 text-white font-weight-bold ${
                    deudaInfo.deuda_total > 0 ? "bg-danger" : "bg-success"
                  }`}
                >
                  <small>CTA CTE DEL CLIENTE</small>
                  <div className="h6 m-0">
                    {formatMoney(deudaInfo.deuda_total)} ({deudaInfo.dias_mora}{" "}
                    días mora)
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
                        id={m === "efectivo" ? "pago-efectivo" : ""}
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
                                clienteSel.saldo_billetera
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
              {vueltoFisico > 0 && clienteSel.id !== 1 && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center shadow-sm border-0 animate__animated animate__bounceIn mb-3">
                  <div>
                    <i className="fas fa-coins mr-2"></i>¿Cargar vuelto de{" "}
                    <b>{formatMoney(vueltoFisico)}</b> a la billetera?
                  </div>
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="switchVuelto"
                      checked={vueltoABilletera}
                      onChange={(e) => setVueltoABilletera(e.target.checked)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="switchVuelto"
                    ></label>
                  </div>
                </div>
              )}

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
                    ? "Saldo Neto a Cargar"
                    : "Vuelto (Efectivo)"}
                </label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className={`form-control text-right font-weight-bold bg-light ${
                      vueltoABilletera ? "text-primary" : "text-success"
                    }`}
                    style={{ fontSize: "1.4rem" }}
                    value={
                      vueltoABilletera
                        ? formatMoney(saldoNetoMostrado)
                        : formatMoney(vueltoFisico)
                    }
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
                            width="40"
                            height="40"
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
                        {formatMoney(parseFloat(p.precio_venta))}
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-primary">Producto</span>
                      </td>
                    </tr>
                  ))}
                  {/* 🚀 RESTAURADO: FILAS DE COMBOS EN EL BUSCADOR 🚀 */}
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
                        {formatMoney(parseFloat(c.precio_venta))}
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
                    <th>Billetera</th>
                    <th>Puntos</th>
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
                            api
                              .get(`/ventas/deuda-cliente/${cl.id}`)
                              .then((r) => setDeudaInfo(r.data));
                            window.$("#modal-clientes").modal("hide");
                          }}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </td>
                      <td className="text-center">{cl.cuil_codigo}</td>
                      <td>{cl.nombre_cliente}</td>
                      <td className="text-right text-success text-bold">
                        {formatMoney(cl.saldo_billetera)}
                      </td>
                      <td className="text-center">
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
