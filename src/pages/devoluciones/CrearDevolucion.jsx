// src/pages/devoluciones/CrearDevolucion.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const CrearDevolucion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshAll, arqueoAbierto } = useNotifications();

  // --- 1. CONFIGURACIÓN DE IDIOMA LOCAL (Para evitar errores de carga externa) ---
  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible en esta tabla",
    sInfo:
      "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
    sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
    sSearch: "Buscar:",
    sLoadingRecords: "Cargando...",
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
  const [tmpItems, setTmpItems] = useState([]);

  const [cantidad, setCantidad] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset() * 60000;
    return new Date(hoy - offset).toISOString().split("T")[0];
  });
  const [motivo, setMotivo] = useState("");
  const [clienteSel, setClienteSel] = useState({
    id: 1,
    nombre_cliente: "Consumidor Final",
    cuil_codigo: "00000000000",
  });
  const [deudaInfo, setDeudaInfo] = useState({ deuda_total: 0, dias_mora: 0 });

  const fetchData = async () => {
    try {
      const [resP, resCl, resCo, resTmp] = await Promise.all([
        api.get("/productos"),
        api.get("/clientes"),
        api.get("/combos").catch(() => ({ data: [] })),
        api.get(`/devoluciones/tmp?usuario_id=${user.id}`),
      ]);
      setProductos(resP.data);
      setClientes(resCl.data);
      setCombos(resCo.data);
      setTmpItems(resTmp.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (arqueoAbierto === false) {
      Swal.fire(
        "Caja Cerrada",
        "Debe abrir caja antes de realizar una devolución",
        "error"
      );
      navigate("/devoluciones/listado");
      return;
    }
    fetchData();
  }, [arqueoAbierto]);

  const addItem = async (codigoItem) => {
    try {
      const res = await api.post("/devoluciones/tmp", {
        codigo: codigoItem.trim(),
        cantidad: parseFloat(cantidad),
        usuario_id: user.id,
      });
      if (res.data.success) {
        setCodigo("");
        fetchData();
      } else {
        Swal.fire("Error", res.data.message, "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo agregar el producto", "error");
    }
  };

  const handleAddProduct = (e) => {
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

  const handleConfirmar = async () => {
    if (tmpItems.length === 0)
      return Swal.fire("Error", "No hay productos en la lista", "error");
    try {
      const payload = {
        cliente_id: clienteSel.id,
        fecha,
        precio_total: totalDevolucion,
        motivo,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
      };
      const res = await api.post("/devoluciones", payload);
      if (res.data.success) {
        refreshAll();
        await Swal.fire({
          position: "center",
          icon: "success",
          title: "¡Éxito!",
          text: "Devolución registrada correctamente",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        navigate("/devoluciones/listado");
      }
    } catch (e) {
      Swal.fire("Error", "Fallo al registrar", "error");
    }
  };

  const totalCantidad = tmpItems.reduce(
    (acc, it) => acc + parseFloat(it.cantidad),
    0
  );
  const totalDevolucion = tmpItems.reduce((acc, it) => {
    let precio = parseFloat(it.precio_venta || it.combo_precio || 0);
    if (it.aplicar_porcentaje)
      precio =
        parseFloat(it.precio_compra) *
        (1 + parseFloat(it.valor_porcentaje) / 100);
    return acc + parseFloat(it.cantidad) * precio;
  }, 0);

  // --- 2. INICIALIZACIÓN DE DATATABLE EN ESPAÑOL ---
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        ["#prod-table", "#clie-table"].forEach((id) => {
          if (window.$.fn.DataTable.isDataTable(id)) {
            window.$(id).DataTable().destroy();
          }
          window.$(id).DataTable({
            paging: true,
            pageLength: 5,
            retrieve: true,
            language: spanishLanguage, // 👈 USAMOS EL OBJETO LOCAL AQUÍ
          });
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, productos, combos, clientes]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Registro de una nueva devolución</b>
        </h1>
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
                  <div className="col-md-10">
                    <label>Código / Nombre</label>
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
                        placeholder="Escriba y presione Enter..."
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

                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px" }}
                >
                  <table className="table table-sm table-striped table-bordered">
                    <thead className="thead-dark text-center">
                      <tr>
                        <th>Nro.</th>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Producto/Combo</th>
                        <th>Unidad</th>
                        <th>Costo</th>
                        <th>Total</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tmpItems.map((it, i) => {
                        let precio = parseFloat(
                          it.precio_venta || it.combo_precio || 0
                        );
                        if (it.aplicar_porcentaje)
                          precio =
                            parseFloat(it.precio_compra) *
                            (1 + parseFloat(it.valor_porcentaje) / 100);
                        return (
                          <tr key={it.id}>
                            <td className="text-center">{i + 1}</td>
                            <td className="text-center">
                              {it.codigo || it.combo_codigo}
                            </td>
                            <td className="text-center">{it.cantidad}</td>
                            <td>{it.nombre || it.combo_nombre}</td>
                            <td className="text-center">
                              {it.unidad_nombre || "N/A"}
                            </td>
                            <td className="text-right">
                              $ {precio.toLocaleString("es-AR")}
                            </td>
                            <td className="text-right text-bold">
                              $ {(it.cantidad * precio).toLocaleString("es-AR")}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  await api.delete(
                                    `/devoluciones/tmp/${it.id}`
                                  );
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
                    <tfoot className="bg-light text-bold">
                      <tr>
                        <td colSpan="2" className="text-right">
                          Total Cantidad
                        </td>
                        <td className="text-center text-primary">
                          {totalCantidad}
                        </td>
                        <td colSpan="3" className="text-right">
                          Total Devolución
                        </td>
                        <td className="text-right text-primary">
                          ${" "}
                          {totalDevolucion.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <button
                  className="btn btn-secondary btn-sm mt-3"
                  onClick={() => navigate("/devoluciones/listado")}
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
                  <div className="col-7">
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
                  <div className="col-5">
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
                    <small>Fecha de devolución *</small>
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
                    value={`$ ${totalDevolucion.toLocaleString("es-AR", {
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
                <div className="form-group">
                  <label>
                    <small>Motivo de la Devolución</small>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej: Producto dañado, cambio de talle..."
                  ></textarea>
                </div>
                <button
                  className="btn btn-primary btn-block btn-lg shadow-sm"
                  onClick={handleConfirmar}
                >
                  <i className="fas fa-save"></i> Registrar Devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PRODUCTOS Y COMBOS */}
      <div className="modal fade" id="modal-productos" tabIndex="-1">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5>Listado de Productos y Combos</h5>
              <button className="close" data-dismiss="modal">
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
                      <td className="text-center">
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
                      <td className="text-center">{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td>{p.stock}</td>
                      <td>
                        $ {parseFloat(p.precio_venta).toLocaleString("es-AR")}
                      </td>
                      <td>
                        <span className="badge badge-primary">Producto</span>
                      </td>
                    </tr>
                  ))}
                  {combos.map((c) => (
                    <tr key={`c-${c.id}`}>
                      <td className="text-center">
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
                      <td className="text-center">{c.codigo}</td>
                      <td>{c.nombre}</td>
                      <td>N/A</td>
                      <td>
                        $ {parseFloat(c.precio_venta).toLocaleString("es-AR")}
                      </td>
                      <td>
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

      {/* MODAL CLIENTES */}
      <div className="modal fade" id="modal-clientes" tabIndex="-1">
        <div className="modal-dialog modal-lg">
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
                      <td>{cl.cuil_codigo}</td>
                      <td>{cl.nombre_cliente}</td>
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

export default CrearDevolucion;
