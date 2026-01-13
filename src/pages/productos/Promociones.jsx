// src/pages/productos/Promociones.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";

const Promociones = () => {
  const [promos, setPromos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    producto_id: "",
    nombre_promo: "",
    tipo: "3x2",
  });

  const fetchData = async () => {
    try {
      const [resPr, resPd] = await Promise.all([
        api.get("/promociones"),
        api.get("/productos"),
      ]);
      setPromos(resPr.data);
      setProductos(resPd.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.producto_id)
      return Swal.fire("Error", "Seleccione un producto", "error");
    try {
      await api.post("/promociones", formData);
      Swal.fire("¡Éxito!", "Promoción activada", "success");
      fetchData();
    } catch (e) {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar promo?",
      icon: "warning",
      showCancelButton: true,
    });
    if (result.isConfirmed) {
      await api.delete(`/promociones/${id}`);
      fetchData();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Gestión de Promociones y Ofertas</b>
        </h1>
        <hr />
        <div className="row">
          <div className="col-md-4">
            <div className="card card-primary card-outline shadow">
              <div className="card-header">
                <h3 className="card-title">Nueva Promoción</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleGuardar}>
                  <div className="form-group">
                    <label>Producto</label>
                    <select
                      className="form-control select2"
                      value={formData.producto_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          producto_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Seleccione...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nombre de la Promo</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Oferta de Lunes"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombre_promo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Beneficio</label>
                    <select
                      className="form-control"
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
                    >
                      <option value="3x2">3x2 (Llevas 3, pagas 2)</option>
                      <option value="2da_al_70">
                        2da Unidad al 70% de Desc.
                      </option>
                      <option value="2da_al_50">
                        2da Unidad al 50% de Desc.
                      </option>
                      <option value="4x3">4x3 (Llevas 4, pagas 3)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    <b>ACTIVAR OFERTA</b>
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-dark">
                <h3 className="card-title">Promociones Activas</h3>
              </div>
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>Producto</th>
                      <th>Promo</th>
                      <th>Tipo</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.producto_nombre}</td>
                        <td>{p.nombre_promo || "-"}</td>
                        <td>
                          <span className="badge badge-success">
                            {p.tipo.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(p.id)}
                          >
                            <i className="fas fa-trash"></i>
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

export default Promociones;
