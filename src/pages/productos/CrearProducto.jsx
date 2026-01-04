// src/pages/productos/CrearProducto.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearProducto = () => {
  const [categoria_id, setCategoriaId] = useState("");
  const [unidad_id, setUnidadId] = useState("");
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
  const [fecha_ingreso, setFechaIngreso] = useState("");
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
        "error"
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
            <h1 className="m-0">Registro de un nuevo producto</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Ingrese los datos</h3>
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
                      <div className="row">
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Nombre Corto</label>
                            <input
                              type="text"
                              className="form-control"
                              value={nombre_corto}
                              onChange={(e) => setNombreCorto(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Unidad Medida *</label>
                            <select
                              className="form-control"
                              value={unidad_id}
                              onChange={(e) => setUnidadId(e.target.value)}
                              required
                            >
                              <option value="">Seleccione una unidad</option>
                              {unidades.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
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
                              className="form-control"
                              value={precio_venta}
                              onChange={(e) => setPrecioVenta(e.target.value)}
                              required
                              min="0"
                              step="0.01"
                              readOnly
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
                        <label>Imagen</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => setImagen(e.target.files[0])}
                        />
                        {imagen && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(imagen)}
                              alt="Preview"
                              width="100px"
                              className="img-fluid rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    <i className="fas fa-reply"></i> Volver
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary ml-2"
                    disabled={loading}
                  >
                    <i className="fa-regular fa-floppy-disk"></i> Registrar
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
