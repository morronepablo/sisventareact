// src/pages/combos/ListadoCombos.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoCombos = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
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

  // --- FUNCIÓN PARA LIMPIAR TOOLTIPS ANTES DE NAVEGAR ---
  const navegarSinTooltips = (url) => {
    if (window.$) {
      window.$(".tooltip").remove();
      window.$('[data-toggle="tooltip"]').tooltip("hide");
    }
    navigate(url);
  };

  const fetchCombos = async () => {
    try {
      const res = await api.get("/combos");
      setCombos(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  useEffect(() => {
    if (!loading && combos.length > 0) {
      const tableId = "#combos-table";
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
          columnDefs: [
            { targets: 0, orderable: false },
            { targets: -1, orderable: false },
          ],
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
  }, [loading, combos]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará el combo "${nombre}" permanentemente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/combos/${id}`);
        await Swal.fire({
          title: "¡Eliminado!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        window.location.reload();
      } catch (error) {
        const msg = error.response?.data?.message || "Error al eliminar.";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Gestión de Combos</b>
        </h1>
        <hr />
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Combos Registrados</h3>
            <button
              className="btn btn-primary btn-sm float-right"
              onClick={() => navegarSinTooltips("/combos/crear")}
            >
              <i className="fas fa-plus"></i> Nuevo Combo
            </button>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-end mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar combo..."
                style={{ width: "250px" }}
                onChange={(e) =>
                  window
                    .$("#combos-table")
                    .DataTable()
                    .search(e.target.value)
                    .draw()
                }
              />
            </div>

            <table
              id="combos-table"
              className="table table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th style={{ width: "40px" }}></th>
                  <th>Nro.</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Ventas</th>
                  <th>Precio Venta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {combos.map((combo, index) => (
                  <React.Fragment key={combo.id}>
                    <tr>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-sm p-0"
                          onClick={() => toggleRow(combo.id)}
                        >
                          <i
                            className={`fas ${
                              expandedRows[combo.id]
                                ? "fa-minus-circle text-danger"
                                : "fa-plus-circle text-success"
                            }`}
                            style={{ fontSize: "1.2rem" }}
                          ></i>
                        </button>
                      </td>
                      <td className="text-center align-middle">{index + 1}</td>
                      <td className="text-center align-middle">
                        {combo.codigo}
                      </td>
                      <td className="align-middle">
                        <b>{combo.nombre}</b>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-secondary">
                          {combo.ventas_count}
                        </span>
                      </td>
                      <td className="text-right align-middle text-bold">
                        ${" "}
                        {parseFloat(combo.precio_venta).toLocaleString(
                          "es-AR",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="text-center align-middle">
                        <div className="btn-group">
                          {/* BOTÓN VER CORREGIDO */}
                          <button
                            className="btn btn-info btn-sm"
                            data-toggle="tooltip"
                            title="Ver Detalle"
                            onClick={() =>
                              navegarSinTooltips(`/combos/ver/${combo.id}`)
                            }
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {/* BOTÓN EDITAR CORREGIDO */}
                          <button
                            className="btn btn-success btn-sm"
                            data-toggle="tooltip"
                            title="Editar"
                            onClick={() =>
                              navegarSinTooltips(`/combos/editar/${combo.id}`)
                            }
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          {combo.puede_eliminarse ? (
                            <button
                              className="btn btn-danger btn-sm"
                              data-toggle="tooltip"
                              title="Eliminar"
                              onClick={() =>
                                handleDelete(combo.id, combo.nombre)
                              }
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm disabled"
                              data-toggle="tooltip"
                              title="Combo con ventas registradas"
                              style={{ cursor: "not-allowed", opacity: 0.6 }}
                            >
                              <i className="fas fa-lock"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expandedRows[combo.id] && (
                      <tr className="bg-light">
                        <td colSpan="7" className="p-3">
                          <table className="table table-sm table-bordered bg-white mb-0 shadow-sm">
                            <thead className="bg-secondary text-white small text-center">
                              <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th>Stock</th>
                                <th>Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {combo.productos?.map((prod, i) => (
                                <tr key={i} className="small">
                                  <td className="text-center">{prod.codigo}</td>
                                  <td>{prod.nombre}</td>
                                  <td className="text-center">{prod.stock}</td>
                                  <td className="text-right pr-3">
                                    {prod.cantidad} {prod.unidad}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoCombos;
