// src/pages/configuracion/WhatsAppConfig.jsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const WhatsAppConfig = () => {
  const [status, setStatus] = useState("LOADING");
  const [qrCode, setQrCode] = useState("");

  const checkStatus = async () => {
    try {
      const res = await api.get("/whatsapp-status");
      setStatus(res.data.status);
      if (res.data.status === "QR_READY") {
        setQrCode(res.data.qr);
      }
    } catch (error) {
      console.error("Error al obtener estado de WhatsApp", error);
    }
  };

  // --- NUEVA FUNCIÓN PARA DESCONECTAR ---
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto desvinculará tu teléfono y dejarás de recibir notificaciones.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desconectar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        setStatus("LOADING"); // Mostramos el spinner mientras procesa
        await api.post("/whatsapp-logout");
        Swal.fire(
          "Desconectado",
          "Se ha cerrado la sesión de WhatsApp.",
          "success"
        );
      } catch (error) {
        Swal.fire("Error", "No se pudo cerrar la sesión.", "error");
        checkStatus(); // Refrescamos el estado por si acaso
      }
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Configuración de WhatsApp</b>
        </h1>
        <hr />
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Vinculación del Sistema</h3>
          </div>
          <div className="card-body text-center">
            {status === "LOADING" && (
              <div>
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="mt-2">Iniciando motor de WhatsApp...</p>
              </div>
            )}

            {status === "QR_READY" && (
              <div>
                <h5>
                  <b>Escanea este código con tu WhatsApp</b>
                </h5>
                <p className="text-muted">
                  Ve a Configuración {">"} Dispositivos vinculados
                </p>
                <img
                  src={qrCode}
                  alt="QR WhatsApp"
                  className="img-thumbnail shadow"
                  style={{ width: "300px" }}
                />
              </div>
            )}

            {status === "CONNECTED" && (
              <div className="py-4">
                <i
                  className="fas fa-check-circle text-success"
                  style={{ fontSize: "5rem" }}
                ></i>
                <h3 className="mt-3 text-success">
                  <b>¡SISTEMA VINCULADO!</b>
                </h3>
                <p>
                  Tu WhatsApp está conectado y listo para enviar notificaciones
                  de stock.
                </p>
                {/* BOTÓN CON FUNCIONALIDAD REAL */}
                <button
                  className="btn btn-outline-danger mt-3"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt mr-1"></i> Desconectar
                  WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfig;
