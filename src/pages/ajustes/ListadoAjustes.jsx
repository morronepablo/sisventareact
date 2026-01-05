// src/pages/ajustes/ListadoAjustes.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoAjustes = () => {
  const navigate = useNavigate();
  const [ajustes, setAjustes] = useState([]);
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

  // --- FUNCIÓN PARA NAVEGAR LIMPIANDO TOOLTIPS (SOLUCIÓN AL PROBLEMA) ---
  const navegarSinTooltips = (url) => {
    if (window.$) {
      window.$(".tooltip").remove(); // Elimina el elemento del DOM
      window.$('[data-toggle="tooltip"]').tooltip("hide"); // Fuerza el cierre
    }
    navigate(url);
  };

  const fetchData = async () => {
    try {
      const response = await api.get("/ajustes");
      setAjustes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ajustes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && ajustes.length > 0) {
      const timer = setTimeout(() => {
        const tableId = "#ajustes-table";
        const $ = window.$;

        if ($ && $.fn.DataTable) {
          if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
          }

          $(tableId).DataTable({
            paging: true,
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            pageLength: 10,
            language: spanishLanguage,
            dom: '<"row"<"col-md-6"l><"col-md-6"f>><"row"<"col-md-12"B>>rt<"row"<"col-md-6"i><"col-md-6 text-right"p>>',
            buttons: [
              {
                extend: "copy",
                text: '<i class="fas fa-copy"></i> Copiar',
                className: "btn btn-secondary btn-sm",
              },
              {
                extend: "pdf",
                text: '<i class="fas fa-file-pdf"></i> PDF',
                className: "btn btn-danger btn-sm",
              },
              {
                extend: "csv",
                text: '<i class="fas fa-file-csv"></i> CSV',
                className: "btn btn-info btn-sm",
              },
              {
                extend: "excel",
                text: '<i class="fas fa-file-excel"></i> Excel',
                className: "btn btn-success btn-sm",
              },
              {
                extend: "print",
                text: '<i class="fas fa-print"></i> Imprimir',
                className: "btn btn-warning btn-sm",
              },
            ],
            drawCallback: function () {
              if (window.$) {
                window.$('[data-toggle="tooltip"]').tooltip("dispose");
                window
                  .$('[data-toggle="tooltip"]')
                  .tooltip({ trigger: "hover", boundary: "window" });
              }
            },
          });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, ajustes]);

  // Limpiar tooltips al desmontar el componente por seguridad
  useEffect(() => {
    return () => {
      if (window.$) window.$(".tooltip").remove();
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Listado de Ajustes de Inventario</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Ajustes Registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/ajustes/crear")}
              >
                <i className="fa fa-plus"></i> Nuevo Ajuste
              </button>
            </div>
          </div>

          <div className="card-body">
            <table
              id="ajustes-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Producto</th>
                  <th style={{ width: "100px" }}>Tipo</th>
                  <th style={{ width: "100px" }}>Cantidad</th>
                  <th>Motivo</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th style={{ width: "80px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ajustes.map((ajuste, index) => (
                  <tr key={ajuste.id}>
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="align-middle">{ajuste.producto_nombre}</td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${
                          ajuste.tipo === "entrada"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {ajuste.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right align-middle font-weight-bold">
                      {parseFloat(ajuste.cantidad).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="align-middle">{ajuste.motivo}</td>
                    <td className="text-center align-middle">
                      {new Date(ajuste.fecha).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      {ajuste.usuario_nombre}
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-info btn-sm"
                        data-toggle="tooltip"
                        title="Ver Ajuste"
                        onClick={() =>
                          navegarSinTooltips(`/ajustes/ver/${ajuste.id}`)
                        }
                      >
                        <i className="fas fa-eye"></i>
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

export default ListadoAjustes;
