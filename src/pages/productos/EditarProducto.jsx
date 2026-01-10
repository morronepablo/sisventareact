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

  // URL dinámica según el entorno
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  // --- ESTADOS ---
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

  const [currentImagenUrl, setCurrentImagenUrl] = useState("");
  const [newImagenFile, setNewImagenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false); // 👈 ESTADO PARA EL SUBMIT
  const [loadingData, setLoadingData] = useState(true); // 👈 ESTADO PARA CARGA INICIAL
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

  // Cargar Producto
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await api.get(`/productos/${id}`);
        const prod = res.data;

        setCategoriaId(prod.categoria_id);
        setUnidadId(prod.unidad_id);
        setCodigo(prod.codigo || "");
        setNombre(prod.nombre);
        setNombreCorto(prod.nombre_corto || "");
        setDescripcion(prod.descripcion || "");
        setStock(prod.stock.toString());
        setStockMinimo(prod.stock_minimo.toString());
        setStockMaximo(prod.stock_maximo.toString());
        setPrecioCompra(prod.precio_compra.toString());
        setAplicarPorcentaje(
          prod.aplicar_porcentaje === 1 || prod.aplicar_porcentaje === true
        );
        setValorPorcentaje(prod.valor_porcentaje.toString());
        setPrecioVenta(prod.precio_venta.toString());
        setFechaIngreso(
          prod.fecha_ingreso ? prod.fecha_ingreso.split("T")[0] : ""
        );

        if (prod.imagen) {
          const fullUrl = prod.imagen.startsWith("http")
            ? prod.imagen
            : `${API_URL}${prod.imagen}`;
          setCurrentImagenUrl(fullUrl);
        }

        setLoadingData(false);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar el producto", "error").then(
          () => {
            navigate("/productos/listado");
          }
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

    // --- ACTIVAR SPINNER ---
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("categoria_id", categoria_id);
      formData.append("unidad_id", unidad_id);
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

      // La petición PUT enviará la imagen a Cloudinary (vía Backend)
      await api.put(`/productos/${id}`, formData);

      // Refrescamos notificaciones antes de cerrar el spinner
      if (refreshAll) await refreshAll();

      setLoading(false); // 👈 APAGAR SPINNER AL TERMINAR

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Producto e imagen actualizados en la nube.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresco duro de Windows para sincronizar Navbar
      window.location.href = "/productos/listado";
    } catch (error) {
      setLoading(false); // Apagar spinner si hay error
      Swal.fire(
        "Error",
        error.response?.data?.message || "Fallo al actualizar",
        "error"
      );
    }
  };

  // --- RENDERIZADO DEL SPINNER ---
  if (loading || loadingData) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1 className="mb-3">Actualizar un producto</h1>
        <div className="card card-outline card-success shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Ingrese los datos</h3>
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

                  <div className="row">
                    <div className="col-md-3 form-group">
                      <label>Nombre Corto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nombre_corto}
                        onChange={(e) => setNombreCorto(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3 form-group">
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
                    <div className="col-md-6 form-group">
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
                        className="form-control bg-light"
                        value={precio_venta}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Vista previa de imagen */}
                <div className="col-md-3 text-center border-left">
                  <div className="form-group">
                    <label>Imagen del Producto</label>
                    <div className="mb-3">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ height: "150px", objectFit: "contain" }}
                        />
                      ) : currentImagenUrl ? (
                        <img
                          src={currentImagenUrl}
                          alt="Actual"
                          className="img-thumbnail"
                          style={{ height: "150px", objectFit: "contain" }}
                        />
                      ) : (
                        <div
                          className="border d-flex align-items-center justify-content-center bg-light"
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
                        Cambiar...
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                <i className="fas fa-reply"></i> Volver
              </button>
              <button
                type="submit"
                className="btn btn-success ml-2"
                disabled={loading}
              >
                <i className="fa-regular fa-floppy-disk"></i>{" "}
                {loading ? "Procesando..." : "Actualizar Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProducto;
