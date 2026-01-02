// src/pages/clientes/VerCliente.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerCliente = () => {
  const { id } = useParams(); // Obtiene el ID de la URL
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

  if (loading) return <div className="p-4">Cargando datos del cliente...</div>;
  if (!cliente) return <div className="p-4">Cliente no encontrado.</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Detalle del Cliente</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            {/* Callout estilo AdminLTE */}
            <div className="callout callout-info shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h3 className="card-title text-info text-bold">
                  Datos Registrados
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Cliente</label>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={cliente.nombre_cliente}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>C.U.I.L./D.N.I.</label>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={cliente.cuil_codigo}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={cliente.telefono}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Correo Electrónico</label>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={cliente.email}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-md-12 d-flex justify-content-end">
                    <button
                      onClick={() => navigate("/clientes/listado")}
                      className="btn btn-secondary"
                    >
                      <i className="fas fa-reply mr-1"></i> Volver
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

export default VerCliente;
