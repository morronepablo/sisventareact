// src/pages/proveedores/MovimientosProveedor.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const MovimientosProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMovimientos = async () => {
    try {
      const res = await api.get(`/proveedores/${id}/movimientos`);
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, [id]);

  // Inicialización de DataTables
  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => {
        if (window.$) {
          ["#compras-table", "#pagos-table"].forEach((idTable) => {
            if (!window.$.fn.DataTable.isDataTable(idTable)) {
              window.$(idTable).DataTable({
                paging: false,
                searching: true,
                info: false,
                responsive: true,
                language: {
                  url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
                },
                scrollY: idTable === "#compras-table" ? "250px" : "150px",
                scrollCollapse: true,
              });
            }
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading || !data)
    return <div className="p-4 text-center">Cargando movimientos...</div>;

  // Calcular Deuda Total Global
  const deudaTotalGlobal = data.compras.reduce(
    (acc, curr) => acc + curr.saldo_pendiente,
    0
  );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Movimientos del Proveedor: {data.proveedor?.empresa}</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="card card-outline card-primary">
          <div className="card-header">
            <h3 className="card-title">Historial de Compras y Pagos</h3>
            <div className="card-tools">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate("/proveedores/listado")}
              >
                <i className="fas fa-arrow-left"></i> Volver al Listado
              </button>
            </div>
          </div>
          <div className="card-body">
            <h5>
              Deuda Total:{" "}
              <span className="text-danger">
                ${" "}
                {deudaTotalGlobal.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </h5>

            <br />
            <h6>Compras Realizadas</h6>
            <hr />
            <table
              id="compras-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Nro.</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Total Compra</th>
                  <th>Efectivo</th>
                  <th>Tarjeta</th>
                  <th>M. Pago</th>
                  <th>Banco</th>
                  <th>Total Pagado</th>
                  <th>Saldo</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.compras.map((c, i) => (
                  <tr key={c.id}>
                    <td className="text-center">{i + 1}</td>
                    <td className="text-center">
                      {new Date(c.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="text-center">{c.comprobante}</td>
                    <td className="text-right">
                      $ {parseFloat(c.precio_total).toLocaleString("es-AR")}
                    </td>
                    <td className="text-right">
                      $ {c.efectivo.toLocaleString("es-AR")}
                    </td>
                    <td className="text-right">
                      $ {c.tarjeta.toLocaleString("es-AR")}
                    </td>
                    <td className="text-right">
                      $ {c.mercadopago.toLocaleString("es-AR")}
                    </td>
                    <td className="text-right">
                      $ {c.banco.toLocaleString("es-AR")}
                    </td>
                    <td className="text-right font-weight-bold text-success">
                      $ {c.total_pagado.toLocaleString("es-AR")}
                    </td>
                    <td className="text-right font-weight-bold text-danger">
                      $ {c.saldo_pendiente.toLocaleString("es-AR")}
                    </td>
                    <td className="text-center">{c.usuario_nombre}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/proveedores/pagos/${id}`)}
                      >
                        <i className="fas fa-money-bill-wave"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <br />
            <h6 className="mt-4">
              Historial de Pagos (Pagos Directos y Distribuciones)
            </h6>
            <hr />
            <table
              id="pagos-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Nro.</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {data.pagos.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-center">{i + 1}</td>
                    <td className="text-center">
                      {new Date(p.fecha_pago).toLocaleDateString("es-AR")}
                    </td>
                    <td className="text-center">{p.comprobante}</td>
                    <td className="text-right font-weight-bold">
                      $ {parseFloat(p.monto).toLocaleString("es-AR")}
                    </td>
                    <td className="text-center text-capitalize">
                      {p.metodo_pago}
                    </td>
                    <td className="text-center">{p.usuario_nombre}</td>
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

export default MovimientosProveedor;
