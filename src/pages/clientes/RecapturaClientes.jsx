// src/pages/clientes/RecapturaClientes.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const RecapturaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarClientes = async () => {
    try {
      const res = await api.get("/clientes/recaptura");
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const enviarMensajeDirecto = async (cliente) => {
    try {
      // Feedback visual inmediato
      Swal.fire({
        title: "Enviando mensaje...",
        text: `El bot está contactando a ${cliente.nombre_cliente}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Llamada a la API de recaptura
      const res = await api.post(`/clientes/enviar-recaptura/${cliente.id}`);

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Enviado!",
          text: "El cliente ha sido notificado con éxito.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Opcional: Recargar la lista
        cargarClientes();
      }
    } catch (err) {
      Swal.fire(
        "Error",
        "No se pudo enviar el mensaje. Verifique la conexión del Bot.",
        "error"
      );
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <div className="row mb-3">
        <div className="col-sm-6">
          <h1 className="m-0 text-bold text-dark">
            <i className="fab fa-whatsapp text-success mr-2"></i> El
            Recapturador BI
          </h1>
        </div>
      </div>

      <div className="card card-outline card-success shadow">
        <div className="card-header">
          <h3 className="card-title text-bold">
            Clientes con riesgo de abandono (+15 días)
          </h3>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover table-striped mb-0">
            <thead className="bg-dark">
              <tr>
                <th>Cliente</th>
                <th className="text-center">Última Visita</th>
                <th className="text-center">Días Ausente</th>
                <th className="text-center">Producto Favorito</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td className="align-middle">
                      <div className="text-bold">{c.nombre_cliente}</div>
                      <small className="text-muted">{c.telefono}</small>
                    </td>
                    <td className="text-center align-middle">
                      {new Date(c.fecha_ultima_compra).toLocaleDateString()}
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${
                          c.dias_ausente > 30 ? "badge-danger" : "badge-warning"
                        } px-3 py-2`}
                      >
                        {c.dias_ausente} días
                      </span>
                    </td>
                    <td className="text-center align-middle text-primary text-bold">
                      {c.producto_favorito || "Varios"}
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-success btn-sm shadow-sm text-bold"
                        onClick={() => enviarMensajeDirecto(c)}
                      >
                        <i className="fab fa-whatsapp mr-1"></i> ENVIAR POR BOT
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <h4>¡Todos tus clientes están al día!</h4>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecapturaClientes;
