// src/pages/compras/CrearCompra.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

const CrearCompra = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Contexto de autenticación real
  const { refreshAll, arqueoAbierto } = useNotifications(); // Contexto de notificaciones y arqueo

  // --- 1. CONFIGURACIÓN DE LENGUAJE LOCAL (Elimina errores de CORS) ---
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

  // --- 2. ESTADOS ---
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tmpCompras, setTmpCompras] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [cantidad, setCantidad] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
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

  // --- 3. LÓGICA DE CARGA ---

  const fetchTmp = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/compras/tmp?usuario_id=${user.id}`);
      setTmpCompras(res.data);
      const total = res.data.reduce(
        (acc, item) =>
          acc + parseFloat(item.cantidad) * parseFloat(item.precio_compra),
        0
      );
      setFormData((prev) => ({ ...prev, precio_total: total }));
    } catch (e) {
      console.error("Error tmp:", e);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      // Si el arqueo es null, el contexto aún está cargando datos del servidor
      if (arqueoAbierto === null || !user) return;

      // Si el arqueo es false (confirmado cerrado), redirigimos al listado
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

      // Si la caja está abierta, cargamos los catálogos
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
        navigate("/compras/listado");
      }
    };

    inicializar();
  }, [arqueoAbierto, user, navigate]);

  // --- 4. ACCIONES ---

  const handleAddProduct = async (e) => {
    if (e.key === "Enter" && codigo) {
      const p = productos.find((x) => x.codigo === codigo);
      if (p) {
        await api.post("/compras/tmp", {
          producto_id: p.id,
          cantidad,
          usuario_id: user.id,
        });
        setCodigo("");
        fetchTmp();
      } else {
        Swal.fire("Error", "Producto no encontrado", "error");
      }
    }
  };

  const handleConfirmarCompra = async () => {
    if (!proveedorSeleccionado)
      return Swal.fire("Error", "Seleccione un proveedor", "error");
    if (!formData.comprobante || !formData.numero)
      return Swal.fire("Error", "Complete los datos del comprobante", "error");

    try {
      const payload = {
        ...formData,
        pagos,
        id_proveedor: proveedorSeleccionado.id,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
      };
      const response = await api.post("/compras", payload);
      if (response.data.success) {
        refreshAll();
        window.dispatchEvent(new Event("forceRefreshNotifications"));
        window.$("#modal-pagos").modal("hide");
        await Swal.fire(
          "Éxito",
          "Compra registrada satisfactoriamente",
          "success"
        );
        navigate("/compras/listado");
      }
    } catch (e) {
      Swal.fire("Error", "Ocurrió un error al procesar", "error");
    }
  };

  const importeAbonar = Object.values(pagos).reduce(
    (acc, val) => acc + parseFloat(val || 0),
    0
  );

  // --- 5. DATATABLES ---

  useEffect(() => {
    if (!loadingData && productos.length > 0) {
      const timer = setTimeout(() => {
        ["#prod-table", "#prov-table"].forEach((id) => {
          if (window.$.fn.DataTable.isDataTable(id))
            window.$(id).DataTable().destroy();
          window.$(id).DataTable({
            paging: true,
            pageLength: 5,
            language: spanishLanguage, // 👈 Fix CORS
          });
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loadingData, productos]);

  // Pantalla de espera para evitar el salto al Dashboard
  if (arqueoAbierto === null || loadingData) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <h4 className="mt-3">Sincronizando sesión y estado de caja...</h4>
      </div>
    );
  }

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Registro de una nueva compra</b>
        </h1>
        <hr />
        <div className="row">
          <div className="col-md-12">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title">Ingrese los datos</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* SECCIÓN IZQUIERDA: ITEMS */}
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-md-2">
                        <label>Cant.*</label>
                        <input
                          type="number"
                          className="form-control text-center"
                          style={{ backgroundColor: "rgba(233,231,16,0.15)" }}
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
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
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div style={{ height: "32px" }}></div>
                        <button
                          className="btn btn-primary"
                          data-toggle="modal"
                          data-target="#modal-productos"
                        >
                          <i className="fa fa-search"></i> Buscar
                        </button>
                      </div>
                    </div>
                    <table className="table table-striped table-bordered table-sm mt-3">
                      <thead className="thead-dark text-center">
                        <tr>
                          <th>Nro.</th>
                          <th>Código</th>
                          <th>Cant.</th>
                          <th>Producto</th>
                          <th>Costo</th>
                          <th>Total</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tmpCompras.map((it, i) => (
                          <tr key={it.id}>
                            <td className="text-center">{i + 1}</td>
                            <td className="text-center">{it.codigo}</td>
                            <td className="text-center">{it.cantidad}</td>
                            <td>{it.nombre}</td>
                            <td className="text-right">
                              ${" "}
                              {parseFloat(it.precio_compra).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="text-right text-bold">
                              ${" "}
                              {(it.cantidad * it.precio_compra).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  await api.delete(`/compras/tmp/${it.id}`);
                                  fetchTmp();
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-light">
                          <td colSpan="5" className="text-right">
                            <b>TOTAL COMPRA</b>
                          </td>
                          <td className="text-right text-primary">
                            <b>
                              ${" "}
                              {formData.precio_total.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </b>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* SECCIÓN DERECHA: PROVEEDOR Y TOTALES */}
                  <div className="col-md-4">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <button
                          className="btn btn-primary btn-block"
                          data-toggle="modal"
                          data-target="#modal-proveedores"
                        >
                          Buscar Proveedor
                        </button>
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={proveedorSeleccionado?.empresa || ""}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <label>Fecha</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.fecha}
                          onChange={(e) =>
                            setFormData({ ...formData, fecha: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label>Tipo</label>
                        <select
                          className="form-control"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comprobante: e.target.value,
                            })
                          }
                        >
                          <option value="">-</option>
                          <option value="FACTURA">FACTURA</option>
                          <option value="RECIBO">RECIBO</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label>N°</label>
                        <input
                          type="text"
                          className="form-control"
                          onChange={(e) =>
                            setFormData({ ...formData, numero: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="alert alert-warning text-center mt-4">
                      <small>TOTAL A PAGAR</small>
                      <h3>
                        <b>
                          ${" "}
                          {formData.precio_total.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </b>
                      </h3>
                    </div>
                    <button
                      className="btn btn-primary btn-lg btn-block mt-3"
                      data-toggle="modal"
                      data-target="#modal-pagos"
                    >
                      <i className="fa-regular fa-floppy-disk"></i> Registrar
                      Compra
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* MODAL PAGOS */}
      <div className="modal fade" id="modal-pagos" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Registrar Pago Inicial</h5>
              <button className="close" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              {["efectivo", "tarjeta", "mercadopago", "banco"].map((m) => (
                <div className="form-group row" key={m}>
                  <label className="col-sm-5 text-capitalize">{m}</label>
                  <div className="col-sm-7 input-group">
                    <input
                      type="number"
                      className="form-control text-right"
                      style={{
                        fontSize: "1.2rem",
                        backgroundColor:
                          m === "efectivo"
                            ? "#d4edda"
                            : m === "tarjeta"
                            ? "#d1ecf1"
                            : "#fff3cd",
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
              <div className="form-group row">
                <label className="col-sm-5">Importe Abonar</label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold bg-light"
                    style={{ fontSize: "1.2rem" }}
                    value={`$ ${importeAbonar.toLocaleString("es-AR", {
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
                onClick={handleConfirmarCompra}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LISTADO PRODUCTOS */}
      <div className="modal fade" id="modal-productos" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5>Listado de Productos</h5>
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
                <thead className="text-center">
                  <tr>
                    <th>Nro.</th>
                    <th>Acción</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Stock</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, i) => (
                    <tr key={p.id}>
                      <td className="text-center">{i + 1}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setCodigo(p.codigo);
                            window.$("#modal-productos").modal("hide");
                          }}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </td>
                      <td className="text-center">{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td className="text-right">{p.stock}</td>
                      <td className="text-right">
                        $ {parseFloat(p.precio_compra).toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LISTADO PROVEEDORES */}
      <div className="modal fade" id="modal-proveedores" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5>Listado de Proveedores</h5>
              <button className="close" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <table
                id="prov-table"
                className="table table-striped table-bordered table-sm"
                style={{ width: "100%" }}
              >
                <thead className="text-center">
                  <tr>
                    <th>Nro.</th>
                    <th>Acción</th>
                    <th>Empresa</th>
                    <th>Marca</th>
                    <th>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((pr, i) => (
                    <tr key={pr.id}>
                      <td className="text-center">{i + 1}</td>
                      <td className="text-center">
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
                      <td>{pr.empresa}</td>
                      <td>{pr.marca}</td>
                      <td>{pr.contacto}</td>
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

export default CrearCompra;
