// src/pages/proveedores/MatrizDependencia.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MatrizDependencia = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const spanishLanguage = {
    processing: "Procesando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ proveedores",
    infoEmpty: "Mostrando 0 a 0 de 0",
    infoFiltered: "(filtrado de _MAX_)",
    zeroRecords: "No se encontraron resultados",
    emptyTable: "Sin datos",
    paginate: {
      first: "Primero",
      previous: "Ant.",
      next: "Sig.",
      last: "Último",
    },
  };

  useEffect(() => {
    api
      .get("/proveedores/bi/dependencia")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- INICIALIZACIÓN DE DATATABLE ---
  useEffect(() => {
    if (!loading && data && data.proveedores.length > 0) {
      const tableId = "#dependencia-table";
      const $ = window.$;

      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();

        $(tableId).DataTable({
          paging: true,
          ordering: true,
          order: [[1, "desc"]], // Ordenar por % de dependencia de mayor a menor
          info: true,
          autoWidth: false,
          responsive: true,
          pageLength: 5, // <--- Configuración de 5 filas solicitada
          language: spanishLanguage,
          dom: "rtp", // Solo tabla y paginación para mantener limpieza visual
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (window.$ && $.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
      };
    }
  }, [loading, data]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-3">Sin datos suficientes.</div>;

  const chartData = {
    labels: data.proveedores.map((p) => p.proveedor_nombre),
    datasets: [
      {
        data: data.proveedores.map((p) => p.porcentaje),
        backgroundColor: [
          "#dc3545",
          "#ffc107",
          "#28a745",
          "#17a2b8",
          "#6610f2",
          "#e83e8c",
          "#20c997",
          "#fd7e14",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-shield-virus text-primary mr-2"></i>
        <b>Matriz de Dependencia</b>
      </h1>
      <p className="text-muted">
        Análisis de riesgo: ¿Qué porcentaje de tu utilidad depende de cada
        proveedor?
      </p>
      <hr />

      <div className="row">
        {/* GRÁFICO DOUGHNUT */}
        <div className="col-lg-5">
          <div className="card card-outline card-primary shadow-sm">
            <div className="card-header border-0">
              <h3 className="card-title text-bold">
                Concentración de Utilidad
              </h3>
            </div>
            <div className="card-body">
              <div style={{ height: "320px" }}>
                <Doughnut
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { boxWidth: 12, font: { size: 10 } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLA CON DATATABLE */}
        <div className="col-lg-7">
          <div className="card card-outline card-danger shadow-sm">
            <div className="card-header border-0">
              <h3 className="card-title text-bold">
                Semáforo de Riesgo Estratégico
              </h3>
            </div>
            <div className="card-body p-0">
              <table id="dependencia-table" className="table table-hover m-0">
                <thead>
                  <tr className="text-sm">
                    <th>Proveedor</th>
                    <th className="text-center" style={{ width: "35%" }}>
                      % Dependencia
                    </th>
                    <th className="text-center">Nivel de Riesgo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.proveedores.map((p, i) => (
                    <tr key={i}>
                      <td className="align-middle">
                        <span className="text-bold">{p.proveedor_nombre}</span>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-between">
                          <div
                            className="progress progress-xs flex-grow-1 mr-2"
                            style={{ height: "6px" }}
                          >
                            <div
                              className={`progress-bar bg-${
                                p.riesgo === "CRÍTICO"
                                  ? "danger"
                                  : p.riesgo === "MEDIO"
                                    ? "warning"
                                    : "success"
                              }`}
                              style={{ width: `${p.porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="small text-bold">
                            {p.porcentaje}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`badge shadow-sm w-100 ${
                            p.riesgo === "CRÍTICO"
                              ? "badge-danger"
                              : p.riesgo === "MEDIO"
                                ? "badge-warning"
                                : "badge-success"
                          }`}
                          style={{ maxWidth: "80px" }}
                        >
                          {p.riesgo}
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

      {/* ALERT DIAGNÓSTICO */}
      <div className="alert bg-dark text-white mt-4 shadow-lg border-left-danger">
        <h5>
          <i className="fas fa-microchip text-danger mr-2"></i>
          <b>Diagnóstico de supervivencia BI:</b>
        </h5>
        <p className="mb-0">
          {data.proveedores.some((p) => p.riesgo === "CRÍTICO")
            ? "¡ATENCIÓN! Se detecta dependencia crítica (>50%). Tu rentabilidad está atada a un solo actor. Es imperativo buscar proveedores alternativos para mitigar el riesgo de quiebre operativo."
            : "Estructura de proveedores saludable. La diversificación actual garantiza que ante la falta de un proveedor, el negocio mantenga su capacidad de generar utilidad neta."}
        </p>
      </div>
    </div>
  );
};

export default MatrizDependencia;
