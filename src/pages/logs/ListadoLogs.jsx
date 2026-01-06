// src/pages/gastos/ListadoLogs.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "No hay registros de actividad aún",
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

  useEffect(() => {
    api
      .get("/logs")
      .then((res) => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && logs.length > 0) {
      const timer = setTimeout(() => {
        const tableId = "#logs-table";
        if (window.$ && window.$.fn.DataTable) {
          if (window.$.fn.DataTable.isDataTable(tableId))
            window.$(tableId).DataTable().destroy();

          window.$(tableId).DataTable({
            paging: true,
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            responsive: true,
            // 1. CAMBIO: Paginación de 5 en 5
            pageLength: 10,
            lengthMenu: [
              [5, 10, 25, 50, -1],
              [5, 10, 25, 50, "Todos"],
            ],
            language: spanishLanguage,
            dom: '<"row"<"col-md-6"l><"col-md-6 text-right"f>><"row"<"col-md-12 mb-2"B>>rt<"row"<"col-md-6"i><"col-md-6 text-right"p>>',
            // 2. CAMBIO: Colores en los botones mediante clases de Bootstrap
            buttons: [
              {
                extend: "copy",
                text: '<i class="fas fa-copy"></i> Copiar',
                className: "btn btn-secondary btn-sm mr-1",
              },
              {
                extend: "excel",
                text: '<i class="fas fa-file-excel"></i> Excel',
                className: "btn btn-success btn-sm mr-1",
              },
              {
                extend: "csv",
                text: '<i class="fas fa-file-csv"></i> CSV',
                className: "btn btn-info btn-sm mr-1",
              },
              {
                extend: "pdf",
                text: '<i class="fas fa-file-pdf"></i> PDF',
                className: "btn btn-danger btn-sm mr-1",
              },
              {
                extend: "print",
                text: '<i class="fas fa-print"></i> Imprimir',
                className: "btn btn-dark btn-sm",
              },
            ],
          });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, logs]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Historial de Actividad (Logs)</b>
        </h1>
        <hr />
        <div className="card card-outline card-dark shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Auditoría del Sistema</h3>
          </div>
          <div className="card-body">
            <table
              id="logs-table"
              className="table table-striped table-bordered table-hover table-sm"
              style={{ width: "100%" }}
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>Detalle</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-center align-middle">
                      {new Date(log.created_at).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="align-middle">
                      <b>{log.usuario_nombre}</b>
                      <br />
                      <small className="text-muted">{log.usuario_email}</small>
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${
                          log.accion === "ELIMINAR"
                            ? "badge-danger"
                            : log.accion === "EDITAR"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {log.accion}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <b>{log.modulo}</b>
                    </td>
                    <td className="align-middle">{log.detalle}</td>
                    <td className="text-center align-middle small">{log.ip}</td>
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

export default ListadoLogs;
