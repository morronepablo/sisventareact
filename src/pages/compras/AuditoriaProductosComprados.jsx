// src/pages/compras/AuditoriaProductosComprados.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const dataTableStyles = `
  #auditoria-productos-table_wrapper .dataTables_info { padding: 15px !important; font-size: 0.85rem; color: #6c757d; }
  #auditoria-productos-table_wrapper .dataTables_paginate { padding: 10px 15px !important; }
  .text-strike { text-decoration: line-through; color: #adb5bd; font-size: 0.8rem; }
`;

const AuditoriaProductosComprados = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/compras/bi/auditoria-productos")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const tableId = "#auditoria-productos-table";
      const $ = window.$;
      const timer = setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableId))
          $(tableId).DataTable().destroy();
        $(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          pageLength: 5,
          order: [[0, "desc"]],
          language: {
            info: "Mostrando _START_ a _END_ de _TOTAL_ ingresos de mercadería",
            paginate: { previous: "Ant.", next: "Sig." },
            search: "Buscar producto/proveedor:",
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

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <style>{dataTableStyles}</style>
      <h1 className="text-bold">
        <i className="fas fa-history text-success mr-2"></i>Monitor de
        Abastecimiento
      </h1>
      <p className="text-muted">
        Trazabilidad total: ¿A quién le compramos cada cosa y a qué costo?
      </p>
      <hr />

      <div className="card card-outline card-success shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            Auditoría de Ingresos de Productos
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table
              id="auditoria-productos-table"
              className="table table-hover table-striped mb-0"
            >
              <thead className="thead-dark text-center text-xs">
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Proveedor</th>
                  <th>Cant.</th>
                  <th>Costo Pagado</th>
                  <th>Δ% Inflación</th>
                  <th>Margen Est.</th>
                  <th>Inversión</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.map((r, i) => (
                  <tr key={i}>
                    <td className="align-middle text-center">
                      {new Date(r.fecha_compra).toLocaleDateString("es-AR")}
                    </td>
                    <td className="align-middle">
                      <div className="text-bold text-uppercase">
                        {r.producto_nombre}
                      </div>
                      <small className="text-muted">{r.producto_codigo}</small>
                    </td>
                    <td className="align-middle font-weight-bold text-primary text-center">
                      {r.proveedor_nombre}
                    </td>
                    <td className="align-middle text-center font-weight-bold">
                      {r.cantidad}
                    </td>
                    <td className="align-middle text-right">
                      {r.precio_anterior &&
                        r.precio_anterior !== r.precio_pagado && (
                          <div className="text-strike">
                            {formatMoney(r.precio_anterior)}
                          </div>
                        )}
                      <div className="text-bold">
                        {formatMoney(r.precio_pagado)}
                      </div>
                    </td>
                    <td className="align-middle text-center">
                      {parseFloat(r.variacion_pct) > 0 ? (
                        <span className="badge badge-danger">
                          +{r.variacion_pct}%{" "}
                          <i className="fas fa-arrow-up"></i>
                        </span>
                      ) : parseFloat(r.variacion_pct) < 0 ? (
                        <span className="badge badge-success">
                          {r.variacion_pct}%{" "}
                          <i className="fas fa-arrow-down"></i>
                        </span>
                      ) : (
                        <span className="badge badge-secondary">0%</span>
                      )}
                    </td>
                    <td className="align-middle text-center">
                      <span
                        className={`text-bold ${parseFloat(r.margen_proyectado) < 20 ? "text-danger" : "text-success"}`}
                      >
                        {r.margen_proyectado}%
                      </span>
                    </td>
                    <td className="align-middle text-right font-weight-bold">
                      {formatMoney(r.inversion_total)}
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

export default AuditoriaProductosComprados;
