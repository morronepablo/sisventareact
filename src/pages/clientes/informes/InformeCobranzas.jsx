// src/pages/clientes/informes/InformeCobranzas.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../../components/LoadingSpinner";

const InformeCobranzas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  useEffect(() => {
    api
      .get("/clientes/informes/cobranzas")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleReclamar = async (id) => {
    Swal.fire({
      title: "Enviando reclamo...",
      text: "Por favor espere mientras el bot procesa el envío.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await api.post(`/clientes/reclamar-deuda/${id}`);
      Swal.fire("¡Enviado!", res.data.message, "success");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Error al conectar con el bot.";
      Swal.fire("Error", msg, "error");
    }
  };

  const handlePDF = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${API_URL}/api/clientes/informes/cobranzas-pdf?token=${token}`,
      "_blank"
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Cuentas por Cobrar (Deudores)</b>
        </h1>
        <hr />
        <div className="card card-danger card-outline shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-bold">
              Ranking de Clientes en Mora
            </h3>
            <button
              className="btn btn-danger btn-sm float-right"
              onClick={handlePDF}
            >
              <i className="fas fa-file-pdf"></i> Exportar PDF
            </button>
          </div>
          <div className="card-body">
            <table className="table table-bordered table-striped table-hover">
              <thead className="thead-dark text-center">
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Días de Mora</th>
                  <th>Saldo Pendiente</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td className="text-center">{i + 1}</td>
                    <td>
                      <b>{d.nombre_cliente}</b>
                      <br />
                      <small>{d.telefono}</small>
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          d.dias_mora > 30 ? "badge-danger" : "badge-warning"
                        }`}
                      >
                        {d.dias_mora} días
                      </span>
                    </td>
                    <td className="text-right text-danger font-weight-bold">
                      $ {parseFloat(d.saldo_pend).toLocaleString("es-AR")}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-success btn-xs"
                        onClick={() => handleReclamar(d.id)}
                      >
                        <i className="fab fa-whatsapp"></i> Reclamar Automático
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
  );
};

export default InformeCobranzas;
