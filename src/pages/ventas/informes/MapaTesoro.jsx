// src/pages/ventas/MapaTesoro.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

const MapaTesoro = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const horas = Array.from({ length: 15 }, (_, i) => i + 8); // De 8hs a 22hs

  useEffect(() => {
    api
      .get("/ventas/informes/heatmap")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error API:", err);
        setLoading(false);
      });
  }, []);

  const getIntensityColor = (diaNum, hora) => {
    // 🚀 VALIDACIÓN DE SEGURIDAD
    if (!data || !data.matrix || data.matrix.length === 0) return "#f8f9fa";

    const punto = data.matrix.find(
      (r) => r.dia_numero === diaNum && r.hora === hora
    );
    if (!punto) return "#f8f9fa";

    const maxVenta = Math.max(
      ...data.matrix.map((m) => parseFloat(m.total_facturado))
    );
    const ratio = punto.total_facturado / maxVenta;

    if (ratio > 0.8) return "#dc3545"; // Rojo
    if (ratio > 0.5) return "#fd7e14"; // Naranja
    if (ratio > 0.2) return "#ffc107"; // Amarillo
    return "#e1f5fe"; // Celeste
  };

  const getTooltipData = (diaNum, hora) => {
    if (!data || !data.matrix) return "$ 0";
    const punto = data.matrix.find(
      (r) => r.dia_numero === diaNum && r.hora === hora
    );
    return punto
      ? `$ ${parseFloat(punto.total_facturado).toLocaleString("es-AR")}`
      : "$ 0";
  };

  if (loading) return <LoadingSpinner />;

  // Si después de cargar no hay data o la matrix está vacía
  if (!data || !data.matrix) {
    return (
      <div className="p-4">No hay datos disponibles para generar el mapa.</div>
    );
  }

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-map-marked-alt text-primary mr-2"></i>
        <b>El Mapa del Tesoro</b>
      </h1>
      <p className="text-muted">
        Mapa de calor de ventas (90 días históricos).
      </p>
      <hr />

      <div className="card card-outline card-primary shadow">
        <div className="card-header">
          <h3 className="card-title text-bold">Matriz de Productividad</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered text-center table-sm">
              <thead>
                <tr>
                  <th style={{ width: "80px" }} className="bg-light">
                    Hora
                  </th>
                  {dias.map((d, i) => (
                    <th key={i} className="bg-light">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horas.map((h) => (
                  <tr key={h}>
                    <td className="bg-light font-weight-bold">{h}:00</td>
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <td
                        key={d}
                        style={{
                          backgroundColor: getIntensityColor(d, h),
                          height: "40px",
                          cursor: "help",
                        }}
                        title={`${dias[d - 1]} a las ${h}hs: ${getTooltipData(
                          d,
                          h
                        )}`}
                      >
                        {getIntensityColor(d, h) === "#dc3545" && (
                          <i className="fa fa-fire text-white"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center mt-3 small">
            <div className="mr-3">
              <span
                className="badge border"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                &nbsp;&nbsp;
              </span>{" "}
              Sin Ventas
            </div>
            <div className="mr-3">
              <span className="badge" style={{ backgroundColor: "#e1f5fe" }}>
                &nbsp;&nbsp;
              </span>{" "}
              Baja
            </div>
            <div className="mr-3">
              <span className="badge" style={{ backgroundColor: "#ffc107" }}>
                &nbsp;&nbsp;
              </span>{" "}
              Media
            </div>
            <div className="mr-3">
              <span className="badge" style={{ backgroundColor: "#dc3545" }}>
                &nbsp;&nbsp;
              </span>{" "}
              HORA DE ORO
            </div>
          </div>
        </div>
      </div>

      <div className="alert bg-dark text-white shadow-sm border-left-primary mt-3">
        <h5>
          <i className="fas fa-robot text-primary mr-2"></i>
          <b>Conclusiones BI:</b>
        </h5>
        <p className="lead">{data.conclusiones?.pico_maximo}</p>
        <hr style={{ borderColor: "#444" }} />
        <p className="mb-0">{data.conclusiones?.sugerencia}</p>
      </div>
    </div>
  );
};

export default MapaTesoro;
