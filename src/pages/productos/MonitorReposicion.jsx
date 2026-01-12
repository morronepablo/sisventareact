// src/pages/productos/MonitorReposicion.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const MonitorReposicion = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ productos: [] });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/productos/reporte/reposicion");
      setData(res.data);
      setLoading(false);
    } catch (e) {
      Swal.fire("Error", "No se pudo cargar el monitor", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // DataTable Logic
    const timer = setTimeout(() => {
      if (window.$ && !window.$.fn.DataTable.isDataTable("#repo-table")) {
        window.$("#repo-table").DataTable({
          paging: true,
          language: {
            url: "//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json",
          },
          responsive: true,
          autoWidth: false,
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [loading]);

  const formatARS = (val) =>
    `$ ${parseFloat(val).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  if (loading && data.productos.length === 0) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Monitor de Reposición</b>
            </h1>
          </div>
          <div className="col-sm-6 text-right">
            <button className="btn btn-primary" onClick={() => window.print()}>
              <i className="fas fa-print mr-2"></i> Imprimir Lista de Compra
            </button>
          </div>
        </div>
        <hr />

        <div className="row">
          <div className="col-lg-6 col-12">
            <div className="small-box bg-danger shadow">
              <div className="inner">
                <h3>{data.totalArticulosFaltantes}</h3>
                <p>Artículos bajo Stock Mínimo</p>
              </div>
              <div className="icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-12">
            <div className="small-box bg-success shadow">
              <div className="inner">
                <h3>{formatARS(data.inversionTotalNecesaria)}</h3>
                <p>Inversión necesaria para Stock Máximo</p>
              </div>
              <div className="icon">
                <i className="fas fa-wallet"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow">
          <div className="card-header bg-dark">
            <h3 className="card-title">Productos que requieren compra</h3>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table
                id="repo-table"
                className="table table-hover table-bordered"
              >
                <thead>
                  <tr className="bg-light">
                    <th>Producto</th>
                    <th className="text-center">Stock Actual</th>
                    <th className="text-center">Mínimo</th>
                    <th className="text-center">A Comprar</th>
                    <th className="text-right">Costo Unit.</th>
                    <th className="text-right">Inversión</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <b>{p.nombre}</b>
                        <br />
                        <small className="text-muted">
                          {p.categoria_nombre}
                        </small>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-secondary">
                          {p.stock} {p.unidad_nombre}
                        </span>
                      </td>
                      <td className="text-center">{p.stock_minimo}</td>
                      <td className="text-center font-weight-bold text-primary">
                        {p.faltante}
                      </td>
                      <td className="text-right">
                        {formatMoney(p.precio_compra)}
                      </td>
                      <td className="text-right font-weight-bold">
                        {formatMoney(p.inversion)}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            p.urgencia === "CRITICO"
                              ? "badge-danger"
                              : "badge-warning"
                          }`}
                        >
                          {p.urgencia}
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
    </div>
  );
};

const formatMoney = (val) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    val
  );

export default MonitorReposicion;
