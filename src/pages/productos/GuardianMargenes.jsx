// src/pages/productos/GuardianMargenes.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const GuardianMargenes = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarAlertas = async () => {
    try {
      const res = await api.get("/productos/auditoria-margenes");
      setAlertas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const aplicarSugerencia = async (id, nombre, sugerido) => {
    const result = await Swal.fire({
      title: "¿Corregir Margen?",
      html: `¿Confirmas subir el precio de <b>${nombre}</b> a <b>$${sugerido}</b>?<br><small className="text-muted">Protege tu rentabilidad contra el último costo.</small>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      confirmButtonText: "Sí, actualizar ahora",
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/productos/guardian-fix/${id}`);
        Swal.fire({
          icon: "success",
          title: "Precio Actualizado",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarAlertas();
      } catch (err) {
        Swal.fire("Error", "No se pudo actualizar", "error");
      }
    }
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  const filtered = alertas.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentItems = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-shield-alt text-danger mr-2"></i>
        <b>Guardián de Márgenes</b>
      </h1>
      <p className="text-muted">
        Comparativa entre <b>Costo de Última Factura</b> y Precio de Venta
        Actual.
      </p>
      <hr />

      <div className="card card-outline card-danger shadow">
        <div className="card-header border-0 bg-light">
          <h3 className="card-title text-bold">
            <i className="fas fa-exclamation-triangle text-warning mr-2"></i>{" "}
            Detección de Fugas de Rentabilidad
          </h3>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="thead-dark text-center">
                <tr>
                  <th>Producto</th>
                  <th>Último Costo</th>
                  <th>Venta Actual</th>
                  <th>Margen Real</th>
                  <th className="bg-danger text-white">
                    Fuga de Ganancia (30d)
                  </th>
                  <th className="bg-success text-white">Sugerencia BI</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => (
                  <tr key={p.id}>
                    <td className="align-middle">
                      <div className="text-bold">{p.nombre}</div>
                      <small className="badge badge-secondary">
                        {p.categoria_nombre}
                      </small>
                    </td>
                    <td className="text-center align-middle">
                      {formatMoney(p.ultimo_costo)}
                    </td>
                    <td className="text-center align-middle">
                      {formatMoney(p.precio_venta)}
                    </td>
                    <td className="text-center align-middle text-danger text-bold">
                      {p.margen_actual}% <i className="fas fa-arrow-down"></i>
                    </td>
                    {/* COLUMNA BI DE IMPACTO ECONÓMICO */}
                    <td
                      className="text-center align-middle font-weight-bold"
                      style={{ backgroundColor: "#fff5f5" }}
                    >
                      <span
                        className="text-danger"
                        style={{ fontSize: "1.1rem" }}
                      >
                        - {formatMoney(p.perdida_estimada)}
                      </span>
                      <br />
                      <small className="text-muted">
                        Vendido: {p.ventas_30_dias} unid.
                      </small>
                    </td>
                    <td className="text-center align-middle bg-light">
                      <span className="text-success text-bold h5">
                        {formatMoney(p.precio_sugerido)}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-success btn-sm shadow-sm"
                        onClick={() =>
                          aplicarSugerencia(p.id, p.nombre, p.precio_sugerido)
                        }
                      >
                        <i className="fas fa-bolt mr-1"></i> Corregir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-dark text-white">
          <i className="fas fa-info-circle mr-2"></i>
          <b>Análisis BI:</b> El sistema detectó que por no actualizar estos
          precios, el mes pasado dejaste de ganar un total de{" "}
          <b>
            {formatMoney(
              alertas.reduce(
                (acc, curr) => acc + parseFloat(curr.perdida_estimada),
                0
              )
            )}
          </b>
          .
        </div>
      </div>
    </div>
  );
};

export default GuardianMargenes;
