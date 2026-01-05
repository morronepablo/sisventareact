// src/pages/permisos/ListadoProductosMovimientos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoProductosMovimientos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
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

  const navegarSinTooltips = (url) => {
    if (window.$) {
      window.$(".tooltip").remove();
      window.$('[data-toggle="tooltip"]').tooltip("hide");
    }
    navigate(url);
  };

  useEffect(() => {
    api
      .get("/movimientos/productos-list")
      .then((res) => {
        setProductos(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && productos.length > 0) {
      const timer = setTimeout(() => {
        const tableId = "#productos-table";
        if (window.$ && window.$.fn.DataTable) {
          if (window.$.fn.DataTable.isDataTable(tableId))
            window.$(tableId).DataTable().destroy();
          window.$(tableId).DataTable({
            paging: true,
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            language: spanishLanguage,
            dom: '<"row"<"col-md-6"l><"col-md-6 text-right"f>><"row"<"col-md-12"B>>rt<"row"<"col-md-6"i><"col-md-6 text-right"p>>',
            buttons: ["copy", "pdf", "csv", "excel", "print"],
            drawCallback: function () {
              window.$('[data-toggle="tooltip"]').tooltip("dispose");
              window
                .$('[data-toggle="tooltip"]')
                .tooltip({ trigger: "hover", boundary: "window" });
            },
          });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, productos]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Historial de Movimientos</b>
        </h1>
        <hr />
        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow-sm">
              <div className="card-header">
                <h3 className="card-title">Seleccione un Producto</h3>
              </div>
              <div className="card-body">
                <table
                  id="productos-table"
                  className="table table-striped table-bordered table-hover table-sm"
                >
                  <thead className="thead-dark text-center">
                    <tr>
                      <th style={{ width: "50px" }}>Nro.</th>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Stock Actual</th>
                      <th style={{ width: "80px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p, i) => (
                      <tr key={p.id}>
                        <td className="text-center align-middle">{i + 1}</td>
                        <td className="text-center align-middle">{p.codigo}</td>
                        <td className="align-middle">{p.nombre}</td>
                        <td className="text-right align-middle font-weight-bold">
                          {parseFloat(p.stock).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center align-middle">
                          <button
                            className="btn btn-info btn-sm"
                            data-toggle="tooltip"
                            title="Ver Movimientos"
                            onClick={() =>
                              navegarSinTooltips(`/movimientos/ver/${p.id}`)
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
      </div>
    </div>
  );
};

export default ListadoProductosMovimientos;
