// src/pages/clientes/ListadoClientes.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // URL dinámica según el entorno
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

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

  // FUNCIÓN PARA ABRIR REPORTES CON TOKEN
  const abrirReporte = (path) => {
    const token = localStorage.getItem("token");
    const url = `${API_URL}${path}?token=${token}`;
    window.open(url, "_blank");
  };

  const fetchClientes = async () => {
    try {
      const response = await api.get("/clientes");
      setClientes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (!loading && clientes.length >= 0) {
      const timer = setTimeout(() => {
        const tableId = "#clientes-table";
        if (window.$.fn.DataTable.isDataTable(tableId)) {
          window.$(tableId).DataTable().destroy();
        }

        window.$(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 10,
          language: spanishLanguage,
          lengthChange: false,
          searching: false,
          dom: "rtip",
          columnDefs: [{ targets: -1, orderable: false }],
          drawCallback: function () {
            if (window.$ && window.$.fn.tooltip) {
              window.$('[data-toggle="tooltip"]').tooltip("dispose");
              window.$('[data-toggle="tooltip"]').tooltip({
                trigger: "hover",
                boundary: "window",
                template:
                  '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner bg-dark text-white shadow-sm"></div></div>',
              });
            }
          },
        });
      }, 150);

      return () => {
        clearTimeout(timer);
        if (window.$) {
          window.$(".tooltip").remove();
          if (window.$.fn.DataTable.isDataTable("#clientes-table")) {
            window.$("#clientes-table").DataTable().destroy();
          }
        }
      };
    }
  }, [loading, clientes]);

  const handleExport = (type) => {
    const table = window.$("#clientes-table").DataTable();
    table.button(`.buttons-${type}`).trigger();
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Estas seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "¡Sí, bórralo!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/clientes/${id}`);
          Swal.fire("Eliminado", "El cliente ha sido eliminado.", "success");
          fetchClientes();
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
        }
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Listado de Clientes</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Clientes registrados</h3>
            <div className="card-tools">
              {/* BOTÓN REPORTE CORREGIDO */}
              <button
                className="btn btn-secondary btn-sm mr-2"
                onClick={() => abrirReporte("/api/clientes/reporte")}
              >
                <i className="fa fa-file-pdf"></i> Reporte
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/clientes/crear")}
              >
                <i className="fa fa-plus"></i> Crear nuevo
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <label className="mr-2 mb-0">Mostrar</label>
                <select
                  className="form-control form-control-sm mr-2"
                  style={{ width: "65px" }}
                  onChange={(e) =>
                    window
                      .$("#clientes-table")
                      .DataTable()
                      .page.len(e.target.value)
                      .draw()
                  }
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="mr-3">registros</span>

                <div className="dt-buttons btn-group">
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

              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar..."
                  style={{ width: "200px" }}
                  onChange={(e) =>
                    window
                      .$("#clientes-table")
                      .DataTable()
                      .search(e.target.value)
                      .draw()
                  }
                />
              </div>
            </div>

            <table
              id="clientes-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "50px" }}>Nro.</th>
                  <th>Cliente</th>
                  <th>CUIL/DNI</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Deuda</th>
                  <th>Pagos</th>
                  <th>Saldo</th>
                  <th>Compras</th>
                  <th>Montos</th>
                  <th style={{ width: "160px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, index) => (
                  <tr key={c.id}>
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="align-middle">
                      <b>{c.nombre_cliente}</b>
                    </td>
                    <td className="text-center align-middle">
                      {c.cuil_codigo}
                    </td>
                    <td className="text-center align-middle">{c.telefono}</td>
                    <td className="align-middle">{c.email}</td>
                    <td className="text-right align-middle">
                      ${" "}
                      {parseFloat(c.deuda || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-right align-middle">
                      ${" "}
                      {parseFloat(c.pagos || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`text-right align-middle font-weight-bold ${
                        parseFloat(c.saldo) === 0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      ${" "}
                      {parseFloat(c.saldo || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      {c.cantidad_compras}
                    </td>
                    <td className="text-right align-middle font-weight-bold">
                      ${" "}
                      {parseFloat(c.monto_compras || 0).toLocaleString(
                        "es-AR",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver"
                          onClick={() =>
                            navegarSinTooltips(`/clientes/ver/${c.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {c.id !== 1 && (
                          <>
                            <button
                              className="btn btn-warning btn-sm"
                              data-toggle="tooltip"
                              title="Pagos"
                              onClick={() =>
                                navegarSinTooltips(`/clientes/pagos/${c.id}`)
                              }
                            >
                              <i className="fas fa-money-bill-wave"></i>
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              data-toggle="tooltip"
                              title="Compras"
                              onClick={() =>
                                navegarSinTooltips(`/clientes/compras/${c.id}`)
                              }
                            >
                              <i className="fas fa-shopping-cart"></i>
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              data-toggle="tooltip"
                              title="Historial"
                              onClick={() =>
                                navegarSinTooltips(
                                  `/clientes/historial/${c.id}`
                                )
                              }
                            >
                              <i className="fas fa-history"></i>
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              data-toggle="tooltip"
                              title="Editar"
                              onClick={() =>
                                navegarSinTooltips(`/clientes/editar/${c.id}`)
                              }
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            {c.cantidad_compras === 0 && (
                              <button
                                className="btn btn-danger btn-sm"
                                data-toggle="tooltip"
                                title="Eliminar"
                                onClick={() => handleEliminar(c.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

export default ListadoClientes;
