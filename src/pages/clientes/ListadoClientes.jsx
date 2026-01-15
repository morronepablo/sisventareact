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

  // Formateador manual para evitar el error de "Invalid Date"
  const formatFechaNacimiento = (fechaStr) => {
    if (!fechaStr) return <small className="text-muted">No registrada</small>;
    try {
      const soloFecha = fechaStr.split("T")[0];
      const parts = soloFecha.split("-");
      if (parts.length !== 3)
        return <small className="text-muted">No registrada</small>;
      return (
        <span className="badge badge-light border shadow-none px-2">
          <i className="fas fa-cake-candles text-danger mr-1"></i>
          {`${parts[2]}/${parts[1]}/${parts[0]}`}
        </span>
      );
    } catch (e) {
      return <small className="text-muted">No registrada</small>;
    }
  };

  const handleCargarBilletera = async (cliente) => {
    const { value: formValues } = await Swal.fire({
      title: `Cargar Billetera: ${cliente.nombre_cliente}`,
      html:
        "<label>Monto a cargar ($)</label>" +
        '<input id="swal-input1" class="swal2-input" type="number" step="0.01" placeholder="0.00">' +
        "<label>Motivo / Descripción</label>" +
        '<input id="swal-input2" class="swal2-input" placeholder="Ej: Vuelto de compra">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Cargar Saldo",
      preConfirm: () => [
        document.getElementById("swal-input1").value,
        document.getElementById("swal-input2").value,
      ],
    });

    if (formValues && formValues[0] > 0) {
      try {
        await api.post(`/clientes/${cliente.id}/billetera/cargar`, {
          monto: formValues[0],
          descripcion: formValues[1],
        });
        Swal.fire("¡Éxito!", "Saldo cargado.", "success");
        fetchClientes();
      } catch (error) {
        Swal.fire("Error", "No se pudo procesar la carga.", "error");
      }
    }
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará el cliente del sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "¡Sí, bórralo!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/clientes/${id}`);
          Swal.fire("Eliminado", "El cliente ha sido eliminado.", "success");
          fetchClientes();
          window.location.href = "/clientes/listado";
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
        }
      }
    });
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        const tableId = "#clientes-table";
        if (window.$.fn.DataTable.isDataTable(tableId))
          window.$(tableId).DataTable().destroy();
        window.$(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 10,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [{ targets: -1, orderable: false }],
          drawCallback: function () {
            if (window.$ && window.$.fn.tooltip) {
              window.$('[data-toggle="tooltip"]').tooltip("dispose");
              window
                .$('[data-toggle="tooltip"]')
                .tooltip({ trigger: "hover", boundary: "window" });
            }
          },
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, clientes]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Listado de Clientes</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Clientes registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/clientes/crear")}
              >
                <i className="fa fa-plus"></i> Crear nuevo
              </button>
            </div>
          </div>

          <div className="card-body">
            <table
              id="clientes-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Nro.</th>
                  <th>Cliente</th>
                  <th>CUIL/DNI</th>
                  <th>Teléfono</th>
                  <th>F. Nacimiento</th>
                  <th className="bg-success">Billetera</th>
                  <th>Deuda</th>
                  <th>Saldo</th>
                  <th>Compras</th>
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
                    <td className="text-center align-middle">
                      {formatFechaNacimiento(c.fecha_nacimiento)}
                    </td>
                    <td className="text-right align-middle font-weight-bold text-success">
                      ${" "}
                      {parseFloat(c.saldo_billetera || 0).toLocaleString(
                        "es-AR",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="text-right align-middle text-danger">
                      ${" "}
                      {parseFloat(c.deuda || 0).toLocaleString("es-AR", {
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

                    {/* COMPRAS RESTAURADA */}
                    <td className="text-center align-middle">
                      <span className="badge badge-info shadow-sm px-2">
                        {c.cantidad_compras || 0}
                      </span>
                    </td>

                    <td className="text-center align-middle">
                      <div className="btn-group shadow-sm">
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver Perfil"
                          onClick={() =>
                            navegarSinTooltips(`/clientes/ver/${c.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {c.id !== 1 && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              data-toggle="tooltip"
                              title="Cargar Billetera"
                              onClick={() => handleCargarBilletera(c)}
                            >
                              <i className="fas fa-wallet"></i>
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              data-toggle="tooltip"
                              title="Gestionar Cta Cte"
                              onClick={() =>
                                navegarSinTooltips(`/clientes/pagos/${c.id}`)
                              }
                            >
                              <i className="fas fa-money-bill-wave"></i>
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

                            {/* ELIMINAR RESTAURADO - Solo si compras es 0 */}
                            {(c.cantidad_compras === 0 ||
                              !c.cantidad_compras) && (
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
