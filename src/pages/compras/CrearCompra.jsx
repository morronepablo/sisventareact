// src/pages/productos/CrearCompra.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

const CrearCompra = () => {
  const navigate = useNavigate();
  // El Hook se llama AQUÍ ADENTRO
  const { refreshAll } = useNotifications();

  // ESTADOS
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tmpCompras, setTmpCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificandoCaja, setVerificandoCaja] = useState(true);

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

  const obtenerUsuario = () => {
    const uStr =
      localStorage.getItem("usuario") || localStorage.getItem("user");
    if (uStr) return JSON.parse(uStr);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        return JSON.parse(window.atob(token.split(".")[1]));
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const inicializarModulo = async () => {
      const user = obtenerUsuario();
      if (!user) return navigate("/login");
      setUsuario(user);
      try {
        const resCheck = await api.get("/arqueos/estado-abierto");
        if (!resCheck.data.arqueoAbierto) {
          await Swal.fire({
            icon: "error",
            title: "No hay Caja Abierta.",
            text: "Debe abrir caja antes de realizar una compra",
            showConfirmButton: false,
            timer: 2000,
          });
          navigate("/compras/listado");
          return;
        }
        const [resP, resProv, resT] = await Promise.all([
          api.get("/productos"),
          api.get("/proveedores"),
          api.get(`/compras/tmp?usuario_id=${user.id}`),
        ]);
        setProductos(resP.data);
        setProveedores(resProv.data);
        setTmpCompras(resT.data);
        const total = resT.data.reduce(
          (acc, item) =>
            acc + parseFloat(item.cantidad) * parseFloat(item.precio_compra),
          0
        );
        setFormData((prev) => ({ ...prev, precio_total: total }));
        setVerificandoCaja(false);
        setLoading(false);
      } catch (error) {
        navigate("/compras/listado");
      }
    };
    inicializarModulo();
  }, [navigate]);

  const fetchTmp = async () => {
    if (!usuario?.id) return;
    const res = await api.get(`/compras/tmp?usuario_id=${usuario.id}`);
    setTmpCompras(res.data);
    const total = res.data.reduce(
      (acc, item) =>
        acc + parseFloat(item.cantidad) * parseFloat(item.precio_compra),
      0
    );
    setFormData((prev) => ({ ...prev, precio_total: total }));
  };

  const handleConfirmarCompra = async () => {
    if (!proveedorSeleccionado)
      return Swal.fire("Error", "Seleccione un proveedor", "error");
    if (!formData.comprobante || !formData.numero)
      return Swal.fire("Error", "Complete los datos del comprobante", "error");

    const pagosLimpios = {
      efectivo: parseFloat(pagos.efectivo) || 0,
      tarjeta: parseFloat(pagos.tarjeta) || 0,
      mercadopago: parseFloat(pagos.mercadopago) || 0,
      banco: parseFloat(pagos.banco) || 0,
    };

    try {
      const payload = {
        ...formData,
        pagos: pagosLimpios,
        id_proveedor: proveedorSeleccionado.id,
        usuario_id: usuario.id,
        empresa_id: usuario.empresa_id || 1,
      };

      const response = await api.post("/compras", payload);

      if (response.data.success) {
        // ACTUALIZACIÓN DOBLE: Por Hook y por Evento (Seguridad total)
        if (refreshAll) refreshAll();
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
      Swal.fire("Error", "Error en el servidor", "error");
    }
  };

  const importeAbonar =
    parseFloat(pagos.efectivo || 0) +
    parseFloat(pagos.tarjeta || 0) +
    parseFloat(pagos.mercadopago || 0) +
    parseFloat(pagos.banco || 0);

  useEffect(() => {
    if (!loading && productos.length > 0) {
      const timer = setTimeout(() => {
        if (window.$) {
          ["#prod-table", "#prov-table"].forEach((id) => {
            if (!window.$.fn.DataTable.isDataTable(id)) {
              window.$(id).DataTable({
                paging: true,
                pageLength: 10,
                language: {
                  url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
                },
              });
            }
          });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (verificandoCaja)
    return <div className="p-4 text-center">Verificando estado de caja...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Registro de una nueva compra</b>
        </h1>
        <hr />
        <div className="row">
          <div className="col-md-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Ingrese los datos</h3>
              </div>
              <div className="card-body">
                <div className="row">
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
                            id="input-codigo"
                            type="text"
                            className="form-control"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                const p = productos.find(
                                  (x) => x.codigo === codigo
                                );
                                if (p) {
                                  await api.post("/compras/tmp", {
                                    producto_id: p.id,
                                    cantidad,
                                    usuario_id: usuario.id,
                                  });
                                  setCodigo("");
                                  fetchTmp();
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div style={{ height: "32px" }}></div>
                        <button
                          className="btn btn-primary mr-1"
                          data-toggle="modal"
                          data-target="#modal-productos"
                        >
                          <i className="fa fa-search"></i>
                        </button>
                      </div>
                    </div>
                    <table className="table table-striped table-bordered table-sm mt-3">
                      <thead className="thead-dark">
                        <tr className="text-center">
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
                            <td>{it.codigo}</td>
                            <td className="text-center">{it.cantidad}</td>
                            <td>{it.nombre}</td>
                            <td className="text-right">$ {it.precio_compra}</td>
                            <td className="text-right text-bold">
                              $ {(it.cantidad * it.precio_compra).toFixed(2)}
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
                        <tr>
                          <td colSpan="5" className="text-right">
                            <b>Total Compra</b>
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
                          className="form-control"
                          style={{ backgroundColor: "#e9ecef" }}
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

      {/* MODALES */}
      <div className="modal fade" id="modal-pagos" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary">
              <h5 className="modal-title">Registrar Pago Inicial</h5>
              <button className="close" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group row">
                <label className="col-sm-5">Total Compra</label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control text-right"
                    style={{ fontSize: "1.3rem" }}
                    value={`$ ${formData.precio_total.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                  />
                </div>
              </div>
              {["efectivo", "tarjeta", "mercadopago", "banco"].map((m) => (
                <div className="form-group row" key={m}>
                  <label className="col-sm-5 text-capitalize">{m}</label>
                  <div className="col-sm-7 input-group">
                    <input
                      type="number"
                      className="form-control text-right"
                      style={{
                        fontSize: "1.3rem",
                        backgroundColor:
                          m === "efectivo"
                            ? "#d4edda"
                            : m === "tarjeta"
                            ? "#d1ecf1"
                            : m === "mercadopago"
                            ? "#fff3cd"
                            : "#cce5ff",
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
                    className="form-control text-right font-weight-bold"
                    style={{ backgroundColor: "#fff3cd", fontSize: "1.3rem" }}
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

      <div className="modal fade" id="modal-productos" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info">
              <h5>Listado Productos</h5>
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
                      <td>{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td className="text-right">{p.stock}</td>
                      <td className="text-right">$ {p.precio_compra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="modal-proveedores" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info">
              <h5>Listado Proveedores</h5>
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
                <thead>
                  <tr className="text-center">
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
