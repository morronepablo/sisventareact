// src/pages/ventas/informes/DetalleInformeProductosVentas.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const DetalleInformeProductosVentas = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [orden, setOrden] = useState({ campo: "fecha", direccion: "desc" });

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  // Formatear valores
  const fmt = (val) =>
    parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtNumero = (val) =>
    parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // Formatear fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    try {
      const [day, month, year] = fechaStr.split("/");
      return `${day}/${month}/${year}`;
    } catch {
      return fechaStr;
    }
  };

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/ventas/informes/productos?fecha_inicio=${desde}&fecha_fin=${hasta}`,
        );
        setData(response.data);
        setPaginaActual(1); // Resetear a primera página al cargar nuevos datos
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (desde && hasta) {
      fetchData();
    }
  }, [desde, hasta]);

  // Calcular totales
  const calcularTotales = () => {
    return data.reduce(
      (acc, item) => {
        const ganancia = parseFloat(item.ganancia) || 0;
        const total = parseFloat(item.total) || 0;
        return {
          ganancia: acc.ganancia + ganancia,
          facturacion: acc.facturacion + total,
          productos: acc.productos + 1,
        };
      },
      { ganancia: 0, facturacion: 0, productos: 0 },
    );
  };

  // Filtrar y ordenar datos
  const datosFiltrados = React.useMemo(() => {
    let result = [...data];

    // Aplicar filtro de búsqueda
    if (filtro) {
      const busqueda = filtro.toLowerCase();
      result = result.filter(
        (item) =>
          item.nombre?.toLowerCase().includes(busqueda) ||
          item.codigo?.toLowerCase().includes(busqueda) ||
          item.ticket_id?.toString().includes(busqueda),
      );
    }

    // Aplicar orden
    result.sort((a, b) => {
      let valorA, valorB;

      switch (orden.campo) {
        case "fecha":
          valorA = new Date(a.fecha_fmt.split("/").reverse().join("-"));
          valorB = new Date(b.fecha_fmt.split("/").reverse().join("-"));
          break;
        case "ticket_id":
          valorA = parseInt(a.ticket_id) || 0;
          valorB = parseInt(b.ticket_id) || 0;
          break;
        case "total":
          valorA = parseFloat(a.total) || 0;
          valorB = parseFloat(b.total) || 0;
          break;
        case "ganancia":
          valorA = parseFloat(a.ganancia) || 0;
          valorB = parseFloat(b.ganancia) || 0;
          break;
        default:
          valorA = a[orden.campo] || "";
          valorB = b[orden.campo] || "";
      }

      if (valorA < valorB) return orden.direccion === "asc" ? -1 : 1;
      if (valorA > valorB) return orden.direccion === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, filtro, orden]);

  // Calcular datos para la página actual
  const indiceUltimaFila = paginaActual * filasPorPagina;
  const indicePrimeraFila = indiceUltimaFila - filasPorPagina;
  const datosPaginados = datosFiltrados.slice(
    indicePrimeraFila,
    indiceUltimaFila,
  );
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);

  // Cambiar orden
  const cambiarOrden = (campo) => {
    setOrden((prev) => ({
      campo,
      direccion:
        prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc",
    }));
    setPaginaActual(1); // Volver a la primera página al cambiar orden
  };

  // Cambiar página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    // Desplazar hacia arriba de la tabla
    const tableElement = document.querySelector(".table-responsive");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generar array de números de página para mostrar
  const obtenerNumerosPagina = () => {
    const numeros = [];
    const maxPaginasVisibles = 5;

    if (totalPaginas <= maxPaginasVisibles) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (paginaActual <= 3) {
        // Primeras páginas
        for (let i = 1; i <= 4; i++) {
          numeros.push(i);
        }
        numeros.push("...");
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        // Últimas páginas
        numeros.push(1);
        numeros.push("...");
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        // Páginas intermedias
        numeros.push(1);
        numeros.push("...");
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          numeros.push(i);
        }
        numeros.push("...");
        numeros.push(totalPaginas);
      }
    }

    return numeros;
  };

  const totales = calcularTotales();
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-ventas-backend-3nn3.onrender.com";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid px-4 py-3">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="h3 mb-2 text-dark">
                <i className="fas fa-chart-bar text-success mr-2"></i>
                Auditoría Detallada de Ventas
              </h1>
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="badge badge-light border text-dark px-3 py-2">
                  <i className="far fa-calendar-alt mr-1"></i>
                  {formatFecha(desde.split("-").reverse().join("/"))} -{" "}
                  {formatFecha(hasta.split("-").reverse().join("/"))}
                </span>{" "}
                &nbsp;
                <span className="badge badge-success px-3 py-2">
                  <i className="fas fa-boxes mr-1"></i>
                  {data.length} transacciones
                </span>{" "}
                &nbsp;
                <span className="badge badge-info px-3 py-2">
                  <i className="fas fa-dollar-sign mr-1"></i>
                  Facturación: $ {fmt(totales.facturacion)}
                </span>
              </div>
            </div>
            <div className="col-md-4 text-right">
              <div className="btn-group">
                <button
                  className="btn btn-danger btn-lg shadow-sm px-4"
                  onClick={() =>
                    window.open(
                      `${API_URL}/api/ventas/informes/productos-pdf?fecha_inicio=${desde}&fecha_fin=${hasta}`,
                      "_blank",
                    )
                  }
                >
                  <i className="fas fa-file-pdf mr-2"></i> Exportar PDF
                </button>
                <button
                  className="btn btn-outline-secondary btn-lg shadow-sm ml-2"
                  onClick={() => window.print()}
                >
                  <i className="fas fa-print mr-2"></i> Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros, resumen y controles de paginación */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text bg-white border-right-0">
                <i className="fas fa-search text-muted"></i>
              </span>
            </div>
            <input
              type="text"
              className="form-control border-left-0"
              placeholder="Buscar por producto, código o tique..."
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value);
                setPaginaActual(1); // Resetear a página 1 al filtrar
              }}
            />
            {filtro && (
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFiltro("");
                    setPaginaActual(1);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center">
            <div className="card bg-light border-0 mr-3 flex-grow-1">
              <div className="card-body py-2">
                <div className="row text-center">
                  <div className="col-4">
                    <div className="text-muted small">Productos</div>
                    <div className="h5 mb-0 font-weight-bold">
                      {datosFiltrados.length}
                    </div>
                  </div>
                  <div className="col-4 border-left">
                    <div className="text-muted small">Ganancia</div>
                    <div className="h5 mb-0 font-weight-bold text-success">
                      $ {fmt(totales.ganancia)}
                    </div>
                  </div>
                  <div className="col-4 border-left">
                    <div className="text-muted small">Facturación</div>
                    <div className="h5 mb-0 font-weight-bold text-primary">
                      $ {fmt(totales.facturacion)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector de filas por página */}
            <div className="ml-3">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend">
                  <label className="input-group-text bg-white border">
                    <i className="fas fa-list-ol"></i>
                  </label>
                </div>
                <select
                  className="form-control form-control-sm border"
                  value={filasPorPagina}
                  onChange={(e) => {
                    setFilasPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  style={{ width: "80px" }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de paginación */}
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Mostrando <strong>{datosPaginados.length}</strong> de{" "}
              <strong>{datosFiltrados.length}</strong> registros
              {filtro && (
                <span className="ml-2">• Filtrado por: "{filtro}"</span>
              )}
            </div>
            <div className="text-muted">
              Página <strong>{paginaActual}</strong> de{" "}
              <strong>{totalPaginas}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="thead-light">
                <tr>
                  <th
                    className="text-center align-middle"
                    style={{ width: "8%", cursor: "pointer" }}
                    onClick={() => cambiarOrden("fecha")}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      FECHA
                      {orden.campo === "fecha" && (
                        <i
                          className={`fas fa-sort-${orden.direccion === "asc" ? "up" : "down"} ml-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "10%", cursor: "pointer" }}
                    onClick={() => cambiarOrden("ticket_id")}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      TIQUET
                      {orden.campo === "ticket_id" && (
                        <i
                          className={`fas fa-sort-${orden.direccion === "asc" ? "up" : "down"} ml-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th className="align-middle" style={{ width: "25%" }}>
                    PRODUCTO
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "6%" }}
                  >
                    CANT.
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "8%" }}
                  >
                    ESCALA
                  </th>
                  <th
                    className="text-right align-middle"
                    style={{ width: "10%" }}
                  >
                    COSTO
                  </th>
                  <th
                    className="text-right align-middle"
                    style={{ width: "10%" }}
                  >
                    VENTA
                  </th>
                  <th
                    className="text-right align-middle"
                    style={{ width: "12%", cursor: "pointer" }}
                    onClick={() => cambiarOrden("ganancia")}
                  >
                    <div className="d-flex align-items-center justify-content-end">
                      GANANCIA
                      {orden.campo === "ganancia" && (
                        <i
                          className={`fas fa-sort-${orden.direccion === "asc" ? "up" : "down"} ml-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th
                    className="text-right align-middle"
                    style={{ width: "11%", cursor: "pointer" }}
                    onClick={() => cambiarOrden("total")}
                  >
                    <div className="d-flex align-items-center justify-content-end">
                      TOTAL
                      {orden.campo === "total" && (
                        <i
                          className={`fas fa-sort-${orden.direccion === "asc" ? "up" : "down"} ml-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {datosPaginados.length > 0 ? (
                  datosPaginados.map((item, index) => (
                    <tr
                      key={`${item.ticket_id}-${item.codigo}-${index}`}
                      className={
                        index % 2 === 0 ? "table-row-even" : "table-row-odd"
                      }
                      style={{ transition: "background-color 0.2s" }}
                    >
                      <td className="text-center align-middle">
                        <div className="text-nowrap small font-weight-semibold">
                          {formatFecha(item.fecha_fmt)}
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-dark px-3 py-1 font-weight-normal">
                          T-{String(item.ticket_id).padStart(8, "0")}
                        </span>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex flex-column">
                          <div className="font-weight-semibold text-dark line-clamp-2">
                            {item.nombre}
                          </div>
                          <div className="small text-muted">
                            {item.codigo}
                            {item.es_bulto === 1 && (
                              <span className="ml-2 text-info">
                                <i className="fas fa-box mr-1"></i>
                                Bulto x{item.factor_utilizado}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge badge-primary badge-pill px-3 py-1">
                          {fmtNumero(Math.abs(item.cantidad))}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span
                          className={`badge ${item.es_bulto === 1 ? "badge-info" : "badge-light border"} px-2 py-1`}
                        >
                          {(item.unidad_medida || "Unid").toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right align-middle text-muted">
                        $ {fmt(item.costo)}
                      </td>
                      <td className="text-right align-middle font-weight-semibold">
                        $ {fmt(item.venta)}
                      </td>
                      <td className="text-right align-middle">
                        <span className="font-weight-bold text-success">
                          $ {fmt(item.ganancia)}
                        </span>
                      </td>
                      <td className="text-right align-middle font-weight-bold bg-light-blue">
                        $ {fmt(item.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted">
                          No se encontraron registros
                        </h5>
                        <p className="text-muted small">
                          {filtro
                            ? "Intenta con otros términos de búsqueda"
                            : "No hay transacciones en el período seleccionado"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="table-secondary">
                <tr>
                  <td colSpan="7" className="text-right align-middle py-3">
                    <div className="font-weight-bold text-uppercase text-dark">
                      TOTALES GENERALES
                    </div>
                  </td>
                  <td className="text-right align-middle py-3">
                    <div className="h5 mb-0 font-weight-bold text-success">
                      $ {fmt(totales.ganancia)}
                    </div>
                  </td>
                  <td className="text-right align-middle py-3">
                    <div className="h5 mb-0 font-weight-bold text-primary">
                      $ {fmt(totales.facturacion)}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {datosFiltrados.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-12">
            <nav aria-label="Paginación de resultados">
              <ul className="pagination justify-content-center mb-0">
                {/* Botón Anterior */}
                <li
                  className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>

                {/* Números de página */}
                {obtenerNumerosPagina().map((numero, index) => (
                  <li
                    key={index}
                    className={`page-item ${numero === "..." ? "disabled" : ""} ${numero === paginaActual ? "active" : ""}`}
                  >
                    {numero === "..." ? (
                      <span className="page-link">...</span>
                    ) : (
                      <button
                        className="page-link"
                        onClick={() => cambiarPagina(numero)}
                      >
                        {numero}
                      </button>
                    )}
                  </li>
                ))}

                {/* Botón Siguiente */}
                <li
                  className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>

              {/* Información de paginación adicional */}
              <div className="text-center mt-2">
                <small className="text-muted">
                  Mostrando registros {indicePrimeraFila + 1} a{" "}
                  {Math.min(indiceUltimaFila, datosFiltrados.length)} de{" "}
                  {datosFiltrados.length}
                </small>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 d-print-none">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left mr-2"></i> Volver al panel
            </button>
          </div>
          <div className="text-muted small">
            <i className="fas fa-info-circle mr-1"></i>
            Sistema de auditoría de ventas • Fecha de generación:{" "}
            {new Date().toLocaleDateString("es-AR")}
          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style jsx>{`
        .table-row-even {
          background-color: #f8fafc;
        }
        .table-row-odd {
          background-color: #ffffff;
        }
        .table-row-even:hover,
        .table-row-odd:hover {
          background-color: #e3f2fd;
        }
        .bg-light-blue {
          background-color: #f0f8ff !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .font-weight-semibold {
          font-weight: 600;
        }
        .page-item.active .page-link {
          background-color: #28a745;
          border-color: #28a745;
        }
        .page-link {
          color: #28a745;
        }
        .page-link:hover {
          color: #1e7e34;
        }
        @media print {
          .d-print-none {
            display: none !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
          }
          .table thead th {
            background-color: #f8f9fa !important;
            color: #000 !important;
          }
          .pagination,
          .text-muted {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DetalleInformeProductosVentas;
