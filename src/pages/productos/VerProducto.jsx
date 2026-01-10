// src/pages/productos/VerProducto.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  // URL dinámica: Si detecta que estás en Vercel, usa Render. Si no, localhost.
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/productos/${id}`);
        setProducto(res.data);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!producto) return <div className="p-3">Producto no encontrado.</div>;

  // FUNCIÓN PARA FORMATEAR LA FECHA
  const formatFecha = (fecha) => {
    if (!fecha || fecha === "0000-00-00") return "Sin fecha";
    return fecha.split("T")[0];
  };

  const getColorForStock = (stock, stockMinimo) => {
    const diferencia = stock - stockMinimo;
    if (diferencia <= 0) {
      return {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
        color: "rgb(200, 0, 0)",
      };
    } else if (diferencia <= 10) {
      return {
        backgroundColor: "rgba(233, 231, 16, 0.15)",
        color: "rgb(180, 160, 0)",
      };
    } else {
      return {
        backgroundColor: "rgba(0, 255, 0, 0.15)",
        color: "rgb(0, 150, 0)",
      };
    }
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1 className="mb-3">Detalle del Producto</h1>
        <div className="card card-outline card-info shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-info text-bold">
              Datos Registrados
            </h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-4 form-group">
                    <label>Categoría</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.categoria_nombre}
                      disabled
                    />
                  </div>
                  <div className="col-md-4 form-group">
                    <label>Código</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.codigo}
                      disabled
                    />
                  </div>
                  <div className="col-md-4 form-group">
                    <label>Producto</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.nombre}
                      disabled
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3 form-group">
                    <label>Nombre Corto</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.nombre_corto || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Unidad Medida</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={producto.unidad_nombre}
                      disabled
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Descripción</label>
                    <textarea
                      className="form-control bg-light"
                      rows="1"
                      value={producto.descripcion || ""}
                      disabled
                    ></textarea>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-2 form-group">
                    <label>Stock Actual</label>
                    <input
                      type="text"
                      className="form-control"
                      value={producto.stock}
                      disabled
                      style={{
                        ...getColorForStock(
                          producto.stock,
                          producto.stock_minimo
                        ),
                        fontWeight: "bold",
                      }}
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Precio Compra</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={`$ ${parseFloat(
                        producto.precio_compra
                      ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
                      disabled
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Precio Venta</label>
                    <input
                      type="text"
                      className="form-control bg-light font-weight-bold text-primary"
                      value={`$ ${parseFloat(
                        producto.precio_venta
                      ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
                      disabled
                    />
                  </div>
                  <div className="col-md-3 form-group">
                    <label>Fecha Ingreso</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={formatFecha(producto.fecha_ingreso)}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* LÓGICA DE IMAGEN COMPATIBLE CON CLOUDINARY 👇 */}
              <div className="col-md-3 text-center border-left">
                <label className="d-block">Imagen del Producto</label>
                {producto.imagen ? (
                  <img
                    src={
                      producto.imagen.startsWith("http")
                        ? producto.imagen
                        : `${API_URL}${producto.imagen}`
                    }
                    alt={producto.nombre}
                    className="img-fluid rounded shadow-sm border"
                    style={{ maxHeight: "200px", objectFit: "contain" }}
                  />
                ) : (
                  <div
                    className="border d-flex align-items-center justify-content-center bg-light rounded"
                    style={{ height: "180px" }}
                  >
                    <span className="text-muted">SIN IMAGEN</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              <i className="fas fa-reply"></i> Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerProducto;
