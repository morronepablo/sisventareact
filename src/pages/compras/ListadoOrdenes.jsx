// src/pages/compras/ListadoOrdenes.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const ListadoOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ninguna orden de compra generada",
    sInfo: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Siguiente",
      sPrevious: "Anterior",
    },
  };

  const fetchOrdenes = async () => {
    try {
      const res = await api.get("/ordenes-compra");
      setOrdenes(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Función para navegar sin dejar tooltips abiertos
  const navegarSinTooltips = (url) => {
    if (window.$) {
      window.$(".tooltip").remove();
      window.$('[data-toggle="tooltip"]').tooltip("hide");
    }
    navigate(url);
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  useEffect(() => {
    if (!loading && ordenes.length >= 0) {
      const tableId = "#ordenes-table";
      const $ = window.$;
      if (!$) return;

      if ($.fn.DataTable.isDataTable(tableId)) {
        $(tableId).DataTable().destroy();
      }

      const table = $(tableId).DataTable({
        paging: true,
        ordering: true,
        order: [[0, "desc"]],
        info: true,
        responsive: true,
        pageLength: 10,
        language: spanishLanguage,
        dom: "rtip",
      });

      // Inicializar tooltips después de renderizar la tabla
      setTimeout(() => {
        if ($.fn.tooltip) {
          $('[data-toggle="tooltip"]').tooltip({
            trigger: "hover",
            boundary: "window",
            template:
              '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner bg-dark text-white shadow-sm"></div></div>',
          });
        }
      }, 100);
    }
  }, [loading, ordenes]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Órdenes de Compra</b>
            </h1>
          </div>
        </div>
        <hr />
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title text-bold">Pedidos Enviados</h3>
            <button
              className="btn btn-primary btn-sm float-right"
              onClick={() => navigate("/compras/ordenes/crear")}
            >
              <i className="fas fa-plus mr-1"></i> Generar Pedido
            </button>
          </div>
          <div className="card-body">
            <table
              id="ordenes-table"
              className="table table-bordered table-striped table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Nro. OC</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Ítems</th>
                  <th>Estado</th>
                  <th className="text-center">Total Est.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id}>
                    <td className="text-center align-middle">
                      <b>OC-{String(o.id).padStart(6, "0")}</b>
                    </td>
                    <td className="text-center align-middle">
                      {new Date(o.fecha).toLocaleDateString()}
                    </td>
                    <td className="align-middle">{o.proveedor_nombre}</td>
                    <td className="text-center align-middle">
                      {o.items} productos
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${
                          o.estado === "Pendiente"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {o.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right align-middle">
                      ${" "}
                      {parseFloat(o.total_estimado).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center align-middle">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          data-toggle="tooltip"
                          title="Ver Orden"
                          onClick={() =>
                            navegarSinTooltips(`/compras/ordenes/ver/${o.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                        {o.estado === "Pendiente" && (
                          <button
                            className="btn btn-success btn-sm"
                            data-toggle="tooltip"
                            title="Recibir Orden"
                            onClick={() =>
                              navegarSinTooltips(
                                `/compras/ordenes/recibir/${o.id}`,
                              )
                            }
                          >
                            <i className="fas fa-truck-loading"></i>
                          </button>
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

export default ListadoOrdenes;
