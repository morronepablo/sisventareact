// src/pages/productos/CrearProducto.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearProducto = () => {
  const getArgentinaDate = () => {
    const ahora = new Date();
    const opciones = {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-CA", opciones).format(ahora);
  };

  const [categoria_id, setCategoriaId] = useState("");
  const [unidad_id, setUnidadId] = useState("");

  // --- 🚀 NUEVOS ESTADOS PARA GESTIÓN DE BULTOS ---
  const [unidad_compra_id, setUnidadCompraId] = useState("");
  const [factor_conversion, setFactorConversion] = useState("1");
  // -----------------------------------------------

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [nombre_corto, setNombreCorto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [stock, setStock] = useState("0");
  const [stock_minimo, setStockMinimo] = useState("0");
  const [stock_maximo, setStockMaximo] = useState("0");
  const [precio_compra, setPrecioCompra] = useState("0");
  const [aplicar_porcentaje, setAplicarPorcentaje] = useState(false);
  const [valor_porcentaje, setValorPorcentaje] = useState("0");
  const [precio_venta, setPrecioVenta] = useState("0");
  const [fecha_ingreso, setFechaIngreso] = useState(getArgentinaDate());
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get("/categorias");
        setCategorias(res.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    const fetchUnidades = async () => {
      try {
        const res = await api.get("/unidades");
        setUnidades(res.data);
      } catch (error) {
        console.error("Error al cargar unidades:", error);
      }
    };

    fetchCategorias();
    fetchUnidades();
  }, []);

  useEffect(() => {
    if (aplicar_porcentaje && valor_porcentaje) {
      const calculated =
        parseFloat(precio_compra) * (1 + parseFloat(valor_porcentaje) / 100);
      setPrecioVenta(calculated.toFixed(2));
    } else {
      setPrecioVenta(precio_compra);
    }
  }, [aplicar_porcentaje, valor_porcentaje, precio_compra]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo.trim())
      return Swal.fire("Error", "El código es obligatorio", "error");
    if (!nombre.trim())
      return Swal.fire("Error", "El nombre es obligatorio", "error");
    if (!precio_compra)
      return Swal.fire("Error", "El precio de compra es obligatorio", "error");
    if (!fecha_ingreso)
      return Swal.fire("Error", "La fecha de ingreso es obligatoria", "error");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("categoria_id", categoria_id);
      formData.append("unidad_id", unidad_id);

      // --- 🚀 INYECCIÓN DE DATOS DE CONVERSIÓN ---
      formData.append("unidad_compra_id", unidad_compra_id);
      formData.append("factor_conversion", factor_conversion);
      // ------------------------------------------

      formData.append("codigo", codigo.trim());
      formData.append("nombre", nombre.trim());
      formData.append("nombre_corto", nombre_corto || "");
      formData.append("descripcion", descripcion || "");
      formData.append("stock", stock);
      formData.append("stock_minimo", stock_minimo);
      formData.append("stock_maximo", stock_maximo);
      formData.append("precio_compra", precio_compra);
      formData.append("aplicar_porcentaje", aplicar_porcentaje ? "1" : "0");
      formData.append("valor_porcentaje", valor_porcentaje);
      formData.append("precio_venta", precio_venta);
      formData.append("fecha_ingreso", fecha_ingreso);

      if (imagen) {
        formData.append("imagen", imagen);
      }

      await api.post("/productos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Éxito!",
        text: "Producto creado correctamente",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "/productos/listado";
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al crear producto",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0 text-bold">Registro de un nuevo producto</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  Información de Producto e Inventario
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-9">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Categoría *</label>
                            <select
                              className="form-control"
                              value={categoria_id}
                              onChange={(e) => setCategoriaId(e.target.value)}
                              required
                            >
                              <option value="">Seleccione una categoría</option>
                              {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Código *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={codigo}
                              onChange={(e) => setCodigo(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Producto *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={nombre}
                              onChange={(e) => setNombre(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* --- 🚀 NUEVA FILA: GESTIÓN DE UNIDADES Y CONVERSIÓN --- */}
                      <div className="row bg-light p-2 mb-3 rounded border">
                        <div className="col-md-3">
                          <div className="form-group mb-0">
                            <label className="text-primary small text-bold">
                              UNIDAD DE VENTA (BASE) *
                            </label>
                            <select
                              className="form-control form-control-sm border-primary"
                              value={unidad_id}
                              onChange={(e) => setUnidadId(e.target.value)}
                              required
                            >
                              <option value="">Seleccione unidad...</option>
                              {unidades.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.nombre}
                                </option>
                              ))}
                            </select>
                            <small className="text-muted">
                              Como se vende al público.
                            </small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group mb-0">
                            <label className="text-info small text-bold">
                              UNIDAD DE COMPRA (BULTO)
                            </label>
                            <select
                              className="form-control form-control-sm border-info"
                              value={unidad_compra_id}
                              onChange={(e) =>
                                setUnidadCompraId(e.target.value)
                              }
                            >
                              <option value="">Igual a Unidad Base</option>
                              {unidades.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.nombre}
                                </option>
                              ))}
                            </select>
                            <small className="text-muted">
                              Como le compra al proveedor.
                            </small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group mb-0">
                            <label className="text-info small text-bold">
                              CONTENIDO X BULTO
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm border-info"
                              value={factor_conversion}
                              onChange={(e) =>
                                setFactorConversion(e.target.value)
                              }
                              step="0.01"
                              min="1"
                            />
                            <small className="text-muted">
                              Ej: Si es caja x 24, ponga 24.
                            </small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group mb-0">
                            <label className="small text-bold">
                              NOMBRE CORTO
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={nombre_corto}
                              onChange={(e) => setNombreCorto(e.target.value)}
                              placeholder="Alias para tickets"
                            />
                          </div>
                        </div>
                      </div>
                      {/* -------------------------------------------------------- */}

                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={descripcion}
                              onChange={(e) => setDescripcion(e.target.value)}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Stock *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={stock}
                              onChange={(e) => setStock(e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Stock Mínimo *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={stock_minimo}
                              onChange={(e) => setStockMinimo(e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Stock Máximo *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={stock_maximo}
                              onChange={(e) => setStockMaximo(e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Precio Compra *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={precio_compra}
                              onChange={(e) => setPrecioCompra(e.target.value)}
                              required
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group d-flex flex-column align-items-center">
                            <label>Porcentaje</label>
                            <input
                              type="checkbox"
                              checked={aplicar_porcentaje}
                              onChange={(e) =>
                                setAplicarPorcentaje(e.target.checked)
                              }
                              style={{
                                width: "20px",
                                height: "20px",
                                marginTop: "5px",
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Valor % *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={valor_porcentaje}
                              onChange={(e) =>
                                setValorPorcentaje(e.target.value)
                              }
                              required
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Precio Venta *</label>
                            <input
                              type="number"
                              className="form-control text-bold text-primary"
                              value={precio_venta}
                              onChange={(e) => setPrecioVenta(e.target.value)}
                              required
                              min="0"
                              step="0.01"
                              readOnly
                              style={{ fontSize: "1.1rem" }}
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Fecha Ingreso *</label>
                            <input
                              type="date"
                              className="form-control"
                              value={fecha_ingreso}
                              onChange={(e) => setFechaIngreso(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Imagen del Producto</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => setImagen(e.target.files[0])}
                        />
                        {imagen && (
                          <div className="mt-3 text-center">
                            <img
                              src={URL.createObjectURL(imagen)}
                              alt="Preview"
                              style={{ maxWidth: "100%", height: "150px" }}
                              className="img-thumbnail shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-top">
                  <button
                    type="button"
                    className="btn btn-secondary shadow-sm"
                    onClick={handleCancel}
                  >
                    <i className="fas fa-reply mr-1"></i> Volver
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary ml-2 shadow-sm"
                    disabled={loading}
                  >
                    <i className="fa-regular fa-floppy-disk mr-1"></i>
                    {loading ? "Procesando..." : "Registrar Producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearProducto;
