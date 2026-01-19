// src/pages/productos/CementerioStock.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

// --- ESTILOS DE ARQUITECTURA VISUAL (MÁRGENES Y TOOLTIPS) ---
const customStyles = `
  #cementerio-table_wrapper .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  #cementerio-table_wrapper .dataTables_paginate { padding: 10px 15px !important; }
  .card-table-container { padding-bottom: 10px; }
`;

const CementerioStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Sin productos inactivos",
    sInfo: "Mostrando _START_ a _END_ de _TOTAL_ muertos",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Sig.",
      sPrevious: "Ant.",
    },
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/productos/bi/cementerio");
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- INICIALIZACIÓN DE DATATABLE ---
  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#cementerio-table";
      const $ = window.$;

      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          order: [[2, "desc"]],
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 5,
          language: spanishLanguage,
          dom: "rtip",
          drawCallback: function () {
            if ($ && $.fn.tooltip) {
              $('[data-toggle="tooltip"]').tooltip("dispose");
              $('[data-toggle="tooltip"]').tooltip({ boundary: "window" });
            }
          },
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, data]);

  const totalEnterrado = data.reduce(
    (acc, curr) => acc + parseFloat(curr.capital_enterrado),
    0,
  );
  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{customStyles}</style>
      <div className="row mb-2">
        <div className="col-sm-8">
          <h1>
            <i className="fas fa-monument text-secondary mr-2"></i>
            <b>Cementerio de Mercadería</b>
          </h1>
          <p className="text-muted">
            Productos con stock que <b>no se venden hace más de 60 días</b>.
          </p>
        </div>
      </div>
      <hr />

      {/* CARD DE IMPACTO TOTAL */}
      <div className="row d-flex justify-content-center">
        <div className="col-md-6">
          <div className="small-box bg-dark shadow-lg">
            <div className="inner text-center">
              <h2 className="font-weight-bold">
                {formatMoney(totalEnterrado)}
              </h2>
              <p className="text-uppercase text-bold text-warning">
                Capital "Enterrado" en Stock Muerto
              </p>
            </div>
            <div className="icon">
              <i className="fas fa-skull-crossbones opacity-25"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-outline card-secondary shadow mt-3">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            <i className="fas fa-list mr-2"></i>Inventario Inactivo Detectado
          </h3>
        </div>
        <div className="card-body p-0">
          {data.length > 0 ? (
            /* ✅ VISTA CUANDO HAY DATOS (DATATABLE) */
            <div className="table-responsive card-table-container">
              <table
                id="cementerio-table"
                className="table table-hover table-striped mb-0"
              >
                <thead className="thead-dark text-center text-sm">
                  <tr>
                    <th>Producto</th>
                    <th>Stock Parado</th>
                    <th className="text-right">Capital Perdido</th>
                    <th>Días sin Venta</th>
                    <th>Sugerencia BI</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.map((p) => (
                    <tr key={p.id}>
                      <td className="align-middle px-3">
                        <b>{p.nombre}</b>
                        <br />
                        <small className="text-muted">
                          {p.categoria_nombre}
                        </small>
                      </td>
                      <td className="text-center align-middle font-weight-bold">
                        {p.stock} unid.
                      </td>
                      <td className="text-right align-middle font-weight-bold text-danger">
                        {formatMoney(p.capital_enterrado)}
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-secondary p-2">
                          {p.dias_inactivo} días
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`badge px-3 py-2 shadow-sm ${p.sugerencia === "LIQUIDACIÓN URGENTE" ? "badge-danger" : "badge-warning"}`}
                        >
                          {p.sugerencia}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="btn-group">
                          <button
                            className="btn btn-primary btn-sm"
                            data-toggle="tooltip"
                            title="Crear Combo"
                            onClick={() =>
                              (window.location.href = "/combos/crear")
                            }
                          >
                            <i className="fas fa-layer-group"></i>
                          </button>
                          <button
                            className="btn btn-info btn-sm"
                            data-toggle="tooltip"
                            title="Ver Historial"
                            onClick={() =>
                              (window.location.href = `/productos/ver/${p.id}`)
                            }
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* ✅ VISTA ORIGINAL CUANDO NO HAY DATOS (EMPTY STATE) */
            <div className="py-5 text-center animate__animated animate__fadeIn">
              <i className="fas fa-check-circle fa-4x text-success mb-3 d-block"></i>
              <h4 className="text-bold">¡Stock en Movimiento!</h4>
              <p className="text-muted mb-0">
                No tienes productos inactivos por más de 60 días.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="alert bg-gray-dark text-white mt-4 border-left-warning shadow">
        <h5>
          <i className="fas fa-lightbulb text-warning mr-2"></i>
          <b>Estrategia de Rescate:</b>
        </h5>
        No dejes que el polvo desvalorice tu inversión. <b>Sugerencia:</b> Los
        productos marcados como "Liquidación" deberían tener un descuento
        agresivo hoy. Es mejor recuperar el costo ahora que tener $0 mañana por
        obsolescencia.
      </div>
    </div>
  );
};

export default CementerioStock;
