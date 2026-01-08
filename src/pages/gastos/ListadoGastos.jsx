// src/pages/gastos/ListadoGastos.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const ListadoGastos = () => {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún gasto registrado aún",
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

  const fetchData = async () => {
    try {
      const response = await api.get("/gastos");
      setGastos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar gastos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && gastos.length >= 0) {
      const tableId = "#gastos-table";
      const $ = window.$;
      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          autoWidth: false,
          pageLength: 10,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [{ targets: -1, orderable: false }],
          drawCallback: function () {
            if ($ && $.fn.tooltip) {
              $('[data-toggle="tooltip"]').tooltip("dispose");
              $('[data-toggle="tooltip"]').tooltip({
                trigger: "hover",
                boundary: "window",
                template:
                  '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner bg-dark text-white shadow-sm"></div></div>',
              });
            }
          },
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, gastos]);

  // const handleDelete = (id) => {
  //   Swal.fire({
  //     title: "¿Eliminar este gasto?",
  //     text: "Esta acción no se puede deshacer.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Sí, eliminar",
  //     cancelButtonText: "Cancelar",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         await api.delete(`/gastos/${id}`);
  //         Swal.fire("Eliminado", "El gasto ha sido borrado.", "success");
  //         fetchData();
  //       } catch (error) {
  //         Swal.fire("Error", "No se pudo eliminar.", "error");
  //       }
  //     }
  //   });
  // };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Eliminar este gasto?",
      text: "Si el gasto fue en efectivo, se ajustará automáticamente el saldo de la caja abierta.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/gastos/${id}`);
          await Swal.fire({
            title: "Eliminado",
            text: "Gasto borrado y caja sincronizada.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          window.location.reload();
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el gasto.", "error");
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
            <h1>
              <b>Listado de Gastos</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title my-1">Gastos Registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navegarSinTooltips("/gastos/crear")}
              >
                <i className="fa fa-plus"></i> Nuevo Gasto
              </button>
            </div>
          </div>

          <div className="card-body">
            <table
              id="gastos-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "40px" }}>Nro.</th>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Descripción</th>
                  <th>Método</th>
                  <th>Usuario</th>
                  <th style={{ width: "80px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g, i) => (
                  <tr key={g.id}>
                    <td className="text-center align-middle">{i + 1}</td>
                    <td className="text-center align-middle">
                      {new Date(g.fecha).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="align-middle">{g.categoria_nombre}</td>
                    <td className="text-right align-middle font-weight-bold text-danger">
                      - ${" "}
                      {parseFloat(g.monto).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="align-middle">{g.descripcion}</td>
                    <td className="text-center align-middle text-capitalize">
                      {g.metodo_pago}
                    </td>
                    <td className="text-center align-middle">
                      {g.usuario_nombre}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        {/* BOTÓN VER GASTO CORREGIDO */}
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver Detalle"
                          onClick={() =>
                            navegarSinTooltips(`/gastos/ver/${g.id}`)
                          } // 👈 USAR LA FUNCIÓN WRAPPER
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          data-toggle="tooltip"
                          title="Eliminar Gasto"
                          onClick={() => handleDelete(g.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
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

export default ListadoGastos;
