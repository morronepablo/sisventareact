// // src/pages/productos/TermometroVentas.jsx
// import React, { useEffect, useState } from "react";
// import api from "../../services/api";
// import LoadingSpinner from "../../components/LoadingSpinner";
// import { Bar } from "react-chartjs-2";

// const TermometroVentas = () => {
//   const [datos, setDatos] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Estados DataTable
//   const [currentPage, setCurrentPage] = useState(1);
//   const entriesPerPage = 5;

//   const cargarTermometro = async () => {
//     try {
//       const res = await api.get("/dashboard/termometro-categorias");
//       setDatos(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     cargarTermometro();
//   }, []);

//   if (loading) return <LoadingSpinner />;

//   // --- LÓGICA PARA EL GRÁFICO ---
//   const horas = Array.from({ length: 24 }, (_, i) => `${i}hs`);
//   const categoriasUnicas = [...new Set(datos.map((d) => d.categoria))];

//   const colors = [
//     "#f56954",
//     "#00a65a",
//     "#f39c12",
//     "#00c0ef",
//     "#3c8dbc",
//     "#605ca8",
//     "#ff851b",
//     "#D81B60",
//     "#39CCCC",
//     "#01ff70",
//   ];

//   const datasets = categoriasUnicas.map((cat, i) => ({
//     label: cat,
//     data: horas.map((_, h) => {
//       const registro = datos.find((d) => d.hora === h && d.categoria === cat);
//       return registro ? parseFloat(registro.cantidad_items) : 0;
//     }),
//     backgroundColor: colors[i % colors.length],
//   }));

//   const chartData = { labels: horas, datasets };

//   // Paginación de la tabla inferior
//   const totalPages = Math.ceil(datos.length / entriesPerPage);
//   const currentItems = datos.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   return (
//     <div className="container-fluid pt-3 pb-5">
//       <h1 className="text-bold">
//         <i className="fas fa-thermometer-half text-danger mr-2"></i> Termómetro
//         de Ventas por Categoría
//       </h1>
//       <p className="text-muted">
//         Análisis horario de salida de productos (Últimos 30 días).
//       </p>

//       {/* GRÁFICO DE CALOR (STAKED BAR) */}
//       <div className="card card-outline card-danger shadow">
//         <div className="card-header">
//           <h3 className="card-title text-bold">Flujo por Rubro</h3>
//         </div>
//         <div className="card-body">
//           <div style={{ height: "400px" }}>
//             <Bar
//               data={chartData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 scales: { x: { stacked: true }, y: { stacked: true } },
//                 plugins: { legend: { position: "bottom" } },
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* DATATABLE DE APOYO */}
//       <div className="card card-outline card-dark shadow">
//         <div className="card-header">
//           <h3 className="card-title text-bold">Picos de Venta Detallados</h3>
//         </div>
//         <div className="card-body p-0 text-sm">
//           <table className="table table-striped mb-0">
//             <thead className="bg-dark">
//               <tr>
//                 <th className="text-center">Franja Horaria</th>
//                 <th>Categoría</th>
//                 <th className="text-center">Items Vendidos (Prom. Mes)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems.map((d, i) => (
//                 <tr key={i}>
//                   <td className="text-center text-bold">
//                     {d.hora}:00 - {d.hora}:59 hs
//                   </td>
//                   <td>
//                     <i className="fas fa-tag mr-2 text-muted"></i>
//                     {d.categoria}
//                   </td>
//                   <td className="text-center">
//                     <span className="badge badge-danger px-3">
//                       {d.cantidad_items} unidades
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="d-flex justify-content-between p-2">
//             <small>Mostrando picos de demanda</small>
//             <nav>
//               <ul className="pagination pagination-sm m-0">
//                 <li
//                   className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage((p) => p - 1)}
//                   >
//                     Ant.
//                   </button>
//                 </li>
//                 <li className="page-item active">
//                   <span className="page-link">{currentPage}</span>
//                 </li>
//                 <li
//                   className={`page-item ${
//                     currentPage === totalPages ? "disabled" : ""
//                   }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage((p) => p + 1)}
//                   >
//                     Sig.
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TermometroVentas;

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Bar } from "react-chartjs-2";

const TermometroVentas = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados DataTable
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarTermometro = async () => {
    try {
      const res = await api.get("/dashboard/termometro-categorias");
      setDatos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTermometro();
  }, []);

  if (loading) return <LoadingSpinner />;

  // --- LÓGICA PARA EL GRÁFICO (STAKED BAR 24HS) ---
  const horasLabels = Array.from({ length: 24 }, (_, i) => `${i}hs`);
  const categoriasUnicas = [...new Set(datos.map((d) => d.categoria))];
  const colors = [
    "#f56954",
    "#00a65a",
    "#f39c12",
    "#00c0ef",
    "#3c8dbc",
    "#605ca8",
    "#ff851b",
    "#D81B60",
    "#39CCCC",
    "#01ff70",
  ];

  const datasets = categoriasUnicas.map((cat, i) => ({
    label: cat,
    data: Array.from({ length: 24 }, (_, h) => {
      const registro = datos.find((d) => d.hora === h && d.categoria === cat);
      return registro ? parseFloat(registro.cantidad_items) : 0;
    }),
    backgroundColor: colors[i % colors.length],
  }));

  const chartData = { labels: horasLabels, datasets };

  // --- LÓGICA DATATABLE ---
  const filtered = datos.filter((d) =>
    d.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  return (
    <div className="container-fluid pt-3 pb-5">
      <div className="row mb-2">
        <div className="col-sm-6">
          <h1 className="m-0 text-dark text-bold">
            Termómetro de Ventas por Categoría
          </h1>
        </div>
      </div>

      <div className="card card-outline card-danger shadow">
        <div className="card-header border-0">
          <h3 className="card-title text-bold">
            <i className="fas fa-fire mr-2 text-danger"></i> Mapa de Calor
            Horario (30 días)
          </h3>
        </div>
        <div className="card-body">
          <div style={{ height: "350px" }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true },
                  y: {
                    stacked: true,
                    title: { display: true, text: "Cantidad de Productos" },
                  },
                },
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { boxWidth: 12, font: { size: 11 } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="card card-outline card-dark shadow">
        <div className="card-header">
          <h3 className="card-title text-bold">Picos de Demanda por Rubro</h3>
        </div>
        <div className="card-body">
          {/* Header DataTable */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <span>Mostrar</span>
              <select
                className="form-control form-control-sm mx-2"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
              <span>registros</span>
            </div>
            <input
              type="search"
              className="form-control form-control-sm shadow-sm"
              style={{ width: "200px" }}
              placeholder="Buscar categoría..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <table className="table table-bordered table-striped table-hover">
            <thead className="bg-dark">
              <tr>
                <th className="text-center">Franja Horaria</th>
                <th>Categoría</th>
                <th className="text-center">Volumen Vendido</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((d, i) => (
                  <tr key={i}>
                    <td className="text-center align-middle text-bold">
                      {d.hora}:00 - {d.hora}:59 hs
                    </td>
                    <td className="align-middle">
                      <i className="fas fa-tag mr-2 text-muted"></i>
                      {d.categoria}
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className="badge badge-danger px-3 py-2"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {d.cantidad_items} unidades
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No hay datos registrados en este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer DataTable */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small>
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, filtered.length)} de {filtered.length}{" "}
              registros
            </small>
            <nav>
              <ul className="pagination pagination-sm m-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Anterior
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermometroVentas;
