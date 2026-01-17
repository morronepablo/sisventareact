// src/pages/compras/CrearOrdenCompra.jsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

// --- ESTILOS UNIFORMES PARA SELECT2 ---
const select2CustomStyles = `
  .select2-container .select2-selection--single {
    height: 38px !important;
    display: flex !important;
    align-items: center !important;
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__rendered {
    line-height: 38px !important;
    padding-left: 12px !important;
    color: #495057 !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 36px !important;
  }
`;

const CrearOrdenCompra = () => {
  const navigate = useNavigate();
  const selectProvRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [totalEstimado, setTotalEstimado] = useState(0);

  const [proveedorSel, setProveedorSel] = useState("");
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    const options = {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-CA", options).format(hoy);
  });
  const [observaciones, setObservaciones] = useState("");
  const [itemsPedido, setItemsPedido] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const fetchData = async () => {
    try {
      const [resProv, resProd] = await Promise.all([
        api.get("/proveedores"),
        api.get("/productos"),
      ]);
      setProveedores(resProv.data);
      setProductos(resProd.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- INICIALIZACIÓN DE SELECT2 ---
  useEffect(() => {
    if (!loading && proveedores.length > 0) {
      const $select = window.$(selectProvRef.current);
      $select.select2({
        placeholder: "-- Seleccionar Proveedor --",
        width: "100%",
        allowClear: true,
      });

      $select.on("change", (e) => {
        setProveedorSel(e.target.value);
      });

      return () => {
        if ($select.data("select2")) {
          $select.select2("destroy");
        }
      };
    }
  }, [loading, proveedores]);

  // --- CORRECCIÓN AQUÍ: setTotalEstimado ---
  useEffect(() => {
    const total = itemsPedido.reduce(
      (sum, item) => sum + item.cantidad * item.precio_compra,
      0,
    );
    setTotalEstimado(total); // <-- Antes decía setTotalEstimated
  }, [itemsPedido]);

  const agregarItem = (producto) => {
    const existe = itemsPedido.find((it) => it.producto_id === producto.id);
    if (existe) {
      setItemsPedido(
        itemsPedido.map((it) =>
          it.producto_id === producto.id
            ? { ...it, cantidad: it.cantidad + parseFloat(cantidad) }
            : it,
        ),
      );
    } else {
      setItemsPedido([
        ...itemsPedido,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: parseFloat(cantidad),
          precio_compra: producto.precio_compra,
        },
      ]);
    }
    setBusqueda("");
    setCantidad(1);
    window.$("#modal-busqueda-prod").modal("hide");
  };

  const eliminarItem = (id) => {
    setItemsPedido(itemsPedido.filter((it) => it.producto_id !== id));
  };

  const handleGuardarOC = async () => {
    if (!proveedorSel || itemsPedido.length === 0) {
      return Swal.fire(
        "Atención",
        "Seleccione un proveedor y al menos un producto",
        "warning",
      );
    }

    try {
      const payload = {
        proveedor_id: proveedorSel,
        fecha,
        observaciones,
        items: itemsPedido,
      };

      const res = await api.post("/ordenes-compra", payload);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Orden de Compra generada correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/compras/ordenes");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar el pedido", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <style>{select2CustomStyles}</style>
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <i className="fas fa-file-signature text-primary mr-2"></i>
              <b>Nueva Orden de Compra</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-md-4">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold text-primary">
                  Datos del Pedido
                </h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="font-weight-bold">Proveedor *</label>
                  <select
                    ref={selectProvRef}
                    className="form-control"
                    value={proveedorSel}
                    onChange={(e) => setProveedorSel(e.target.value)}
                  >
                    <option value=""></option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.empresa}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="font-weight-bold">Fecha de Pedido</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="font-weight-bold">Notas</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="font-weight-bold text-success">
                    Total Estimado
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text bg-success text-white">
                        $
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control text-right font-weight-bold"
                      value={totalEstimado.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary btn-block btn-lg shadow mt-3"
              onClick={handleGuardarOC}
            >
              <i className="fas fa-save mr-2"></i> REGISTRAR PEDIDO
            </button>
          </div>

          <div className="col-md-8">
            <div className="card card-outline card-success shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold text-success">
                  Ítems del Pedido
                </h3>
                <div className="card-tools">
                  <button
                    className="btn btn-success btn-sm"
                    data-toggle="modal"
                    data-target="#modal-busqueda-prod"
                  >
                    <i className="fas fa-search mr-1"></i> Buscar Producto
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <table className="table table-striped m-0 text-sm">
                  <thead className="bg-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center" style={{ width: "120px" }}>
                        Cantidad
                      </th>
                      <th className="text-right">Costo Est.</th>
                      <th className="text-right">Subtotal</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPedido.map((it) => (
                      <tr key={it.producto_id}>
                        <td className="align-middle">{it.nombre}</td>
                        <td className="text-center align-middle">
                          <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            value={it.cantidad}
                            onChange={(e) =>
                              setItemsPedido(
                                itemsPedido.map((i) =>
                                  i.producto_id === it.producto_id
                                    ? {
                                        ...i,
                                        cantidad:
                                          parseFloat(e.target.value) || 0,
                                      }
                                    : i,
                                ),
                              )
                            }
                          />
                        </td>
                        <td className="text-right align-middle">
                          ${" "}
                          {parseFloat(it.precio_compra).toLocaleString("es-AR")}
                        </td>
                        <td className="text-right align-middle font-weight-bold text-success">
                          ${" "}
                          {(it.cantidad * it.precio_compra).toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td className="text-center align-middle">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarItem(it.producto_id)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {itemsPedido.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No hay productos agregados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL BÚSQUEDA */}
      <div className="modal fade" id="modal-busqueda-prod" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title font-weight-bold">Buscar Producto</h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="table table-sm table-hover table-striped">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Stock</th>
                      <th className="text-right">Costo</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos
                      .filter(
                        (p) =>
                          p.nombre
                            .toLowerCase()
                            .includes(busqueda.toLowerCase()) ||
                          p.codigo
                            .toLowerCase()
                            .includes(busqueda.toLowerCase()),
                      )
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="align-middle">{p.nombre}</td>
                          <td className="text-center align-middle">
                            <span
                              className={`badge ${p.stock <= p.stock_minimo ? "badge-danger" : "badge-secondary"}`}
                            >
                              {p.stock}
                            </span>
                          </td>
                          <td className="text-right align-middle">
                            $ {parseFloat(p.precio_compra).toLocaleString()}
                          </td>
                          <td className="text-center align-middle">
                            <button
                              className="btn btn-primary btn-xs"
                              onClick={() => agregarItem(p)}
                            >
                              <i className="fas fa-plus mr-1"></i> Agregar
                            </button>
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
  );
};

export default CrearOrdenCompra;
