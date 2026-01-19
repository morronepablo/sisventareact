// src/pages/compras/CrearCompra.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const CrearCompra = () => {
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

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tmpCompras, setTmpCompras] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    fecha: (() => {
      const hoy = new Date();
      const offset = hoy.getTimezoneOffset() * 60000;
      return new Date(hoy - offset).toISOString().split("T")[0];
    })(),
    comprobante: "",
    numero: "",
    precio_total: 0,
  });

  const [pagos, setPagos] = useState({
    efectivo: 0,
    tarjeta: 0,
    mercadopago: 0,
    banco: 0,
  });

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  const fetchTmp = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/compras/tmp?usuario_id=${user.id}`);
      setTmpCompras(res.data);
      const total = res.data.reduce(
        (acc, item) =>
          acc + parseFloat(item.cantidad) * parseFloat(item.precio_compra),
        0,
      );
      setFormData((prev) => ({ ...prev, precio_total: total }));
    } catch (e) {
      console.error("Error tmp:", e);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      if (arqueoAbierto === null || !user) return;
      if (arqueoAbierto === false) {
        await Swal.fire({
          icon: "error",
          title: "Caja Cerrada",
          text: "Debe abrir caja antes de realizar una compra",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/compras/listado");
        return;
      }
      try {
        const [resP, resProv] = await Promise.all([
          api.get("/productos"),
          api.get("/proveedores"),
        ]);
        setProductos(resP.data);
        setProveedores(resProv.data);
        await fetchTmp();
        setLoadingData(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    inicializar();
  }, [arqueoAbierto, user]);

  const handlePriceChange = async (id, nuevoPrecio) => {
    const nuevasCompras = tmpCompras.map((item) => {
      if (item.id === id) return { ...item, precio_compra: nuevoPrecio };
      return item;
    });
    setTmpCompras(nuevasCompras);
    const nuevoTotal = nuevasCompras.reduce(
      (acc, item) =>
        acc + parseFloat(item.cantidad) * parseFloat(item.precio_compra || 0),
      0,
    );
    setFormData((prev) => ({ ...prev, precio_total: nuevoTotal }));
    try {
      await api.put(`/compras/tmp/price/${id}`, { precio_compra: nuevoPrecio });
    } catch (e) {
      console.error("Error al guardar precio", e);
    }
  };

  const updateQty = async (id, currentQty, delta) => {
    const newQty = parseFloat(currentQty) + delta;
    if (newQty < 1) return;
    try {
      const res = await api.put(`/compras/tmp/${id}`, { cantidad: newQty });
      if (res.data.success) fetchTmp();
    } catch (e) {
      Swal.fire("Error", "No se pudo actualizar la cantidad", "error");
    }
  };

  const addItem = async (codigoItem) => {
    if (!proveedorSeleccionado)
      return Swal.fire(
        "Atención",
        "Seleccione un Proveedor para auditar precios.",
        "warning",
      );
    try {
      const p = productos.find((x) => x.codigo === codigoItem);
      if (p) {
        const res = await api.post("/compras/tmp", {
          producto_id: p.id,
          cantidad: parseFloat(cantidad),
          usuario_id: user.id,
          proveedor_id: proveedorSeleccionado.id,
        });
        if (res.data.success) {
          setCodigo("");
          setCantidad(1);
          fetchTmp();
        }
      } else {
        Swal.fire("Error", "Producto no encontrado", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (e) => {
    if (e.key === "Enter" && codigo) addItem(codigo);
  };

  const handleConfirmarCompra = async () => {
    if (!proveedorSeleccionado)
      return Swal.fire("Error", "Seleccione un proveedor", "error");
    if (!formData.comprobante || !formData.numero)
      return Swal.fire("Error", "Complete datos del comprobante", "error");
    try {
      const payload = {
        ...formData,
        pagos,
        id_proveedor: proveedorSeleccionado.id,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        actualizar_precios: true,
      };
      const response = await api.post("/compras", payload);
      if (response.data.success) {
        if (refreshAll) await refreshAll();
        window.dispatchEvent(new Event("forceRefreshNotifications"));
        window.$("#modal-pagos").modal("hide");
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Compra registrada correctamente.",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/compras/listado");
      }
    } catch (e) {
      Swal.fire("Error", "Ocurrió un error al procesar la compra", "error");
    }
  };

  // ✅ NUEVO: Manejo de F5 con validaciones
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F5") {
        e.preventDefault();

        if (tmpCompras.length === 0) {
          Swal.fire("Atención", "No hay productos para registrar.", "warning");
          return;
        }

        if (!proveedorSeleccionado) {
          Swal.fire(
            "Atención",
            "Debe seleccionar un proveedor antes de registrar la compra.",
            "warning",
          );
          return;
        }

        const modal = document.getElementById("modal-pagos");
        if (modal && !modal.classList.contains("show")) {
          window.$("#modal-pagos").modal("show");
        } else {
          handleConfirmarCompra();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [tmpCompras, proveedorSeleccionado]);

  useEffect(() => {
    if (!loadingData && productos.length > 0) {
      const timer = setTimeout(() => {
        ["#prod-table", "#prov-table"].forEach((id) => {
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
  }, [loadingData, productos]);

  if (arqueoAbierto === null || loadingData) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Registro de una nueva compra</b>
            </h1>
          </div>
          <div className="col-sm-6 text-right">
            <span className="badge badge-secondary p-2 ml-1 shadow-sm">
              SHIFT+F2: Listado Compras
            </span>
            <span className="badge badge-danger p-2 ml-1 shadow-sm">
              F5: Registrar Compra
            </span>
          </div>
        </div>
        <hr />
        <div className="row">
          {/* 🎨 PANEL IZQUIERDO: PRODUCTOS */}
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
                    <label className="text-muted text-xs mb-1">Cant.*</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-dark text-white text-center"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      style={{ fontSize: "1rem" }}
                    />
                  </div>
                  <div className="col-md-7">
                    <label className="text-muted text-xs mb-1">
                      Código / Nombre
                    </label>
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
                        onKeyDown={handleAddProduct}
                        autoFocus
                        placeholder="Escanee o escriba código..."
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
                    {/* 👇 CABECERA CON COLOR AZUL CIAN (#00f2fe) */}
                    <thead
                      className="text-center"
                      style={{ backgroundColor: "#2d323b", color: "#00f2fe" }}
                    >
                      <tr>
                        <th>Nro.</th>
                        <th>Código</th>
                        <th style={{ width: "120px" }}>Cant.</th>
                        <th>Producto</th>
                        <th style={{ width: "130px" }}>Costo Unit.</th>
                        <th>Total</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tmpCompras.map((it, i) => {
                        const pAnt = parseFloat(it.precio_anterior || 0);
                        const pAct = parseFloat(it.precio_compra || 0);
                        const aumento =
                          pAnt > 0 ? ((pAct - pAnt) / pAnt) * 100 : 0;
                        const esTraicion = aumento > 10;

                        // 🚀 LÓGICA EL NEGOCIADOR: ¿Hay alguien más barato?
                        const mPre = parseFloat(it.mejor_precio || 0);
                        const esMasBaratoEnOtroLado =
                          mPre > 0 &&
                          pAct > mPre &&
                          it.mejor_proveedor !== proveedorSeleccionado?.empresa;

                        return (
                          <tr
                            key={it.id}
                            className={esTraicion ? "bg-light-danger" : ""}
                            style={{
                              backgroundColor: "#2d323b",
                              color: "white",
                            }}
                          >
                            <td className="text-center align-middle">
                              {i + 1}
                            </td>
                            <td className="text-center align-middle">
                              {it.codigo}
                            </td>
                            <td className="text-center align-middle">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary btn-xs"
                                  onClick={() =>
                                    updateQty(it.id, it.cantidad, -1)
                                  }
                                  disabled={it.cantidad <= 1}
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  -
                                </button>
                                <span
                                  className="px-2 font-weight-bold align-self-center"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {it.cantidad}
                                </span>
                                <button
                                  className="btn btn-outline-secondary btn-xs"
                                  onClick={() =>
                                    updateQty(it.id, it.cantidad, 1)
                                  }
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="align-middle">
                              <b>{it.nombre}</b>
                              {esTraicion && (
                                <div className="text-danger small font-weight-bold mt-1">
                                  <i className="fas fa-exclamation-triangle"></i>{" "}
                                  ¡TRAICIÓN! Subió un {aumento.toFixed(1)}%
                                  (Antes: ${pAnt})
                                </div>
                              )}
                              {/* 🤝 VISUAL DEL NEGOCIADOR 🤝 */}
                              {esMasBaratoEnOtroLado && (
                                <div className="text-primary small font-weight-bold mt-1">
                                  <i className="fas fa-handshake"></i> OJO:{" "}
                                  <b>{it.mejor_proveedor}</b> lo vendió a{" "}
                                  <b>${mPre}</b>
                                </div>
                              )}
                            </td>
                            <td
                              className="text-right align-middle"
                              style={{ width: "130px" }}
                            >
                              <input
                                type="number"
                                className={`form-control form-control-sm text-right font-weight-bold ${
                                  esTraicion
                                    ? "is-invalid text-danger"
                                    : "text-success"
                                }`}
                                step="0.01"
                                value={it.precio_compra}
                                onChange={(e) =>
                                  handlePriceChange(it.id, e.target.value)
                                }
                                onFocus={(e) => e.target.select()}
                                style={{ fontSize: "0.9rem" }}
                              />
                            </td>
                            <td className="text-right align-middle text-bold">
                              $
                              {(it.cantidad * it.precio_compra).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 },
                              )}
                            </td>
                            <td className="text-center align-middle">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  await api.delete(`/compras/tmp/${it.id}`);
                                  fetchTmp();
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
                    {/* 👇 FILA DE TOTALES CON COLOR AMARILLO BRILLANTE */}
                    <tfoot className="bg-dark">
                      <tr className="text-bold" style={{ color: "#ffc107" }}>
                        <td colSpan="5" className="text-right">
                          TOTAL COMPRA
                        </td>
                        <td className="text-right">
                          ${" "}
                          {formData.precio_total.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 🚀 PANEL DERECHO: DATOS DE LA COMPRA */}
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
                      data-target="#modal-proveedores"
                    >
                      <i className="fas fa-search mr-1"></i> BUSCAR PROVEEDOR
                    </button>
                  </div>
                  <div className="col-3">
                    <button
                      className="btn btn-success btn-sm btn-block shadow-sm"
                      onClick={() => navigate("/proveedores/crear")}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-12">
                    <label className="text-muted text-xs mb-1">
                      PROVEEDOR SELECCIONADO
                    </label>
                    <div
                      className="bg-black p-2 rounded border border-secondary text-info text-bold text-uppercase"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {proveedorSeleccionado?.empresa || "Ninguno seleccionado"}
                    </div>
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label className="text-muted text-xs text-bold text-uppercase">
                    TOTAL A PAGAR
                  </label>
                  <div
                    className="p-3 text-right rounded shadow-inset"
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
                      {formatMoney(formData.precio_total)}
                    </span>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="text-muted text-xs">Fecha</label>
                    <input
                      type="date"
                      className="form-control form-control-sm bg-dark text-white"
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value })
                      }
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="text-muted text-xs">Tipo</label>
                    <select
                      className="form-control form-control-sm bg-dark text-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          comprobante: e.target.value,
                        })
                      }
                      style={{ fontSize: "0.9rem" }}
                    >
                      <option value="">-</option>
                      <option value="FACTURA">FACTURA</option>
                      <option value="RECIBO">RECIBO</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="text-muted text-xs">N°</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white"
                      onChange={(e) =>
                        setFormData({ ...formData, numero: e.target.value })
                      }
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg shadow-lg mt-3 text-bold"
                  data-toggle="modal"
                  data-target="#modal-pagos"
                  style={{
                    height: "70px",
                    fontSize: "1.6rem",
                    border: "none",
                    background:
                      "linear-gradient(180deg, #007bff 0%, #0056b3 100%)",
                  }}
                >
                  <i className="fa-regular fa-floppy-disk mr-2"></i> REGISTRAR
                  (F5)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- MODALES --- */}
        <div className="modal fade" id="modal-pagos" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5>Registrar Pago Inicial</h5>
                <button className="close text-white" data-dismiss="modal">
                  ×
                </button>
              </div>
              <div className="modal-body">
                {["efectivo", "tarjeta", "mercadopago", "banco"].map((m) => (
                  <div className="form-group row mb-2" key={m}>
                    <label className="col-sm-5 text-capitalize text-bold">
                      {m}
                    </label>
                    <div className="col-sm-7 input-group">
                      <input
                        type="number"
                        className="form-control text-right font-weight-bold"
                        style={{
                          backgroundColor:
                            m === "efectivo"
                              ? "#d4edda"
                              : m === "banco"
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
                          onClick={() =>
                            setPagos({
                              efectivo: 0,
                              tarjeta: 0,
                              mercadopago: 0,
                              banco: 0,
                              [m]: formData.precio_total,
                            })
                          }
                        >
                          $
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" data-dismiss="modal">
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmarCompra}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL PRODUCTOS (ESTILO ORIGINAL) */}
        <div className="modal fade" id="modal-productos" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5>Listado de Productos</h5>
                <button className="close text-white" data-dismiss="modal">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <table
                  id="prod-table"
                  className="table table-striped table-bordered table-sm w-100"
                >
                  <thead className="text-center">
                    <tr>
                      <th>Acción</th>
                      <th>Imagen</th>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Stock</th>
                      <th>Costo</th>
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
                          {parseFloat(p.precio_compra).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL PROVEEDORES (ESTILO ORIGINAL) */}
        <div className="modal fade" id="modal-proveedores" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5>Listado de Proveedores</h5>
                <button className="close text-white" data-dismiss="modal">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <table
                  id="prov-table"
                  className="table table-striped table-bordered table-sm w-100"
                >
                  <thead className="text-center">
                    <tr>
                      <th>Acción</th>
                      <th>Empresa</th>
                      <th>Marca</th>
                      <th>Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((pr) => (
                      <tr key={pr.id}>
                        <td className="text-center align-middle">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setProveedorSeleccionado(pr);
                              window.$("#modal-proveedores").modal("hide");
                            }}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </td>
                        <td className="align-middle">{pr.empresa}</td>
                        <td className="align-middle">{pr.marca}</td>
                        <td className="align-middle">{pr.contacto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .bg-light-danger { background-color: rgba(220, 53, 69, 0.1) !important; }
          .is-invalid { border-color: #dc3545 !important; }
        `}</style>
      </div>
    </div>
  );
};

export default CrearCompra;
