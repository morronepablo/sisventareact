// src/pages/arqueos/MonitorRealTime.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const MonitorRealTime = () => {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función de formateo profesional (Regla de Oro: 2 decimales + Millares)
  const formatARS = (val) =>
    `$ ${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cargarCajas = async () => {
    try {
      const res = await api.get("/arqueos/monitor-vivo");
      setCajas(res.data);
    } catch (err) {
      console.error("Error al cargar cajas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCajas();
    // Auto-refresh cada 30 segundos para monitoreo constante
    const interval = setInterval(cargarCajas, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetiro = async (caja) => {
    const { value: formValues } = await Swal.fire({
      title: `Retiro de Efectivo - Caja ${caja.caja_id}`,
      html:
        `<label className="text-sm">Monto a retirar (Máx: ${formatARS(
          caja.efectivo_actual
        )})</label>` +
        '<input id="swal-input1" class="swal2-input" type="number" step="0.01" placeholder="0.00">' +
        '<label className="text-sm mt-2">Motivo del retiro</label>' +
        '<input id="swal-input2" class="swal2-input" placeholder="Ej: Retiro parcial de seguridad">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Confirmar Retiro",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      preConfirm: () => {
        const monto = document.getElementById("swal-input1").value;
        const motivo = document.getElementById("swal-input2").value;
        if (!monto || monto <= 0) {
          Swal.showValidationMessage("Por favor ingrese un monto válido");
        }
        return [monto, motivo];
      },
    });

    if (formValues) {
      const [monto, motivo] = formValues;

      if (parseFloat(monto) > parseFloat(caja.efectivo_actual)) {
        return Swal.fire(
          "Error",
          "No puedes retirar más efectivo del que hay en el cajón",
          "error"
        );
      }

      try {
        Swal.fire({
          title: "Procesando retiro...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await api.post("/arqueos/retiro-parcial", {
          arqueo_id: caja.arqueo_id,
          monto: monto,
          motivo: motivo || "Retiro de seguridad",
          caja_id: caja.caja_id,
        });

        Swal.fire(
          "¡Éxito!",
          `Se retiraron ${formatARS(
            monto
          )}. El monto esperado para el cierre se ha actualizado.`,
          "success"
        );
        cargarCajas();
      } catch (e) {
        Swal.fire("Error", "No se pudo registrar el retiro", "error");
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3 pb-5">
      <div className="row mb-4">
        <div className="col-sm-6">
          <h1 className="m-0 text-bold">
            <i className="fas fa-video text-primary mr-2"></i> Monitor de Cajas
            en Vivo
          </h1>
        </div>
      </div>

      <div className="row">
        {cajas.length > 0 ? (
          cajas.map((c) => (
            <div className="col-md-6 col-lg-4" key={c.arqueo_id}>
              <div
                className={`card shadow-lg ${
                  parseFloat(c.efectivo_actual) > 50000
                    ? "card-warning"
                    : "card-primary"
                } card-outline`}
              >
                <div className="card-header">
                  <h3 className="card-title text-bold">Caja N° {c.caja_id}</h3>
                  <div className="card-tools">
                    <span className="badge badge-success px-2 py-1">
                      <i className="fas fa-circle text-xs mr-1"></i> EN LÍNEA
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-light rounded-circle p-3 mr-3">
                      <i className="fas fa-user-tie fa-lg text-secondary"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 text-bold">{c.cajero}</h6>
                      <small className="text-muted">
                        Inicio:{" "}
                        {new Date(c.fecha_apertura).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>

                  <div className="border rounded p-3 bg-light shadow-sm mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Efectivo en Cajón:</span>
                      <span className="text-xl text-bold text-success">
                        {formatARS(c.efectivo_actual)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center text-sm">
                      <span className="text-muted">Ventas Digitales:</span>
                      <span className="text-bold text-dark">
                        {formatARS(c.total_digital)}
                      </span>
                    </div>
                  </div>

                  {parseFloat(c.total_retiros) > 0 && (
                    <div
                      className="info-box bg-lighter shadow-none border mb-0 py-1"
                      style={{ minHeight: "50px" }}
                    >
                      <span
                        className="info-box-icon text-info"
                        style={{ width: "40px" }}
                      >
                        <i className="fas fa-shield-alt"></i>
                      </span>
                      <div className="info-box-content">
                        <span className="info-box-text text-xs">
                          Retiros de Seguridad
                        </span>
                        <span className="info-box-number text-sm">
                          {formatARS(c.total_retiros)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white">
                  <button
                    className="btn btn-danger btn-block text-bold shadow-sm"
                    onClick={() => handleRetiro(c)}
                  >
                    <i className="fas fa-hand-holding-usd mr-1"></i> REALIZAR
                    RETIRO PARCIAL
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="text-muted mb-3">
              <i className="fas fa-cash-register fa-5x opacity-2"></i>
            </div>
            <h4 className="text-muted">
              No hay cajas operando en este momento.
            </h4>
            <p className="text-sm">
              El monitor mostrará datos automáticamente cuando se abra una caja.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorRealTime;
