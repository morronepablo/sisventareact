// src/pages/permisos/VerMovimientosProducto.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerMovimientosProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ producto: null, movimientos: [] });
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible para este producto",
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

  const fetchData = async () => {
    try {
      const response = await api.get(`/movimientos/producto/${id}`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      navigate("/movimientos/listado");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!loading && data.movimientos.length > 0) {
      const timer = setTimeout(() => {
        const tableId = "#movimientos-table";
        const $ = window.$;

        if ($ && $.fn.DataTable) {
          if ($.fn.DataTable.isDataTable(tableId))
            $(tableId).DataTable().destroy();

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
            dom: '<"row"<"col-md-6"l><"col-md-6 text-right"f>><"row"<"col-md-12"B>>rt<"row"<"col-md-6"i><"col-md-6 text-right"p>>',
            buttons: ["copy", "pdf", "csv", "excel", "print"],
          });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, data.movimientos]);

  // Función para rellenar con ceros (como str_pad en PHP)
  const formatID = (val) => String(val).padStart(8, "0");

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-12">
            <h1>
              <b>Historial de Movimientos - {data.producto?.nombre}</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-12">
            {" "}
            {/* Aumentado un poco el ancho por la nueva columna */}
            <div className="card card-outline card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title">
                  Movimientos de {data.producto?.nombre}
                </h3>
                <div className="card-tools">
                  <Link
                    to="/movimientos/listado"
                    className="btn btn-secondary btn-sm"
                  >
                    <i className="fas fa-arrow-left"></i> Volver a Productos
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <table
                  id="movimientos-table"
                  className="table table-striped table-bordered table-hover table-sm"
                >
                  <thead className="thead-dark text-center">
                    <tr>
                      <th style={{ width: "40px" }}>Nro.</th>
                      <th>Tipo</th>
                      <th>Origen</th>
                      <th>Origen ID</th>
                      <th>Compra</th>
                      <th>Venta</th>
                      <th>Devolución</th> {/* 👈 Nueva Columna */}
                      <th>Ajuste</th>
                      <th>Cantidad</th>
                      <th>Fecha</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.movimientos.map((m, i) => (
                      <tr key={m.id}>
                        <td className="text-center align-middle">{i + 1}</td>
                        <td className="text-center align-middle">
                          <span
                            className={`badge ${
                              m.tipo === "entrada"
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {m.tipo.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center align-middle">
                          {m.origen.toUpperCase()}
                        </td>
                        <td className="text-center align-middle">
                          {m.origen_id}
                        </td>

                        {/* COLUMNA COMPRA */}
                        <td className="text-center align-middle">
                          {m.compra_id ? (
                            <Link
                              to={`/compras/ver/${m.compra_id}`}
                              className="text-info font-weight-bold"
                            >
                              C {formatID(m.compra_id)}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* COLUMNA VENTA */}
                        <td className="text-center align-middle">
                          {m.venta_id ? (
                            <Link
                              to={`/ventas/ver/${m.venta_id}`}
                              className="text-info font-weight-bold"
                            >
                              T {formatID(m.venta_id)}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* COLUMNA DEVOLUCIÓN 👈 Nueva lógica */}
                        <td className="text-center align-middle">
                          {m.devolucion_id ? (
                            <Link
                              to={`/devoluciones/ver/${m.devolucion_id}`}
                              className="text-info font-weight-bold"
                            >
                              D {formatID(m.devolucion_id)}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* COLUMNA AJUSTE */}
                        <td className="text-center align-middle">
                          {m.ajuste_id ? (
                            <Link
                              to={`/ajustes/ver/${m.ajuste_id}`}
                              className="text-info font-weight-bold"
                            >
                              A {formatID(m.ajuste_id)}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="text-right align-middle font-weight-bold">
                          {parseFloat(m.cantidad).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center align-middle">
                          {new Date(m.fecha).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}{" "}
                          hs.
                        </td>
                        <td className="text-center align-middle">
                          {m.usuario_nombre}
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

export default VerMovimientosProducto;
