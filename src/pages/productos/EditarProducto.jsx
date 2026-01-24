// src/pages/productos/EditarProducto.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNotifications } from "../../context/NotificationContext";

const EditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAll } = useNotifications();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  // --- ESTADOS ---
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
  const [fecha_ingreso, setFechaIngreso] = useState("");

  const [currentImagenUrl, setCurrentImagenUrl] = useState("");
  const [newImagenFile, setNewImagenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);

  // Cargar Categorías y Unidades
  useEffect(() => {
    const fetchDataInitial = async () => {
      try {
        const [resCat, resUni] = await Promise.all([
          api.get("/categorias"),
          api.get("/unidades"),
        ]);
        setCategorias(resCat.data);
        setUnidades(resUni.data);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };
    fetchDataInitial();
  }, []);

  // Cargar Producto (Inyectamos los nuevos campos en la carga)
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await api.get(`/productos/${id}`);
        const prod = res.data;

        setCategoriaId(prod.categoria_id);
        setUnidadId(prod.unidad_id);

        // --- 🚀 CARGA DE DATOS DE CONVERSIÓN ---
        setUnidadCompraId(prod.unidad_compra_id || "");
        setFactorConversion(prod.factor_conversion?.toString() || "1");
        // --------------------------------------

        setCodigo(prod.codigo || "");
        setNombre(prod.nombre);
        setNombreCorto(prod.nombre_corto || "");
        setDescripcion(prod.descripcion || "");
        setStock(prod.stock.toString());
        setStockMinimo(prod.stock_minimo.toString());
        setStockMaximo(prod.stock_maximo.toString());
        setPrecioCompra(prod.precio_compra.toString());
        setAplicarPorcentaje(
          prod.aplicar_porcentaje === 1 || prod.aplicar_porcentaje === true,
        );
        setValorPorcentaje(prod.valor_porcentaje.toString());
        setPrecioVenta(prod.precio_venta.toString());
        setFechaIngreso(
          prod.fecha_ingreso ? prod.fecha_ingreso.split("T")[0] : "",
        );

        if (prod.imagen) {
          const fullUrl = prod.imagen.startsWith("http")
            ? prod.imagen
            : `${API_URL}${prod.imagen}`;
          setCurrentImagenUrl(fullUrl);
        }

        setLoadingData(false);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar el producto", "error").then(() =>
          navigate("/productos/listado"),
        );
      }
    };
    fetchProducto();
  }, [id]);

  // Cálculo de precio de venta automático
  useEffect(() => {
    if (aplicar_porcentaje && valor_porcentaje) {
      const calculated =
        parseFloat(precio_compra) * (1 + parseFloat(valor_porcentaje) / 100);
      setPrecioVenta(calculated.toFixed(2));
    } else {
      setPrecioVenta(precio_compra);
    }
  }, [aplicar_porcentaje, valor_porcentaje, precio_compra]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImagenFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !codigo?.trim() ||
      !nombre?.trim() ||
      !precio_compra ||
      !fecha_ingreso
    ) {
      Swal.fire("Error", "Complete los campos obligatorios", "error");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("categoria_id", categoria_id);
      formData.append("unidad_id", unidad_id);

      // --- 🚀 ENVÍO DE DATOS DE CONVERSIÓN ---
      formData.append("unidad_compra_id", unidad_compra_id);
      formData.append("factor_conversion", factor_conversion);
      // ---------------------------------------

      formData.append("codigo", codigo.trim());
      formData.append("nombre", nombre.trim());
      formData.append("nombre_corto", nombre_corto);
      formData.append("descripcion", descripcion);
      formData.append("stock", stock);
      formData.append("stock_minimo", stock_minimo);
      formData.append("stock_maximo", stock_maximo);
      formData.append("precio_compra", precio_compra);
      formData.append("aplicar_porcentaje", aplicar_porcentaje ? "1" : "0");
      formData.append("valor_porcentaje", valor_porcentaje);
      formData.append("precio_venta", precio_venta);
      formData.append("fecha_ingreso", fecha_ingreso);

      if (newImagenFile) {
        formData.append("imagen", newImagenFile);
      }

      await api.put(`/productos/${id}`, formData);

      if (refreshAll) await refreshAll();

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Producto actualizado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      window.location.href = "/productos/listado";
    } catch (error) {
      setLoading(false);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Fallo al actualizar",
        "error",
      );
    }
  };

  if (loading || loadingData) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1 className="mb-3 text-bold">Actualizar un producto</h1>
        <div className="card card-outline card-success shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-bold">
              Edición de Información e Inventario
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="card-body">
              <div className="row">
                <div className="col-md-9">
                  <div className="row">
                    <div className="col-md-4 form-group">
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
                    <div className="col-md-4 form-group">
                      <label>Código *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4 form-group">
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

                  {/* --- 🚀 FILA REFACTORIZADA: GESTIÓN DE UNIDADES Y CONVERSIÓN --- */}
                  <div className="row bg-light p-2 mb-3 rounded border">
                    <div className="col-md-3 form-group mb-0">
                      <label className="text-primary small text-bold">
                        UNIDAD VENTA (BASE) *
                      </label>
                      <select
                        className="form-control form-control-sm border-primary"
                        value={unidad_id}
                        onChange={(e) => setUnidadId(e.target.value)}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {unidades.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3 form-group mb-0">
                      <label className="text-info small text-bold">
                        UNIDAD COMPRA (BULTO)
                      </label>
                      <select
                        className="form-control form-control-sm border-info"
                        value={unidad_compra_id}
                        onChange={(e) => setUnidadCompraId(e.target.value)}
                      >
                        <option value="">Igual a Venta</option>
                        {unidades.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3 form-group mb-0">
                      <label className="text-info small text-bold">
                        CONTENIDO X BULTO
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm border-info"
                        value={factor_conversion}
                        onChange={(e) => setFactorConversion(e.target.value)}
                        step="0.01"
                        min="1"
                      />
                    </div>
                    <div className="col-md-3 form-group mb-0">
                      <label className="small text-bold">NOMBRE CORTO</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={nombre_corto}
                        onChange={(e) => setNombreCorto(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12 form-group">
                      <label>Descripción</label>
                      <textarea
                        className="form-control"
                        rows="1"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-2 form-group">
                      <label>Stock *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2 form-group">
                      <label>Stock Mín. *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={stock_minimo}
                        onChange={(e) => setStockMinimo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2 form-group">
                      <label>Precio Compra *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={precio_compra}
                        onChange={(e) => setPrecioCompra(e.target.value)}
                        required
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-2 form-group text-center">
                      <label>Porcentaje</label>
                      <br />
                      <input
                        type="checkbox"
                        checked={aplicar_porcentaje}
                        onChange={(e) => setAplicarPorcentaje(e.target.checked)}
                        style={{ width: "20px", height: "20px" }}
                      />
                    </div>
                    <div className="col-md-2 form-group">
                      <label>Valor %</label>
                      <input
                        type="number"
                        className="form-control"
                        value={valor_porcentaje}
                        onChange={(e) => setValorPorcentaje(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2 form-group">
                      <label>Precio Venta</label>
                      <input
                        type="number"
                        className="form-control bg-light text-bold text-success"
                        value={precio_venta}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-3 text-center border-left">
                  <div className="form-group">
                    <label>Imagen del Producto</label>
                    <div className="mb-3">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="img-thumbnail shadow-sm"
                          style={{ height: "150px", objectFit: "contain" }}
                        />
                      ) : currentImagenUrl ? (
                        <img
                          src={currentImagenUrl}
                          alt="Actual"
                          className="img-thumbnail shadow-sm"
                          style={{ height: "150px", objectFit: "contain" }}
                        />
                      ) : (
                        <div
                          className="border d-flex align-items-center justify-content-center bg-light shadow-inner"
                          style={{ height: "150px" }}
                        >
                          <span className="text-muted">SIN IMAGEN</span>
                        </div>
                      )}
                    </div>
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="customFile"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label className="custom-file-label" htmlFor="customFile">
                        Cambiar imagen...
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer bg-white border-top">
              <button
                type="button"
                className="btn btn-secondary shadow-sm"
                onClick={() => navigate(-1)}
              >
                <i className="fas fa-reply mr-1"></i> Volver
              </button>
              <button
                type="submit"
                className="btn btn-success ml-2 shadow-sm text-bold"
                disabled={loading}
              >
                <i className="fa-regular fa-floppy-disk mr-1"></i>
                {loading ? "Actualizando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProducto;
