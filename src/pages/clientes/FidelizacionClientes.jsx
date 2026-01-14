// src/pages/clientes/FidelizacionClientes.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const FidelizacionClientes = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarRFM = async () => {
    try {
      const res = await api.get("/clientes/segmentacion-rfm");
      setDatos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRFM();
  }, []);

  const enviarAccion = async (c) => {
    Swal.fire({
      title: `¿Fidelizar a ${c.nombre_cliente}?`,
      text: `Se enviará un mensaje automático de ${c.segmento} vía WhatsApp.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar Bot",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`/clientes/enviar-recaptura/${c.id}`); // Reutilizamos tu bot de recaptura
          Swal.fire("¡Enviado!", "El cliente ha sido contactado.", "success");
        } catch (e) {
          Swal.fire("Error", "No se pudo enviar.", "error");
        }
      }
    });
  };

  const formatARS = (val) =>
    `$ ${parseFloat(val).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  // Filtrado y Paginación
  const filtered = datos.filter((c) =>
    c.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <h1 className="text-bold text-dark">
        <i className="fas fa-brain text-primary mr-2"></i> Cerebro de
        Fidelización (RFM)
      </h1>
      <p className="text-muted">
        Segmentación automática de clientes basada en comportamiento real de
        compra.
      </p>

      <div className="card card-outline card-primary shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            Panel de Audiencia Inteligente
          </h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span>Ver</span>
              <select
                className="form-control form-control-sm mx-2"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
              <span>clientes</span>
            </div>
            <input
              type="search"
              className="form-control form-control-sm"
              style={{ width: "200px" }}
              placeholder="Buscar cliente..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <table className="table table-bordered table-striped table-hover">
            <thead className="bg-dark text-center">
              <tr>
                <th>Cliente</th>
                <th>Estatus RFM</th>
                <th>Última Visita</th>
                <th>Frecuencia</th>
                <th>Total Gastado</th>
                <th>Sugerencia BI</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((c) => (
                <tr key={c.id}>
                  <td className="align-middle">
                    <b>{c.nombre_cliente}</b>
                    <br />
                    <small>{c.telefono}</small>
                  </td>
                  <td className="text-center align-middle">
                    <span
                      className={`badge ${c.color} p-2 px-3`}
                      style={{ fontSize: "0.8rem" }}
                    >
                      <i className={`${c.icono} mr-1`}></i> {c.segmento}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    Hace {c.recencia} días
                  </td>
                  <td className="text-center align-middle text-bold">
                    {c.frecuencia} tickets
                  </td>
                  <td className="text-center align-middle text-success text-bold">
                    {formatARS(c.valor_monetario)}
                  </td>
                  <td className="align-middle small font-italic">
                    {c.sugerencia}
                  </td>
                  <td className="text-center align-middle">
                    <button
                      className="btn btn-success btn-sm shadow-sm"
                      onClick={() => enviarAccion(c)}
                    >
                      <i className="fab fa-whatsapp"></i> ACCIÓN
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between mt-3">
            <small>
              Página {currentPage} de {totalPages}
            </small>
            <nav>
              <ul className="pagination pagination-sm m-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Ant.
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Sig.
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FidelizacionClientes;
