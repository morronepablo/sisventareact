// src/pages/clientes/VerCliente.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await api.get(`/clientes/${id}`);
        setCliente(response.data);
      } catch (error) {
        console.error("Error al cargar el cliente:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCliente();
  }, [id]);

  // Función robusta para formatear fecha (evita Invalid Date)
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "No registrada";
    try {
      const soloFecha = fechaStr.split("T")[0];
      const parts = soloFecha.split("-");
      if (parts.length !== 3) return "No registrada";
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch (e) {
      return "No registrada";
    }
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);

  if (loading) return <LoadingSpinner />;
  if (!cliente)
    return (
      <div className="p-4 text-center">
        <h5>Cliente no encontrado.</h5>
      </div>
    );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-sm-6">
            <h1 className="m-0">
              <i className="fas fa-user-circle text-info mr-2"></i>
              <b>Perfil del Cliente</b>
            </h1>
          </div>
          <div className="col-sm-6 text-right">
            <button
              onClick={() => navigate("/clientes/listado")}
              className="btn btn-secondary shadow-sm"
            >
              <i className="fas fa-reply mr-1"></i> Volver al Listado
            </button>
          </div>
        </div>
        <hr />

        <div className="row">
          {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
          <div className="col-md-7">
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Información Personal</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small uppercase">
                      Nombre Completo
                    </label>
                    <p className="h5 border-bottom pb-2">
                      {cliente.nombre_cliente}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small uppercase">
                      C.U.I.L. / D.N.I.
                    </label>
                    <p className="h5 border-bottom pb-2">
                      {cliente.cuil_codigo}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small uppercase">
                      Teléfono de Contacto
                    </label>
                    <p className="h5 border-bottom pb-2">
                      <i className="fab fa-whatsapp text-success mr-1"></i>{" "}
                      {cliente.telefono || "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small uppercase">
                      Correo Electrónico
                    </label>
                    <p className="h5 border-bottom pb-2">
                      {cliente.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small uppercase">
                      Fecha de Nacimiento
                    </label>
                    <p className="h5 border-bottom pb-2">
                      <i className="fas fa-birthday-cake text-danger mr-2"></i>
                      {formatFecha(cliente.fecha_nacimiento)}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small uppercase">
                      Cliente desde
                    </label>
                    <p className="h5 border-bottom pb-2">
                      {new Date(cliente.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN FINANCIERO BI */}
          <div className="col-md-5">
            <div className="card card-outline card-success shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Estado de Cuenta</h3>
              </div>
              <div className="card-body">
                <div className="info-box shadow-none border bg-light mb-3">
                  <span className="info-box-icon bg-success elevation-1">
                    <i className="fas fa-wallet"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text text-bold">
                      Billetera Virtual
                    </span>
                    <span className="info-box-number h4 text-success">
                      {formatMoney(cliente.saldo_billetera)}
                    </span>
                  </div>
                </div>

                <div className="info-box shadow-none border bg-light mb-3">
                  <span className="info-box-icon bg-danger elevation-1">
                    <i className="fas fa-hand-holding-usd"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text text-bold">
                      Deuda en Cta. Cte.
                    </span>
                    <span className="info-box-number h4 text-danger">
                      {formatMoney(cliente.saldo)}
                    </span>
                  </div>
                </div>

                <div className="info-box shadow-none border bg-light">
                  <span className="info-box-icon bg-warning elevation-1 text-white">
                    <i className="fas fa-star"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text text-bold">
                      Puntos Acumulados
                    </span>
                    <span className="info-box-number h4 text-warning">
                      {cliente.puntos || 0} pts.
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-primary btn-block shadow-sm mb-2"
                    onClick={() =>
                      navigate(`/clientes/historial/${cliente.id}`)
                    }
                  >
                    <i className="fas fa-list-ul mr-1"></i> Ver Historial de
                    Movimientos
                  </button>
                  <button
                    className="btn btn-outline-success btn-block"
                    onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                  >
                    <i className="fas fa-pencil-alt mr-1"></i> Editar Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCliente;
