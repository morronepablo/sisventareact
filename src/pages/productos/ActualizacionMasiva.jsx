// src/pages/productos/ActualizacionMasiva.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ActualizacionMasiva = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState({ categoria_id: "", porcentaje: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const handleApply = async () => {
    if (!filtro.porcentaje)
      return Swal.fire("Error", "Ingrese un porcentaje", "error");

    const confirm = await Swal.fire({
      title: "¿Confirmar actualización?",
      text: `Esto aumentará el COSTO de los productos un ${filtro.porcentaje}% y recalculará los precios de venta. ¿Desea continuar?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffc107",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, aplicar ajuste",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await api.post("/productos/update-masivo", filtro);
        Swal.fire({
          icon: "success",
          title: "Proceso completado",
          text: res.data.message,
        });
        setFiltro({ ...filtro, porcentaje: "" }); // Limpiar campo
      } catch (e) {
        Swal.fire("Error", "No se pudo realizar la actualización.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>
            <i className="fas fa-percentage mr-2"></i>Ajuste Masivo de Precios
          </b>
        </h1>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="callout callout-warning shadow-sm">
              <h5>
                <i className="fas fa-info mr-2"></i> Información sobre el
                proceso
              </h5>
              <p>
                Este proceso aumentará el <b>Precio de Compra (Costo)</b>. Si el
                producto tiene activada la opción de "Porcentaje de Ganancia",
                el precio de venta se recalculará automáticamente para mantener
                el margen.
              </p>
            </div>

            <div className="card card-outline card-warning shadow">
              <div className="card-header">
                <h3 className="card-title">Configuración del Ajuste</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border text-warning"
                      role="status"
                    ></div>
                    <h4 className="mt-2">Procesando actualización masiva...</h4>
                    <p className="text-muted">
                      Por favor, no cierre el navegador.
                    </p>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-5">
                      <div className="form-group">
                        <label>Categoría</label>
                        <select
                          className="form-control"
                          value={filtro.categoria_id}
                          onChange={(e) =>
                            setFiltro({
                              ...filtro,
                              categoria_id: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Todas las categorías --</option>
                          {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Porcentaje de Aumento (%)</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={filtro.porcentaje}
                            placeholder="Ej: 10"
                            onChange={(e) =>
                              setFiltro({
                                ...filtro,
                                porcentaje: e.target.value,
                              })
                            }
                          />
                          <div className="input-group-append">
                            <span className="input-group-text">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <button
                        className="btn btn-warning btn-block mb-3 font-weight-bold"
                        onClick={handleApply}
                      >
                        <i className="fas fa-sync-alt mr-2"></i> Aplicar a{" "}
                        {filtro.categoria_id ? "Categoría" : "Todo"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer bg-white">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/productos/listado")}
                >
                  <i className="fas fa-reply mr-1"></i> Volver al listado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActualizacionMasiva;
