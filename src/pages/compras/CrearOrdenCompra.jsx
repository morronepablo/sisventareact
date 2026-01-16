// src/pages/compras/CrearOrdenCompra.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

const CrearOrdenCompra = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [totalEstimado, setTotalEstimado] = useState(0);

  // Estado del Formulario
  const [proveedorSel, setProveedorSel] = useState("");
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Esto garantiza YYYY-MM-DD en horario local
  });
  const [observaciones, setObservaciones] = useState("");
  const [itemsPedido, setItemsPedido] = useState([]);

  // Estado para agregar ítem
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

  useEffect(() => {
    const total = itemsPedido.reduce(
      (sum, item) => sum + item.cantidad * item.precio_compra,
      0
    );
    setTotalEstimado(total);
  }, [itemsPedido]);

  const agregarItem = (producto) => {
    const existe = itemsPedido.find((it) => it.producto_id === producto.id);
    if (existe) {
      setItemsPedido(
        itemsPedido.map((it) =>
          it.producto_id === producto.id
            ? { ...it, cantidad: it.cantidad + parseFloat(cantidad) }
            : it
        )
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
        "warning"
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
        Swal.fire(
          "¡Éxito!",
          "Orden de Compra generada correctamente",
          "success"
        );
        navigate("/compras/ordenes");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar el pedido", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
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
          {/* COLUMNA IZQUIERDA: DATOS DE CABECERA */}
          <div className="col-md-4">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Datos del Pedido</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Proveedor</label>
                  <select
                    className="form-control"
                    value={proveedorSel}
                    onChange={(e) => setProveedorSel(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.empresa}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de Pedido</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Notas / Observaciones</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej: Entrega por la mañana..."
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Total Estimado</label>
                  <input
                    type="text"
                    className="form-control text-right font-weight-bold"
                    value={`$ ${totalEstimado.toLocaleString()}`}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary btn-block btn-lg shadow"
              onClick={handleGuardarOC}
            >
              <i className="fas fa-save mr-2"></i> REGISTRAR PEDIDO
            </button>
          </div>

          {/* COLUMNA DERECHA: DETALLE DE PRODUCTOS */}
          <div className="col-md-8">
            <div className="card card-outline card-success shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Ítems del Pedido</h3>
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
                <table className="table table-striped m-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center" style={{ width: "150px" }}>
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
                                        cantidad: parseFloat(e.target.value),
                                      }
                                    : i
                                )
                              )
                            }
                          />
                        </td>
                        <td className="text-right align-middle">
                          $ {parseFloat(it.precio_compra).toLocaleString()}
                        </td>
                        <td className="text-right align-middle font-weight-bold">
                          $ {(it.cantidad * it.precio_compra).toLocaleString()}
                        </td>
                        <td className="text-center align-middle">
                          <button
                            className="btn btn-danger btn-sm"
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
                          No hay productos agregados al pedido
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

      {/* MODAL BÚSQUEDA DE PRODUCTOS */}
      <div className="modal fade" id="modal-busqueda-prod" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">Buscar Producto para Pedido</h5>
              <button className="close text-white" data-dismiss="modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos
                      .filter((p) =>
                        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id}>
                          <td>{p.nombre}</td>
                          <td>{p.stock}</td>
                          <td style={{ width: "120px" }}>
                            <button
                              className="btn btn-primary btn-xs"
                              onClick={() => agregarItem(p)}
                            >
                              <i className="fas fa-plus"></i> Agregar
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
