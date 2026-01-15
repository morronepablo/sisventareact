// src/pages/productos/OraculoStock.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const OraculoStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible en esta tabla",
    sInfo: "Mostrando _START_ a _END_ de _TOTAL_ registros",
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
      const res = await api.get("/productos/bi/oraculo-stock");
      setData(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && data.length >= 0) {
      const tableId = "#oraculo-table";
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
          pageLength: 5,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [{ targets: -1, orderable: false }],
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading) return <LoadingSpinner />;

  // Seleccionamos los 4 más urgentes (Días 0 o menores)
  const criticos = data.filter((p) => p.diasRestantes <= 3).slice(0, 4);

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-10">
            <h1>
              <i className="fas fa-eye text-primary mr-2"></i>
              <b>El Oráculo de Stock</b>
            </h1>
            <p className="text-muted">
              Prioridad Basada en Stock Mínimo + Velocidad de Venta
            </p>
          </div>
        </div>
        <hr />

        {/* TARJETAS DE AVISO - AHORA TOMARÁN LOS QUE ESTÁN EN MÍNIMO */}
        <div className="row">
          {criticos.map((p) => (
            <div className="col-md-3" key={p.id}>
              <div
                className={`small-box shadow-sm ${
                  p.diasRestantes === 0 ? "bg-danger" : "bg-warning"
                }`}
              >
                <div className="inner">
                  <h5 className="font-weight-bold text-truncate">{p.nombre}</h5>
                  <p className="m-0">
                    {p.diasRestantes === 0 ? (
                      <b>STOCK MÍNIMO ALCANZADO</b>
                    ) : (
                      <>
                        Quedan: <b>{p.diasRestantes} días</b>
                      </>
                    )}
                  </p>
                  <small>
                    {p.diasRestantes === 0
                      ? `Stock: ${p.stock} / Min: ${p.stock_minimo}`
                      : `Proyectado: ${new Date(
                          p.fechaQuiebre + "T00:00:00"
                        ).toLocaleDateString("es-AR")}`}
                  </small>
                </div>
                <div className="icon">
                  <i
                    className={
                      p.diasRestantes === 0
                        ? "fas fa-exclamation-circle"
                        : "fas fa-hourglass-half"
                    }
                  ></i>
                </div>
              </div>
            </div>
          ))}
          {criticos.length === 0 && (
            <div className="col-12">
              <div className="alert alert-success">
                <i className="fas fa-check-circle mr-2"></i>Todos los productos
                tienen autonomía mayor a 3 días y superan el stock mínimo.
              </div>
            </div>
          )}
        </div>

        <div className="card card-outline card-primary shadow-sm mt-3">
          <div className="card-header">
            <h3 className="card-title text-bold">
              <i className="fas fa-list-ol mr-2"></i>Proyección Completa de
              Inventario
            </h3>
          </div>
          <div className="card-body">
            <table
              id="oraculo-table"
              className="table table-hover table-striped table-bordered table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Venta Diaria</th>
                  <th>Días Restantes</th>
                  <th>Estado del Oráculo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id}>
                    <td className="align-middle px-2">
                      <b>{p.nombre}</b>
                      <br />
                      <small className="text-muted">
                        Mínimo: {p.stock_minimo}
                      </small>
                    </td>
                    <td className="text-center align-middle">
                      {p.stock} unid.
                    </td>
                    <td className="text-center align-middle">
                      {p.vDiaria} / día
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`h5 font-weight-bold ${
                          p.diasRestantes <= 3 ? "text-danger" : "text-primary"
                        }`}
                      >
                        {p.diasRestantes === 0
                          ? "ALERTA"
                          : p.diasRestantes >= 999
                          ? "∞"
                          : p.diasRestantes}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      {p.diasRestantes === 0 ? (
                        <span className="badge badge-danger p-2 animate__animated animate__flash animate__infinite">
                          <i className="fas fa-exclamation-triangle mr-1"></i>{" "}
                          REPOSICIÓN URGENTE
                        </span>
                      ) : p.diasRestantes <= 7 ? (
                        <span className="badge badge-warning p-2 text-white">
                          <i className="fas fa-clock mr-1"></i> COMPRAR PRONTO
                        </span>
                      ) : (
                        <span className="badge badge-success p-2">
                          <i className="fas fa-check mr-1"></i> STOCK SEGURO
                        </span>
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-outline-primary btn-xs"
                        onClick={() =>
                          (window.location.href = `/productos/ver/${p.id}`)
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

export default OraculoStock;
