// src/pages/proveedores/AuditoriaDeudaProveedores.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const dataTableStyles = `
  #aging-table_wrapper .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  #aging-table_wrapper .dataTables_paginate { padding: 10px 15px !important; }
  .card-table-container { padding-bottom: 10px; }
`;

const AuditoriaDeudaProveedores = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAging = async () => {
    try {
      const res = await api.get("/proveedores/bi/aging-deuda");
      setData(res.data || []);
    } catch (err) {
      console.error("Error cargando aging");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAging();
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#aging-table";
      const $ = window.$;
      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
        $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          pageLength: 5,
          language: {
            info: "Mostrando _START_ a _END_ de _TOTAL_ comprobantes",
          },
          dom: "rtip",
        });
      }, 300);
      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, data]);

  const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(v || 0);

  // Totales para el gráfico
  const agingTotals = {
    "0-7 días": 0,
    "8-15 días": 0,
    "16-30 días": 0,
    "+30 días": 0,
  };
  data.forEach((r) => {
    if (agingTotals[r.tramo] !== undefined)
      agingTotals[r.tramo] += parseFloat(r.saldo_pendiente);
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{dataTableStyles}</style>
      <h1 className="text-bold">
        <i className="fas fa-history text-danger mr-2"></i>El Centinela de
        Pasivos
      </h1>
      <p className="text-muted text-uppercase small font-weight-bold">
        Auditoría de Envejecimiento de Deuda
      </p>
      <hr />

      {data.length === 0 ? (
        <div className="alert alert-success shadow-sm">
          <h5>
            <i className="fas fa-check-circle mr-2"></i>
            <b>¡Libre de Deudas!</b>
          </h5>
          No se detectaron facturas pendientes con proveedores en el sistema.
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-4">
              <div className="small-box bg-danger shadow-sm">
                <div className="inner">
                  <h3>
                    {formatMoney(
                      data.reduce(
                        (acc, curr) => acc + parseFloat(curr.saldo_pendiente),
                        0,
                      ),
                    )}
                  </h3>
                  <p>Pasivo Total Pendiente</p>
                </div>
                <div className="icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div
                className="card bg-dark border-secondary shadow-sm"
                style={{ height: "130px" }}
              >
                <div className="card-body d-flex align-items-center justify-content-around text-center">
                  <div>
                    <h4 className="text-warning text-bold mb-0">
                      {data.filter((f) => f.dias_deuda > 30).length}
                    </h4>
                    <small className="text-muted">VENCIDAS (+30D)</small>
                  </div>
                  <div className="border-left border-secondary pl-4">
                    <h4 className="text-info text-bold mb-0">{data.length}</h4>
                    <small className="text-muted">FACTURAS TOTALES</small>
                  </div>
                  <div className="border-left border-secondary pl-4">
                    <h4 className="text-success text-bold mb-0">
                      {(
                        (data.filter((f) => f.dias_deuda <= 7).length /
                          data.length) *
                        100
                      ).toFixed(0)}
                      %
                    </h4>
                    <small className="text-muted">DEUDA SALUDABLE</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="card card-outline card-danger shadow">
                <div className="card-header border-0">
                  <h3 className="card-title text-bold">
                    Desglose Cronológico de Comprobantes
                  </h3>
                </div>
                <div className="card-body p-0 card-table-container">
                  <table
                    id="aging-table"
                    className="table table-hover table-striped mb-0"
                  >
                    <thead className="thead-dark text-xs text-center">
                      <tr>
                        <th>Proveedor / Factura</th>
                        <th>Emisión</th>
                        <th>Antigüedad</th>
                        <th className="text-right">Saldo Pendiente</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {data.map((f, i) => (
                        <tr key={i}>
                          <td className="align-middle px-3">
                            <div className="text-bold text-uppercase">
                              {f.proveedor_nombre}
                            </div>
                            <small className="text-muted">
                              Factura ID: #{f.factura_id}
                            </small>
                          </td>
                          <td className="align-middle text-center">
                            {new Date(f.fecha_factura).toLocaleDateString(
                              "es-AR",
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <span
                              className={`badge badge-${f.color_tramo} px-3 py-1 shadow-sm`}
                            >
                              {f.dias_deuda} DÍAS
                            </span>
                          </td>
                          <td className="text-right align-middle text-bold text-danger">
                            {formatMoney(f.saldo_pendiente)}
                            <br />
                            <small className="text-muted text-xs">
                              USD {f.valor_usd_actual}
                            </small>
                          </td>
                          <td className="text-center align-middle">
                            <button
                              className="btn btn-xs btn-primary shadow-sm"
                              onClick={() =>
                                (window.location.href = `/proveedores/pagos/${f.proveedor_id}`)
                              }
                            >
                              Pagar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card card-dark shadow">
                <div className="card-header border-0 bg-transparent text-center py-2">
                  <h3 className="card-title text-bold text-xs">
                    DISTRIBUCIÓN DE PASIVOS
                  </h3>
                </div>
                <div className="card-body">
                  <div style={{ height: "240px" }}>
                    <Bar
                      data={{
                        labels: Object.keys(agingTotals),
                        datasets: [
                          {
                            data: Object.values(agingTotals),
                            backgroundColor: [
                              "#28a745",
                              "#17a2b8",
                              "#ffc107",
                              "#dc3545",
                            ],
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: { display: false },
                          x: {
                            ticks: { color: "#888", font: { size: 10 } },
                            grid: { display: false },
                          },
                        },
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                  <div className="alert bg-black border-secondary mt-3 mb-0 text-center py-2">
                    <p className="small mb-0 text-muted italic">
                      <i className="fas fa-info-circle mr-1 text-info"></i>
                      Monto total por rango de antigüedad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditoriaDeudaProveedores;
