// src/pages/combos/AnaliticaCombos.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const dataTableStyles = `
  #combos-bi-table_wrapper .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  #combos-bi-table_wrapper .dataTables_paginate { padding: 10px 15px !important; }
`;

const AnaliticaCombos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalitica = async () => {
    try {
      const res = await api.get("/combos/bi/analitica");
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalitica();
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#combos-bi-table";
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
            info: "Mostrando _START_ a _END_ de _TOTAL_ combos",
            paginate: { previous: "Ant.", next: "Sig." },
            zeroRecords: "No hay datos de ventas de combos",
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

  const chartData = {
    labels: data.slice(0, 5).map((c) => c.nombre),
    datasets: [
      {
        label: "Unidades Vendidas (30d)",
        data: data.slice(0, 5).map((c) => c.unidades_vendidas),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{dataTableStyles}</style>
      <h1 className="text-bold">
        <i className="fas fa-vials text-purple mr-2"></i>El Alquimista de Combos
      </h1>
      <p className="text-muted font-italic">
        Auditoría de rentabilidad basada en costos de reposición actualizados.
      </p>
      <hr />

      <div className="row">
        {/* GRÁFICO DE TOP VENTAS */}
        <div className="col-lg-4">
          <div className="card card-outline card-primary shadow">
            <div className="card-header">
              <h3 className="card-title text-bold">Top 5 más Vendidos</h3>
            </div>
            <div className="card-body">
              <div style={{ height: "250px" }}>
                <Bar
                  data={chartData}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLA BI */}
        <div className="col-lg-8">
          <div className="card card-outline card-purple shadow">
            <div className="card-header border-0">
              <h3 className="card-title text-bold text-purple">
                Desempeño y Margen Real
              </h3>
            </div>
            <div className="card-body p-0">
              <table id="combos-bi-table" className="table table-hover mb-0">
                <thead className="thead-dark text-xs text-center">
                  <tr>
                    <th>Combo</th>
                    <th>Vendidos</th>
                    <th>Rentabilidad %</th>
                    <th>Monto en Juego</th>
                    <th>Posibles</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.map((c, i) => (
                    <tr key={i}>
                      <td className="align-middle">
                        <div className="text-bold">{c.nombre}</div>
                        <small className="text-muted">{c.codigo}</small>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-info px-3">
                          {c.unidades_vendidas} unid.
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div
                          className={`text-bold ${c.status === "CRÍTICO" ? "text-danger" : "text-success"}`}
                        >
                          {c.margen_porcentual}%
                        </div>
                        <div
                          className="progress progress-xxs"
                          style={{ height: "4px" }}
                        >
                          <div
                            className={`progress-bar bg-${c.status === "CRÍTICO" ? "danger" : "success"}`}
                            style={{ width: `${c.margen_porcentual}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="text-right align-middle text-bold">
                        ${" "}
                        {parseFloat(
                          c.margen_neto * c.unidades_vendidas,
                        ).toLocaleString()}
                        <br />
                        <small className="text-muted">Utilidad generada</small>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`badge ${c.combos_disponibles < 10 ? "badge-danger" : "badge-dark"}`}
                        >
                          {c.combos_disponibles} packs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER DE DIAGNÓSTICO */}
      <div className="alert bg-navy mt-4 shadow-lg border-left-info">
        <h5>
          <i className="fas fa-magic mr-2"></i>Consejo del Alquimista:
        </h5>
        {data.some((c) => c.status === "CRÍTICO")
          ? "Detectamos combos cuya rentabilidad cayó por debajo del 15%. Los costos de reposición de los componentes subieron. ¡Es hora de ajustar el precio de venta!"
          : "Tus combos mantienen un margen saludable. La rotación de ingredientes pesables es óptima."}
      </div>
    </div>
  );
};

export default AnaliticaCombos;
