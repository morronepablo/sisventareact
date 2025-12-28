// src/pages/productos/VerProducto.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

const VerProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  // URL del backend para las imágenes
  const API_URL = "http://localhost:3001";

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

  if (loading)
    return (
      <div className="content-header">
        <div className="container-fluid">Cargando...</div>
      </div>
    );

  // FUNCIÓN PARA FORMATEAR LA FECHA A YYYY-MM-DD
  const formatFecha = (fecha) => {
    if (!fecha || fecha === "0000-00-00") return "";
    return fecha.split("T")[0]; // Toma solo la parte de la fecha si viene con hora
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
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Detalle del Producto</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="callout callout-info shadow">
              <div className="card-header">
                <h3 className="card-title text-info text-bold">
                  Datos Registrados
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-9">
                    {/* ... (Categoría, Código, Producto igual) */}
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Categoría</label>
                          <input
                            type="text"
                            className="form-control bg-white"
                            value={producto.categoria_nombre}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Código</label>
                          <input
                            type="text"
                            className="form-control bg-white"
                            value={producto.codigo}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Producto</label>
                          <input
                            type="text"
                            className="form-control bg-white"
                            value={producto.nombre}
                            disabled
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
                            className="form-control bg-white"
                            value={producto.nombre_corto || ""}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Unidad Medida</label>
                          <input
                            type="text"
                            className="form-control bg-white"
                            value={producto.unidad_nombre}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Descripción</label>
                          <textarea
                            className="form-control bg-white"
                            rows="2"
                            value={producto.descripcion || ""}
                            disabled
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      {/* ... Stock y Precios igual ... */}
                      <div className="col-md-2">
                        <div className="form-group">
                          <label>Stock</label>
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
                      </div>
                      <div className="col-md-2">
                        <div className="form-group">
                          <label>Precio Compra</label>
                          <input
                            type="text"
                            className="form-control bg-white text-right"
                            value={`$${parseFloat(
                              producto.precio_compra
                            ).toFixed(2)}`}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="form-group">
                          <label>Precio Venta</label>
                          <input
                            type="text"
                            className="form-control bg-white text-right"
                            value={`$${parseFloat(
                              producto.precio_venta
                            ).toFixed(2)}`}
                            disabled
                          />
                        </div>
                      </div>

                      {/* FECHA DE INGRESO CORREGIDA */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Fecha Ingreso</label>
                          <input
                            type="date"
                            className="form-control border-info bg-white"
                            value={formatFecha(producto.fecha_ingreso)} // <-- Limpieza aquí
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IMAGEN CORREGIDA CON API_URL */}
                  <div className="col-md-3 text-center">
                    <div className="form-group">
                      <label className="d-block">Imagen del Producto</label>
                      {producto.imagen ? (
                        <img
                          src={`${API_URL}${producto.imagen}`} // <-- CONCATENAR AQUÍ
                          alt={producto.nombre}
                          className="img-fluid rounded shadow-sm border"
                          style={{ maxHeight: "250px" }}
                        />
                      ) : (
                        <div className="p-5 border bg-light rounded text-muted">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-end">
                    <button
                      onClick={() => window.history.back()}
                      className="btn btn-secondary"
                    >
                      <i className="fas fa-reply"></i> Volver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerProducto;
