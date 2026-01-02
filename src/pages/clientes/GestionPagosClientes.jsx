// src/pages/clientes/GestionPagosClientes.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNotifications } from "../../context/NotificationContext";

const GestionPagosClientes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshClientDebts } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Función para obtener la fecha actual en formato local AAAA-MM-DD
  const getTodayDate = () => new Date().toLocaleDateString("en-CA");

  // --- ESTADOS PARA REGISTRO NUEVO ---
  const [formData, setFormData] = useState({
    fecha: getTodayDate(), // Fecha actual por defecto
    importe: "",
    metodo_pago: "efectivo",
  });

  // --- ESTADOS PARA EDICIÓN ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPagoId, setSelectedPagoId] = useState(null);
  const [editData, setEditData] = useState({
    fecha: getTodayDate(),
    importe: "",
    metodo_pago: "efectivo",
  });

  const fetchDatos = async () => {
    try {
      const res = await api.get(`/clientes/${id}/pagos`);
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cargar la información", "error");
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [id]);

  // SINCRONIZACIÓN DE TOOLTIPS (Bootstrap/jQuery)
  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => {
        if (window.$) {
          window.$('[data-bs-toggle="tooltip"]').tooltip();
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        if (window.$) {
          window.$('[data-bs-toggle="tooltip"]').tooltip("dispose");
        }
      };
    }
  }, [loading, data, showEditModal]);

  // FUNCION REGISTRAR PAGO NUEVO
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.cajaAbierta) {
      return Swal.fire("Atención", "No hay una caja abierta", "warning");
    }

    if (parseFloat(formData.importe) > data.resumen.saldo) {
      return Swal.fire(
        "Error",
        "El importe supera el saldo pendiente",
        "error"
      );
    }

    try {
      const res = await api.post(`/clientes/${id}/pagos`, formData);
      if (res.data.success) {
        const token = localStorage.getItem("token");
        const url = `${api.defaults.baseURL}/clientes/pagos/ticket/${res.data.pago_id}?token=${token}`;
        window.open(url, "_blank");

        if (refreshClientDebts) refreshClientDebts();
        window.dispatchEvent(new Event("forceRefreshNotifications"));

        Swal.fire({
          icon: "success",
          title: "Registrado",
          text: "Pago registrado correctamente",
          timer: 2000,
          showConfirmButton: false,
        });

        // Resetear formulario con fecha actual nuevamente
        setFormData({
          fecha: getTodayDate(),
          importe: "",
          metodo_pago: "efectivo",
        });
        fetchDatos();
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar el pago", "error");
    }
  };

  // FUNCIONES PARA EDICIÓN
  const handleOpenEdit = (m) => {
    setSelectedPagoId(m.id);
    setEditData({
      fecha: getTodayDate(), // Se pone la fecha actual por defecto al abrir para editar
      importe: m.importe,
      metodo_pago: m.metodo_pago || "efectivo",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/clientes/pagos/${selectedPagoId}`, editData);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "El pago se modificó correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
        setShowEditModal(false);
        fetchDatos();
        if (refreshClientDebts) refreshClientDebts();
        window.dispatchEvent(new Event("forceRefreshNotifications"));
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo actualizar",
        "error"
      );
    }
  };

  if (loading) return <div className="p-4">Cargando gestión de pagos...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Gestión de Pagos - {data.cliente.nombre_cliente}</b>
            </h1>
          </div>
        </div>
        <hr />

        {/* Info Boxes Resumen */}
        <div className="row">
          <div className="col-md-3">
            <div className="info-box bg-light shadow-sm">
              <span className="info-box-icon bg-danger">
                <i className="fas fa-money-bill"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Deuda Total</span>
                <span className="info-box-number">
                  ${" "}
                  {parseFloat(data.resumen.deuda || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box bg-light shadow-sm">
              <span className="info-box-icon bg-success">
                <i className="fas fa-hand-holding-usd"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Pagos Realizados</span>
                <span className="info-box-number">
                  ${" "}
                  {parseFloat(data.resumen.pagos || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box bg-light shadow-sm">
              <span className="info-box-icon bg-warning">
                <i className="fas fa-balance-scale"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Saldo Pendiente</span>
                <span className="info-box-number">
                  ${" "}
                  {parseFloat(data.resumen.saldo || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box bg-light shadow-sm">
              <span className="info-box-icon bg-info">
                <i className="fas fa-calendar-day"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Días de Mora</span>
                <span className="info-box-number">
                  {data.resumen.saldo > 0
                    ? `${data.resumen.diasMora} días`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario Registrar Pago */}
        <div className="card card-outline card-success mt-3 shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Registrar Pago</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(-1)}
              >
                <i className="fas fa-reply"></i> Volver
              </button>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Fecha del Pago</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Importe</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control text-right"
                      placeholder="0.00"
                      value={formData.importe}
                      onChange={(e) =>
                        setFormData({ ...formData, importe: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Método de Pago</label>
                    <select
                      className="form-control"
                      value={formData.metodo_pago}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metodo_pago: e.target.value,
                        })
                      }
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={data.resumen.saldo <= 0}
              >
                <i className="fas fa-save"></i> Registrar Pago
              </button>
            </form>
          </div>
        </div>

        {/* Historial de Movimientos */}
        <div className="card card-outline card-info mt-4 shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Historial de Movimientos</h3>
          </div>
          <div className="card-body p-0">
            <div
              className="table-responsive"
              style={{ maxHeight: "350px", overflowY: "auto" }}
            >
              <table className="table table-striped table-bordered table-hover mb-0 table-sm">
                <thead className="thead-dark text-center sticky-top">
                  <tr>
                    <th style={{ width: "120px" }}>Fecha</th>
                    <th style={{ width: "100px" }}>Tipo</th>
                    <th>Importe</th>
                    <th>Método</th>
                    <th>Venta Ticket</th>
                    <th style={{ width: "120px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movimientos.map((m) => (
                    <tr key={m.id}>
                      <td className="text-center align-middle">
                        {new Date(m.fecha).toLocaleDateString("es-AR")}
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`badge badge-${
                            m.tipo === "deuda" ? "danger" : "success"
                          }`}
                        >
                          {m.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right align-middle">
                        ${" "}
                        {parseFloat(m.importe).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-center align-middle text-capitalize">
                        {m.metodo_pago || "N/A"}
                      </td>
                      <td className="text-center align-middle">
                        {m.venta_id
                          ? `T ${m.venta_id.toString().padStart(8, "0")}`
                          : "N/A"}
                      </td>
                      <td className="text-center align-middle">
                        {m.tipo === "pago" && (
                          <div className="btn-group">
                            <button
                              className="btn btn-success btn-sm"
                              data-bs-toggle="tooltip"
                              title="Editar Pago"
                              onClick={() => handleOpenEdit(m)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              data-bs-toggle="tooltip"
                              title="Reimprimir Ticket"
                              onClick={() => {
                                const token = localStorage.getItem("token");
                                const url = `${api.defaults.baseURL}/clientes/pagos/ticket/${m.id}?token=${token}`;
                                window.open(url, "_blank");
                              }}
                            >
                              <i className="fas fa-print"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {showEditModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Editar Pago</h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={() => setShowEditModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Fecha del Pago</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editData.fecha}
                      onChange={(e) =>
                        setEditData({ ...editData, fecha: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Importe</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control text-right font-weight-bold"
                      value={editData.importe}
                      onChange={(e) =>
                        setEditData({ ...editData, importe: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Método de Pago</label>
                    <select
                      className="form-control"
                      value={editData.metodo_pago}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          metodo_pago: e.target.value,
                        })
                      }
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cerrar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i> Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPagosClientes;
