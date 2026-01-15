// src/pages/ventas/informes/Rentabilidad.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Swal from "sweetalert2";

const Rentabilidad = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fechas, setFechas] = useState({
    desde: `${new Date().getFullYear()}-01-01`,
    hasta: new Date().toISOString().split("T")[0],
  });

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

  const fetchRentabilidad = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/ventas/reporte-rentabilidad?desde=${fechas.desde}&hasta=${fechas.hasta}`
      );
      setData(res.data);
      setLoading(false);
    } catch (e) {
      Swal.fire("Error", "No se pudo cargar el informe", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => {
        const tableId = "#renta-table";
        if (window.$.fn.DataTable.isDataTable(tableId))
          window.$(tableId).DataTable().destroy();
        window.$(tableId).DataTable({
          paging: true,
          pageLength: 5,
          language: spanishLanguage,
          responsive: true,
          autoWidth: false,
          order: [[3, "desc"]],
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  useEffect(() => {
    fetchRentabilidad();
  }, []);

  if (loading && !data) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Rentabilidad y Análisis de Stock</b>
            </h1>
          </div>
        </div>
        <hr />

        {/* FILTROS */}
        <div className="card shadow-sm mb-4 border-left-primary">
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-3">
                <label>
                  <small className="font-weight-bold">Desde</small>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={fechas.desde}
                  onChange={(e) =>
                    setFechas({ ...fechas, desde: e.target.value })
                  }
                />
              </div>
              <div className="col-md-3">
                <label>
                  <small className="font-weight-bold">Hasta</small>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={fechas.hasta}
                  onChange={(e) =>
                    setFechas({ ...fechas, hasta: e.target.value })
                  }
                />
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-primary btn-block shadow-sm"
                  onClick={fetchRentabilidad}
                >
                  <i className="fas fa-search-dollar mr-2"></i> Analizar Periodo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INDICADORES CUÁDRUPLES */}
        <div className="row">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-gradient-primary shadow">
              <div className="inner">
                <h3>
                  $
                  {data?.totalVentas.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p>Ventas Totales</p>
              </div>
              <div className="icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-gradient-danger shadow">
              <div className="inner">
                <h3>
                  $
                  {data?.totalCosto.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p>Costo Mercadería (CMV)</p>
              </div>
              <div className="icon">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-gradient-warning shadow">
              <div className="inner">
                <h3 className="text-white">
                  $
                  {data?.totalGastos.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p className="text-white">Gastos Operativos</p>
              </div>
              <div className="icon">
                <i className="fas fa-file-invoice-dollar"></i>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-gradient-success shadow">
              <div className="inner">
                <h3>
                  $
                  {data?.gananciaNetaReal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p>Utilidad Neta Real</p>
              </div>
              <div className="icon">
                <i className="fas fa-money-check-alt"></i>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE ANÁLISIS */}
        <div className="card shadow">
          <div className="card-header bg-dark d-flex justify-content-between align-items-center">
            <h3 className="card-title">Desempeño de Productos</h3>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table
                id="renta-table"
                className="table table-hover table-bordered"
                style={{ width: "100%" }}
              >
                <thead className="thead-light">
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Vendidos</th>
                    <th className="text-right">Ganancia</th>
                    <th
                      className="text-center"
                      style={{ backgroundColor: "#f0f7ff" }}
                    >
                      Aporte %
                    </th>
                    <th className="text-center" style={{ width: "150px" }}>
                      Margen Real
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.rankingProductos.map((p, i) => {
                    const margen = parseFloat(p.margen || 0);
                    const cantidad = parseFloat(p.cantidad || 0);
                    const sinVentas = cantidad === 0;
                    let colorBarra = "bg-success";
                    if (margen <= 10) colorBarra = "bg-danger";
                    else if (margen <= 30) colorBarra = "bg-warning";

                    return (
                      <tr
                        key={i}
                        style={
                          sinVentas
                            ? { backgroundColor: "rgba(255,0,0,0.05)" }
                            : {}
                        }
                      >
                        <td className="font-weight-bold">
                          {p.nombre}{" "}
                          {sinVentas && (
                            <span className="badge badge-danger ml-2">
                              STOCKED
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              sinVentas ? "badge-danger" : "badge-info"
                            }`}
                            style={{ fontSize: "1rem" }}
                          >
                            {p.cantidad}{" "}
                            <small
                              className="ml-1"
                              style={{ fontSize: "0.7rem", opacity: 0.8 }}
                            >
                              {p.unidad}
                            </small>
                          </span>
                        </td>
                        <td className="text-right font-weight-bold text-success">
                          ${" "}
                          {parseFloat(p.ganancia).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center">
                          <span
                            className="badge badge-secondary"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {parseFloat(p.participacion).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center">
                          <div
                            className="progress shadow-sm"
                            style={{
                              height: "12px",
                              borderRadius: "10px",
                              backgroundColor: "#eee",
                            }}
                          >
                            <div
                              className={`progress-bar progress-bar-striped ${
                                sinVentas ? "" : "progress-bar-animated"
                              } ${colorBarra}`}
                              style={{
                                width: `${
                                  sinVentas ? 100 : Math.max(margen, 5)
                                }%`,
                                opacity: sinVentas ? 0.3 : 1,
                              }}
                            ></div>
                          </div>
                          <small
                            className={`font-weight-bold mt-1 d-block ${
                              sinVentas ? "text-danger" : "text-dark"
                            }`}
                          >
                            {margen.toFixed(1)}%{" "}
                            {sinVentas ? "(SIN VENTA)" : ""}
                          </small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer">
            <small className="text-muted">
              <b>Utilidad Neta Real:</b> Ganancia de productos menos gastos
              cargados en el sistema para este periodo.
            </small>
          </div>
        </div>
      </div>
      <style>{` .border-left-primary { border-left: 5px solid #007bff; } `}</style>
    </div>
  );
};

export default Rentabilidad;
