// src/pages/ventas/CrearVenta.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
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

  // Refs para evitar recreación de DataTables
  const dataTablesInitialized = useRef(false);
  const tableRefs = useRef({
    productos: false,
    clientes: false,
    combos: false,
  });

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
  const subtotalConPromos = subtotalBruto - ahorroTotalPromos;
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
      setLoading(true);
      const [resP, resCl, resTmp, resDolar, resPromos] = await Promise.all([
        api.get("/productos"),
        api.get("/clientes"),
        api.get(`/ventas/tmp?usuario_id=${user.id}`),
        fetch("https://dolarapi.com/v1/dolares/bolsa")
          .then((r) => r.json())
          .catch(() => ({ venta: 1476.1 })),
        api.get("/promociones").catch(() => ({ data: [] })),
      ]);

      // Cargar combos por separado para evitar errores
      let combosData = [];
      try {
        const resCo = await api.get("/combos");
        combosData = resCo.data || [];
      } catch (comboError) {
        console.warn("No se pudieron cargar combos:", comboError.message);
        combosData = [];
      }

      setProductos(resP.data);
      setClientes(resCl.data);
      setCombos(combosData);
      setTmpVentas(resTmp.data);
      setDolar(resDolar.venta || 1476.1);
      setPromos(resPromos.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
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

  // --- 🚀 FUNCIÓN OPTIMIZADA PARA EL SWITCH DE ESCALA SIN RECARGAR TODO ---
  const toggleBulto = async (id, valorActual, item) => {
    try {
      const nuevoValor = valorActual === 1 ? 0 : 1;

      // Validar si estamos intentando cambiar a Bulto
      if (nuevoValor === 1) {
        const factor = parseFloat(item.factor_utilizado || 1);
        const cantidadActual = parseFloat(item.cantidad);
        const stockDisponible = parseFloat(item.producto_stock || 0);

        // Calcular cuántas unidades necesitamos para el bulto
        const unidadesNecesarias = cantidadActual * factor;

        // Si no hay suficiente stock, mostrar error
        if (unidadesNecesarias > stockDisponible) {
          Swal.fire({
            icon: "warning",
            title: "Stock insuficiente",
            html: `No hay suficiente stock para cambiar a Bulto.<br>
                   Necesitas ${unidadesNecesarias} unidades, pero solo hay ${stockDisponible} disponibles.<br>
                   Stock requerido: ${cantidadActual} bulto(s) × ${factor} = ${unidadesNecesarias} unidades`,
            confirmButtonText: "Entendido",
          });
          return; // No cambiar
        }
      }

      await api.put(`/ventas/tmp/bulto/${id}`, { es_bulto: nuevoValor });

      // Solo actualiza el estado local sin recargar todo
      setTmpVentas((prev) =>
        prev.map((it) => (it.id === id ? { ...it, es_bulto: nuevoValor } : it)),
      );
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo cambiar la escala", "error");
    }
  };

  const handleConfirmarVenta = async () => {
    // 🔴 VALIDACIÓN: No permitir cuenta corriente para Consumidor Final
    if (esCtaCte && clienteSel.id === 1) {
      Swal.fire({
        icon: "error",
        title: "Operación no permitida",
        text: 'No se puede crear una venta en cuenta corriente para "Consumidor Final".',
        confirmButtonText: "Entendido",
      });
      return;
    }

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

        // Resetear solo lo necesario
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
        setDeudaInfo({ deuda_total: 0, dias_mora: 0 });
        setDescPorcentaje(0);
        setDescMonto(0);
        setCodigo("");
        setCantidad(1);
        setEsCtaCte(false);
        setVueltoABilletera(false);

        // Limpiar temporal de ventas localmente
        setTmpVentas([]);
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Fallo al registrar la venta", "error");
    }
  };

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

  // 🚀 FUNCIÓN OPTIMIZADA PARA AGREGAR ITEMS SIN RECARGAR TODO
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

        // En lugar de recargar TODO, actualiza solo el temporal de ventas
        const refreshTmpOnly = async () => {
          try {
            const resTmp = await api.get(`/ventas/tmp?usuario_id=${user.id}`);
            setTmpVentas(resTmp.data);
          } catch (error) {
            console.error("Error al actualizar tmpVentas:", error);
          }
        };

        await refreshTmpOnly();
      } else {
        Swal.fire("Error", res.data.message, "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo agregar el ítem", "error");
    }
  };

  // 🚀 FUNCIÓN PARA ACTUALIZAR CANTIDAD SIN RECARGAR TODO
  const updateCantidad = async (id, nuevaCantidad, item) => {
    try {
      // Actualizar estado local inmediatamente para respuesta instantánea
      setTmpVentas((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, cantidad: nuevaCantidad } : it,
        ),
      );

      // Llamar a API en segundo plano
      await api.put(`/ventas/tmp/${id}`, { cantidad: nuevaCantidad });
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      // Revertir cambio si falla la API
      setTmpVentas((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, cantidad: item.cantidad } : it,
        ),
      );
      Swal.fire("Error", "No se pudo actualizar la cantidad", "error");
    }
  };

  // 🚀 FUNCIÓN PARA ELIMINAR ITEM SIN RECARGAR TODO
  const deleteItem = async (id) => {
    try {
      // Guardar el item antes de eliminar por si hay que revertir
      const itemToDelete = tmpVentas.find((it) => it.id === id);

      // Eliminar inmediatamente del estado local
      setTmpVentas((prev) => prev.filter((it) => it.id !== id));

      // Llamar a API en segundo plano
      await api.delete(`/ventas/tmp/${id}`);
    } catch (error) {
      console.error("Error al eliminar item:", error);
      Swal.fire("Error", "No se pudo eliminar el ítem", "error");
    }
  };

  useEffect(() => {
    if (tmpVentas.length > 0) {
      const timer = setTimeout(() => {
        const container = document.getElementById("productos-scroll-container");
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100); // Reducido de 200 a 100ms

      return () => clearTimeout(timer);
    }
  }, [tmpVentas.length]);

  const handleGuardarNuevoCliente = async () => {
    try {
      const res = await api.post("/clientes", {
        ...nuevoCliente,
        empresa_id: user.empresa_id,
      });
      if (res.data.id) {
        window.$("#modal-crear-cliente").modal("hide");
        // Solo actualizar clientes
        try {
          const resCl = await api.get("/clientes");
          setClientes(resCl.data);
        } catch (error) {
          console.error("Error al actualizar clientes:", error);
        }

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

  // 🚀 INICIALIZACIÓN DE DATATABLES OPTIMIZADA
  useEffect(() => {
    if (!loading && !dataTablesInitialized.current) {
      // Inicializar DataTables solo una vez
      const initDataTables = () => {
        const tableConfig = {
          paging: true,
          pageLength: 5,
          language: spanishLanguage,
          autoWidth: false,
          destroy: false,
          retrieve: true,
        };

        // Inicializar solo las tablas que no están ya inicializadas
        if (!tableRefs.current.productos && window.$("#prod-table").length) {
          if (window.$.fn.DataTable.isDataTable("#prod-table")) {
            window.$("#prod-table").DataTable().destroy();
          }
          window.$("#prod-table").DataTable(tableConfig);
          tableRefs.current.productos = true;
        }

        if (!tableRefs.current.clientes && window.$("#clie-table").length) {
          if (window.$.fn.DataTable.isDataTable("#clie-table")) {
            window.$("#clie-table").DataTable().destroy();
          }
          window.$("#clie-table").DataTable(tableConfig);
          tableRefs.current.clientes = true;
        }

        if (!tableRefs.current.combos && window.$("#combos-table").length) {
          if (window.$.fn.DataTable.isDataTable("#combos-table")) {
            window.$("#combos-table").DataTable().destroy();
          }
          window.$("#combos-table").DataTable(tableConfig);
          tableRefs.current.combos = true;
        }

        dataTablesInitialized.current = true;
      };

      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(initDataTables, 100);
    }
  }, [loading, spanishLanguage]);

  // 🚀 RESETEAR DATATABLES CUANDO SE CIERRAN LOS MODALES
  useEffect(() => {
    const handleModalHidden = (event) => {
      if (
        event.target.id === "modal-productos" ||
        event.target.id === "modal-clientes"
      ) {
        // No destruir las tablas, solo actualizar si es necesario
        setTimeout(() => {
          if (window.$.fn.DataTable.isDataTable("#prod-table")) {
            window.$("#prod-table").DataTable().columns.adjust();
          }
          if (window.$.fn.DataTable.isDataTable("#clie-table")) {
            window.$("#clie-table").DataTable().columns.adjust();
          }
          if (window.$.fn.DataTable.isDataTable("#combos-table")) {
            window.$("#combos-table").DataTable().columns.adjust();
          }
        }, 50);
      }
    };

    // Usar jQuery para manejar eventos de Bootstrap modal
    window
      .$("#modal-productos, #modal-clientes")
      .on("hidden.bs.modal", handleModalHidden);

    return () => {
      window
        .$("#modal-productos, #modal-clientes")
        .off("hidden.bs.modal", handleModalHidden);
    };
  }, []);

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
                <div
                  className="mt-3"
                  style={{
                    maxHeight: "560px",
                    overflow: "hidden",
                    backgroundColor: "#1a1d23",
                    borderRadius: "8px",
                    border: "1px solid #2d3748",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* HEADER FIJO - Estilo similar al footer */}
                  <div
                    style={{
                      backgroundColor: "#1f2937",
                      borderBottom: "2px solid #374151",
                      padding: "12px 10px",
                      flexShrink: 0,
                    }}
                  >
                    <div className="d-flex align-items-center text-center">
                      <div
                        style={{
                          width: "5%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Nro.
                      </div>
                      <div
                        style={{
                          width: "14%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Código
                      </div>
                      <div
                        style={{
                          width: "16%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Cantidad / Escala
                      </div>
                      <div
                        style={{
                          width: "30%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Producto/Combo
                      </div>
                      <div
                        style={{
                          width: "8%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Unidad
                      </div>
                      <div
                        style={{
                          width: "12%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Precio
                      </div>
                      <div
                        style={{
                          width: "10%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Total
                      </div>
                      <div
                        style={{
                          width: "5%",
                          color: "#ffc107",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Acción
                      </div>
                    </div>
                  </div>

                  {/* ÁREA DE SCROLL para las filas */}
                  <div
                    id="productos-scroll-container"
                    className="productos-scroll"
                    style={{
                      flex: "1",
                      overflowY: "auto",
                      backgroundColor: "#1a1d23",
                    }}
                  >
                    {/* Estilos personalizados para el scrollbar */}
                    <style jsx>{`
                      .productos-scroll::-webkit-scrollbar {
                        width: 8px;
                      }
                      .productos-scroll::-webkit-scrollbar-track {
                        background: #2d3748;
                        border-radius: 10px;
                        margin: 8px 4px;
                      }
                      .productos-scroll::-webkit-scrollbar-thumb {
                        background: linear-gradient(
                          135deg,
                          #00f2fe 0%,
                          #4facfe 100%
                        );
                        border-radius: 10px;
                        border: 2px solid #2d3748;
                      }
                      .productos-scroll::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(
                          135deg,
                          #4facfe 0%,
                          #00f2fe 100%
                        );
                      }
                    `}</style>

                    {/* TABLA con solo el cuerpo */}
                    <table className="table table-sm table-borderless mb-0">
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

                          // CALCULAR TOTAL CORRECTO DEL ITEM (EXACTO COMO EL SISTEMA)
                          const precioConFactor = precioBase * multiplicador;
                          const subtotalItem =
                            parseFloat(it.cantidad) * precioConFactor;
                          const totalItem = subtotalItem - ahorro;

                          return (
                            <tr
                              key={it.id}
                              style={{
                                backgroundColor:
                                  i % 2 === 0 ? "#2d323b" : "#252a32",
                                color: "white",
                                borderBottom: "1px solid #374151",
                              }}
                            >
                              <td
                                className="text-center align-middle"
                                style={{ width: "5%", padding: "10px 5px" }}
                              >
                                <span style={{ fontWeight: "bold" }}>
                                  {i + 1}
                                </span>
                              </td>
                              <td
                                className="text-center align-middle"
                                style={{ width: "14%", padding: "10px 5px" }}
                              >
                                <span
                                  className="text-info"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {it.codigo || it.combo_codigo}
                                </span>
                              </td>
                              <td
                                className="text-center align-middle"
                                style={{ width: "16%", padding: "10px 5px" }}
                              >
                                <div className="d-flex flex-column align-items-center">
                                  {factor > 1 && (
                                    <div
                                      className="d-flex justify-content-center mb-1"
                                      style={{ width: "100%" }}
                                    >
                                      <div
                                        className="btn-group btn-group-toggle"
                                        style={{ maxWidth: "125px" }}
                                      >
                                        <button
                                          className={`btn btn-xs ${it.es_bulto === 0 ? "btn-primary" : "btn-outline-light"}`}
                                          onClick={() =>
                                            toggleBulto(it.id, it.es_bulto, it)
                                          }
                                          style={{
                                            fontSize: "0.65rem",
                                            padding: "2px 5px",
                                            minWidth: "58px",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {it.unidad_nombre
                                            ? it.unidad_nombre.substring(0, 6)
                                            : "UNIDAD"}
                                        </button>
                                        <button
                                          className={`btn btn-xs ${it.es_bulto === 1 ? "btn-info" : "btn-outline-light"}`}
                                          onClick={() =>
                                            toggleBulto(it.id, it.es_bulto, it)
                                          }
                                          style={{
                                            fontSize: "0.65rem",
                                            padding: "2px 5px",
                                            minWidth: "58px",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {it.unidad_bulto_nombre
                                            ? it.unidad_bulto_nombre.substring(
                                                0,
                                                6,
                                              )
                                            : "CAJA"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  <div className="btn-group btn-group-sm mt-1">
                                    <button
                                      className="btn btn-outline-light btn-xs"
                                      onClick={() => {
                                        if (parseFloat(it.cantidad) > 1) {
                                          const nuevaCantidad =
                                            parseFloat(it.cantidad) - 1;
                                          updateCantidad(
                                            it.id,
                                            nuevaCantidad,
                                            it,
                                          );
                                        }
                                      }}
                                      style={{
                                        padding: "3px 8px",
                                        fontSize: "0.75rem",
                                        minWidth: "30px",
                                        opacity:
                                          parseFloat(it.cantidad) <= 1
                                            ? 0.5
                                            : 1,
                                        cursor:
                                          parseFloat(it.cantidad) <= 1
                                            ? "not-allowed"
                                            : "pointer",
                                      }}
                                      disabled={parseFloat(it.cantidad) <= 1}
                                    >
                                      -
                                    </button>
                                    <span
                                      className="px-2 font-weight-bold d-inline-block"
                                      style={{
                                        fontSize: "0.9rem",
                                        minWidth: "25px",
                                        textAlign: "center",
                                      }}
                                    >
                                      {it.cantidad}
                                    </span>
                                    <button
                                      className="btn btn-outline-light btn-xs"
                                      onClick={async () => {
                                        const nuevaCantidad =
                                          parseFloat(it.cantidad) + 1;
                                        const factor = parseFloat(
                                          it.factor_utilizado || 1,
                                        );
                                        const stockDisponible = parseFloat(
                                          it.producto_stock || 0,
                                        );

                                        // Calcular unidades necesarias según la escala actual
                                        let unidadesNecesarias;
                                        if (it.es_bulto === 1) {
                                          unidadesNecesarias =
                                            nuevaCantidad * factor;
                                        } else {
                                          unidadesNecesarias = nuevaCantidad;
                                        }

                                        // Validar stock
                                        if (
                                          unidadesNecesarias > stockDisponible
                                        ) {
                                          Swal.fire({
                                            icon: "warning",
                                            title: "Stock insuficiente",
                                            html: `No hay suficiente stock disponible.<br>
                                                   Stock actual: ${stockDisponible} ${it.unidad_nombre || "unidades"}<br>
                                                   ${it.es_bulto === 1 ? `(${nuevaCantidad} bulto(s) × ${factor} = ${unidadesNecesarias} unidades necesarias)` : ""}`,
                                            confirmButtonText: "Entendido",
                                          });
                                          return;
                                        }

                                        // Si pasa la validación, actualizar cantidad
                                        updateCantidad(
                                          it.id,
                                          nuevaCantidad,
                                          it,
                                        );
                                      }}
                                      style={{
                                        padding: "3px 8px",
                                        fontSize: "0.75rem",
                                        minWidth: "30px",
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                  {it.es_bulto === 1 && (
                                    <div
                                      className="text-info mt-1"
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Equiv: {it.cantidad * factor}{" "}
                                      {it.unidad_nombre}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td
                                className="align-middle"
                                style={{ width: "30%", padding: "10px 5px" }}
                              >
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  {it.nombre || it.combo_nombre}{" "}
                                  {ahorro > 0 && (
                                    <span
                                      className="badge ml-1"
                                      style={{
                                        fontSize: "0.65rem",
                                        backgroundColor: "#10b981",
                                        color: "#fff",
                                        padding: "2px 6px",
                                        borderRadius: "8px",
                                      }}
                                    >
                                      PROMO
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td
                                className="text-center align-middle"
                                style={{ width: "8%", padding: "10px 5px" }}
                              >
                                <span style={{ fontSize: "0.85rem" }}>
                                  {it.unidad_nombre || "Unid."}
                                </span>
                              </td>
                              <td
                                className="text-right align-middle"
                                style={{ width: "12%", padding: "10px 5px" }}
                              >
                                <span style={{ fontSize: "0.85rem" }}>
                                  {formatMoney(precioBase)}
                                </span>
                              </td>
                              <td
                                className="text-right align-middle"
                                style={{ width: "10%", padding: "10px 5px" }}
                              >
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {formatMoney(totalItem)}
                                </span>
                              </td>
                              <td
                                className="text-center align-middle"
                                style={{ width: "5%", padding: "10px 5px" }}
                              >
                                <button
                                  className="btn btn-danger btn-xs"
                                  onClick={() => deleteItem(it.id)}
                                  style={{
                                    backgroundColor: "#ef4444",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "5px 8px",
                                    fontSize: "0.8rem",
                                    minWidth: "35px",
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* FOOTER FIJO */}
                  <div
                    style={{
                      backgroundColor: "#1f2937",
                      borderTop: "2px solid #374151",
                      padding: "12px 10px",
                      flexShrink: 0,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          width: "34%",
                          textAlign: "right",
                          paddingRight: "10px",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffc107",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                          }}
                        >
                          Total Cant.
                        </span>
                      </div>
                      <div style={{ width: "5%", textAlign: "center" }}>
                        <span
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                          }}
                        >
                          {totalCantidad}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "46%",
                          textAlign: "right",
                          paddingRight: "10px",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffc107",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                          }}
                        >
                          Subtotal
                        </span>
                      </div>
                      <div style={{ width: "10%", textAlign: "right" }}>
                        <span
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                          }}
                        >
                          {formatMoney(subtotalConPromos)}
                        </span>
                      </div>
                      <div style={{ width: "5%" }}></div>
                    </div>
                  </div>
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
              {/* 🔴 DESHABILITAR CHECKBOX DE CUENTA CORRIENTE SI CLIENTE ES CONSUMIDOR FINAL */}
              <div className="form-group row align-items-center mb-3">
                <label className="col-sm-5 text-bold">Cuenta Corriente</label>
                <div className="col-sm-7">
                  <input
                    type="checkbox"
                    checked={esCtaCte}
                    onChange={(e) => {
                      if (clienteSel.id === 1) {
                        Swal.fire({
                          icon: "warning",
                          title: "No disponible",
                          text: 'No se puede usar cuenta corriente con "Consumidor Final".',
                          timer: 2000,
                          showConfirmButton: false,
                        });
                        return;
                      }
                      setEsCtaCte(e.target.checked);
                    }}
                    disabled={clienteSel.id === 1}
                    style={{ width: "20px", height: "20px" }}
                  />
                  {clienteSel.id === 1 && (
                    <small className="text-danger ml-2 d-block">
                      No disponible para Consumidor Final
                    </small>
                  )}
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

      {/* --- MODALES CONSULTADOR MEJORADO --- */}
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
                    // Buscar primero en productos
                    const p = productos.find(
                      (x) =>
                        x.codigo === val ||
                        x.nombre.toLowerCase().includes(val.toLowerCase()),
                    );
                    if (p) {
                      setProductoConsultado({ ...p, esCombo: false });
                      return;
                    }
                    // Si no encuentra producto, buscar en combos
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
                    <button
                      className="btn btn-success btn-lg"
                      onClick={() => {
                        addItem(productoConsultado.codigo);
                        window.$("#modal-consultador").modal("hide");
                      }}
                    >
                      <i className="fas fa-cart-plus mr-2"></i>
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 text-muted">
                  <i className="fas fa-barcode fa-4x mb-3 opacity-25"></i>
                  <p>Ingrese código o nombre del producto o combo...</p>
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

      {/* --- MODAL PRODUCTOS MEJORADO CON PESTAÑAS PARA COMBOS --- */}
      <div className="modal fade" id="modal-productos" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5>Listado de Ítems (Productos y Combos)</h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <ul className="nav nav-tabs mb-3" id="itemsTab" role="tablist">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    id="productos-tab"
                    data-toggle="tab"
                    href="#productos-tab-content"
                    role="tab"
                  >
                    <i className="fas fa-box mr-1"></i> Productos (
                    {productos.length})
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="combos-tab"
                    data-toggle="tab"
                    href="#combos-tab-content"
                    role="tab"
                  >
                    <i className="fas fa-boxes mr-1"></i> Combos (
                    {combos.length})
                  </a>
                </li>
              </ul>

              <div className="tab-content" id="itemsTabContent">
                {/* Tab de Productos */}
                <div
                  className="tab-pane fade show active"
                  id="productos-tab-content"
                  role="tabpanel"
                >
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
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p) => (
                        <tr key={`prod-${p.id}`}>
                          <td className="text-center align-middle">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                addItem(p.codigo);
                                window.$("#modal-productos").modal("hide");
                              }}
                              title="Agregar producto"
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
                                alt={p.nombre}
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
                          <td className="text-center">
                            <span className="badge badge-primary">
                              Producto
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tab de Combos */}
                <div
                  className="tab-pane fade"
                  id="combos-tab-content"
                  role="tabpanel"
                >
                  <table
                    id="combos-table"
                    className="table table-striped table-bordered table-sm w-100"
                  >
                    <thead>
                      <tr className="text-center">
                        <th>Acción</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Contenido</th>
                        <th>Precio</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combos.map((c) => (
                        <tr key={`combo-${c.id}`}>
                          <td className="text-center align-middle">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => {
                                addItem(c.codigo);
                                window.$("#modal-productos").modal("hide");
                              }}
                              title="Agregar combo"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          </td>
                          <td className="text-center align-middle font-weight-bold">
                            {c.codigo}
                          </td>
                          <td>
                            <strong>{c.nombre}</strong>
                            {c.descripcion && (
                              <div className="text-muted small">
                                {c.descripcion}
                              </div>
                            )}
                          </td>
                          <td>
                            <small>
                              {c.productos_incluidos || "Varios productos"}
                            </small>
                          </td>
                          <td className="text-right font-weight-bold">
                            {formatMoney(c.precio_venta)}
                          </td>
                          <td className="text-center">
                            <span className="badge badge-warning">COMBO</span>
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

      {/* --- MODAL CLIENTES --- */}
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

      {/* --- MODAL CREAR CLIENTE --- */}
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
