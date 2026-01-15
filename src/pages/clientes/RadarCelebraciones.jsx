// src/pages/clientes/RadarCelebraciones.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const RadarCelebraciones = () => {
  const [data, setData] = useState({ cumples: [], aniversarios: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get("/clientes/bi/celebraciones");
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar celebraciones:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🚀 FUNCIÓN ACTUALIZADA PARA ENVÍO DIRECTO DESDE EL BACKEND
  const enviarWhatsApp = async (cliente, tipo) => {
    // Mostrar spinner de carga bloqueante
    Swal.fire({
      title: "Enviando saludo...",
      text: "El Bot de WhatsApp está procesando el mensaje directo.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await api.post("/clientes/bi/celebraciones/whatsapp", {
        id: cliente.id,
        tipo: tipo,
      });

      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Enviado!",
          text: `El saludo de ${tipo.toLowerCase()} fue entregado correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error al enviar WS:", error);
      Swal.fire({
        icon: "error",
        title: "Fallo en el envío",
        text:
          error.response?.data?.message ||
          "No se pudo conectar con el servicio de WhatsApp",
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <i className="fas fa-gift text-danger mr-2"></i>
              <b>Radar de Celebraciones</b>
            </h1>
            <p className="text-muted">
              Marketing Automático: Fidelización en tiempo real
            </p>
          </div>
        </div>
        <hr />

        <div className="row">
          {/* SECCIÓN CUMPLEAÑOS */}
          <div className="col-md-6">
            <div className="card card-outline card-danger shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-birthday-cake mr-2 text-danger"></i>
                  Cumpleaños de Hoy
                </h3>
              </div>
              <div className="card-body">
                {data.cumples.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No hay cumpleaños registrados para hoy.
                  </p>
                ) : (
                  data.cumples.map((c) => (
                    <div
                      key={c.id}
                      className="info-box shadow-none border mb-3 animate__animated animate__fadeInLeft"
                    >
                      <span className="info-box-icon bg-danger elevation-1">
                        <i className="fas fa-cake-candles"></i>
                      </span>
                      <div className="info-box-content">
                        <span className="info-box-text font-weight-bold">
                          {c.nombre_cliente}
                        </span>
                        {/* 🚀 AHORA MUESTRA CUÁNTO CUMPLE */}
                        <span className="text-muted small">
                          ¡Cumple {c.edad} años hoy! 🎉
                        </span>
                        <button
                          className="btn btn-success btn-sm mt-1"
                          onClick={() => enviarWhatsApp(c, "CUMPLEAÑOS")}
                        >
                          <i className="fab fa-whatsapp mr-1"></i> Saludar por
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN ANIVERSARIOS */}
          <div className="col-md-6">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-medal mr-2 text-primary"></i>Aniversarios
                  como Cliente
                </h3>
              </div>
              <div className="card-body">
                {data.aniversarios.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No hay aniversarios para hoy.
                  </p>
                ) : (
                  data.aniversarios.map((a) => (
                    <div
                      key={a.id}
                      className="info-box shadow-none border mb-3 animate__animated animate__fadeInRight"
                    >
                      <span className="info-box-icon bg-primary elevation-1">
                        <i className="fas fa-award"></i>
                      </span>
                      <div className="info-box-content">
                        <span className="info-box-text font-weight-bold">
                          {a.nombre_cliente}
                        </span>
                        <span className="text-muted small">
                          ¡Cumple {a.años} {a.años > 1 ? "años" : "año"} con
                          nosotros!
                        </span>
                        <button
                          className="btn btn-success btn-sm mt-1"
                          onClick={() => enviarWhatsApp(a, "ANIVERSARIO")}
                        >
                          <i className="fab fa-whatsapp mr-1"></i> Enviar
                          Detalle
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="alert bg-dark text-white mt-4 border-left-danger shadow">
          <h5>
            <i className="fas fa-rocket mr-2 text-danger"></i>
            <b>Tip de BI: El poder de la gratitud</b>
          </h5>
          Un mensaje personalizado aumenta un 40% las chances de que el cliente
          visite el local en las próximas 48hs. ¡Aprovechá estos motivos para
          vender más!
        </div>
      </div>
    </div>
  );
};

export default RadarCelebraciones;
