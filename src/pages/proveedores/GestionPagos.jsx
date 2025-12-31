// src/pages/proveedores/GestionPagos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
// 1. Importamos el hook de notificaciones
import { useNotifications } from "../../context/NotificationContext";

const GestionPagos = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 2. Extraemos la función para refrescar deudas
  const { refreshProviderDebts } = useNotifications();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [totalPago, setTotalPago] = useState(0);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [distribucion, setDistribucion] = useState([]);

  // --- FUNCIÓN ROBUSTA PARA OBTENER SESIÓN ---
  const obtenerUsuarioActual = () => {
    const uStr =
      localStorage.getItem("usuario") || localStorage.getItem("user");
    if (uStr) return JSON.parse(uStr);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(window.atob(base64));
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const fetchPagos = async () => {
    try {
      const res = await api.get(`/proveedores/${id}/pagos`);
      setData(res.data);
      const distInitial = res.data.comprasPendientes.map((c) => ({
        compra_id: c.id,
        comprobante: c.comprobante,
        fecha: c.fecha,
        deuda: parseFloat(c.deuda),
        monto: 0,
      }));
      setDistribucion(distInitial);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [id]);

  const handleMontoChange = (index, valor) => {
    const nuevas = [...distribucion];
    const maxDeuda = nuevas[index].deuda;
    let monto = parseFloat(valor) || 0;
    if (monto > maxDeuda) monto = maxDeuda;
    nuevas[index].monto = monto;
    setDistribucion(nuevas);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const user = obtenerUsuarioActual();

    if (!user || !user.id) {
      return Swal.fire("Error", "Sesión de usuario no detectada", "error");
    }

    const sumaDistribuida = distribucion.reduce(
      (acc, curr) => acc + curr.monto,
      0
    );

    if (sumaDistribuida <= 0) {
      return Swal.fire(
        "Atención",
        "Asigne un monto a pagar en la tabla",
        "warning"
      );
    }

    try {
      const payload = {
        proveedor_id: id,
        usuario_id: user.id,
        empresa_id: user.empresa_id || 1,
        fecha,
        metodo_pago: metodoPago,
        distribucion: distribucion.filter((d) => d.monto > 0),
      };

      const response = await api.post(`/proveedores/${id}/pagos`, payload);

      if (response.data.success) {
        // 3. ACTUALIZACIÓN CRÍTICA DEL NAVBAR
        // Refrescamos mediante el hook y el evento global por seguridad
        if (refreshProviderDebts) refreshProviderDebts();
        window.dispatchEvent(new Event("forceRefreshNotifications"));

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Pago registrado y deuda actualizada",
          timer: 2000,
          showConfirmButton: false,
        });

        setTotalPago(0);
        fetchPagos(); // Recarga la tabla local
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "No se pudo procesar el pago";
      Swal.fire("Error", msg, "error");
    }
  };

  if (loading || !data)
    return (
      <div className="p-4 text-center">
        <h4>Cargando Gestión de Pagos...</h4>
      </div>
    );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Gestión de Pagos - {data.proveedor?.empresa}</b>
            </h1>
          </div>
        </div>
        <hr />

        {/* INFO BOXES */}
        <div className="row">
          <div className="col-md-4">
            <div className="info-box bg-light shadow-sm">
              <span className="info-box-icon bg-danger">
                <i className="fas fa-money-bill"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Deuda Total</span>
                <span className="info-box-number">
                  ${" "}
                  {parseFloat(data.resumen.deudaTotal).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="info-box bg-light shadow-sm">
              <span className="info-box-icon bg-success">
                <i className="fas fa-hand-holding-usd"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Pagos Realizados</span>
                <span className="info-box-number">
                  ${" "}
                  {parseFloat(data.resumen.pagosRealizados).toLocaleString(
                    "es-AR",
                    { minimumFractionDigits: 2 }
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="info-box bg-light shadow-sm">
              <span className="info-box-icon bg-warning">
                <i className="fas fa-balance-scale"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Saldo Pendiente</span>
                <span className="info-box-number">
                  ${" "}
                  {parseFloat(data.resumen.saldoPendiente).toLocaleString(
                    "es-AR",
                    { minimumFractionDigits: 2 }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULARIO REGISTRAR PAGO */}
        <div className="card card-outline card-success mt-3">
          <div className="card-header">
            <h3 className="card-title">Registrar Pago</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate("/proveedores/listado")}
              >
                <i className="fas fa-reply"></i> Volver
              </button>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleGuardar}>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Fecha del Pago</label>
                    <input
                      type="date"
                      className="form-control"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Total a Pagar</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control text-right font-weight-bold"
                      value={totalPago}
                      onChange={(e) =>
                        setTotalPago(parseFloat(e.target.value) || 0)
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
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="banco">Banco</option>
                    </select>
                  </div>
                </div>
              </div>

              <h4 className="mt-4">Distribuir Pago</h4>
              <div className="table-responsive" style={{ maxHeight: "250px" }}>
                <table className="table table-bordered table-sm table-hover">
                  <thead className="thead-light text-center">
                    <tr>
                      <th>Comprobante</th>
                      <th>Fecha</th>
                      <th className="text-right">Deuda</th>
                      <th style={{ width: "200px" }}>Monto a Pagar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distribucion.map((item, index) => (
                      <tr key={item.compra_id}>
                        <td className="align-middle">{item.comprobante}</td>
                        <td className="text-center align-middle">
                          {new Date(item.fecha).toLocaleDateString("es-AR")}
                        </td>
                        <td className="text-right align-middle">
                          ${" "}
                          {item.deuda.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm text-right bg-light"
                            value={item.monto}
                            onChange={(e) =>
                              handleMontoChange(index, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-4"
                disabled={data.resumen.saldoPendiente <= 0}
              >
                <i className="fas fa-save"></i> Registrar Pago
              </button>
            </form>
          </div>
        </div>

        {/* HISTORIAL DE PAGOS */}
        <div className="card card-outline card-info mt-4">
          <div className="card-header">
            <h3 className="card-title">Historial de Pagos</h3>
          </div>
          <div className="card-body p-0">
            <table className="table table-striped table-bordered table-hover mb-0">
              <thead className="thead-dark text-center">
                <tr>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {data.historial.map((h, i) => (
                  <tr key={i}>
                    <td className="text-center align-middle">
                      {new Date(h.fecha_pago).toLocaleDateString("es-AR")}
                    </td>
                    <td className="align-middle">{h.comprobante}</td>
                    <td className="text-right align-middle font-weight-bold">
                      ${" "}
                      {parseFloat(h.monto).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle text-capitalize">
                      {h.metodo_pago}
                    </td>
                    <td className="text-center align-middle">
                      {h.usuario_nombre || "Admin"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionPagos;
