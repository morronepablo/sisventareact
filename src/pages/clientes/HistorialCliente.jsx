// src/pages/clientes/HistorialCliente.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const HistorialCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible en esta tabla",
    sInfo:
      "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Siguiente",
      sPrevious: "Anterior",
    },
  };

  const fetchHistorial = async () => {
    try {
      const res = await api.get(`/clientes/${id}/historial`);
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      navigate("/clientes/listado");
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [id]);

  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => {
        const tableId = "#historial-table";
        if ($.fn.DataTable.isDataTable(tableId)) {
          $(tableId).DataTable().destroy();
        }

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          language: spanishLanguage,
          dom: "rtip", // Oculta los controles automáticos duplicados
          lengthChange: false,
          searching: false,
          pageLength: 10,
          buttons: ["copy", "pdf", "csv", "excel", "print"],
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  const handleExport = (type) => {
    const table = $("#historial-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  if (loading)
    return <div className="p-4 text-center">Cargando historial...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Historial de Transacciones - {data.cliente.nombre_cliente}</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title my-1">
                  Transacciones de {data.cliente.nombre_cliente}
                </h3>
                <div className="card-tools">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/clientes/listado")}
                  >
                    <i className="fas fa-arrow-left"></i> Volver a Clientes
                  </button>
                </div>
              </div>

              <div className="card-body">
                {/* BARRA MANUAL SUPERIOR */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <label className="mr-2 mb-0">Mostrar</label>
                    <select
                      className="form-control form-control-sm mr-2"
                      style={{ width: "65px" }}
                      onChange={(e) =>
                        $("#historial-table")
                          .DataTable()
                          .page.len(e.target.value)
                          .draw()
                      }
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="-1">Todos</option>
                    </select>
                    <div className="dt-buttons btn-group ml-3">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleExport("copy")}
                      >
                        <i className="fas fa-copy"></i> Copiar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleExport("pdf")}
                      >
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleExport("excel")}
                      >
                        <i className="fas fa-file-excel"></i> Excel
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleExport("print")}
                      >
                        <i className="fas fa-print"></i> Imprimir
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar..."
                    style={{ width: "200px" }}
                    onChange={(e) =>
                      $("#historial-table")
                        .DataTable()
                        .search(e.target.value)
                        .draw()
                    }
                  />
                </div>

                <table
                  id="historial-table"
                  className="table table-striped table-bordered table-hover table-sm"
                >
                  <thead className="thead-dark text-center">
                    <tr>
                      <th style={{ width: "50px" }}>Nro.</th>
                      <th style={{ width: "100px" }}>Tipo</th>
                      <th style={{ width: "150px" }}>Fecha</th>
                      <th style={{ width: "120px" }}>Monto</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transacciones.map((t, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              t.tipo.toLowerCase() === "venta"
                                ? "badge-primary"
                                : t.tipo.toLowerCase() === "pago"
                                ? "badge-success"
                                : t.tipo.toLowerCase() === "deuda"
                                ? "badge-danger"
                                : "badge-info"
                            }`}
                          >
                            {t.tipo}
                          </span>
                        </td>
                        <td className="text-center">
                          {new Date(t.fecha).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="text-right font-weight-bold">
                          ${" "}
                          {parseFloat(t.monto).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-capitalize">{t.detalle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialCliente;
