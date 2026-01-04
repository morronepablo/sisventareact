// src/pages/ventas/informes/InformeProductosVentas.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InformeProductosVentas = () => {
  const navigate = useNavigate();
  // --- LÓGICA PARA OBTENER FECHA LOCAL DE ARGENTINA ---
  const [fechas, setFechas] = useState(() => {
    const hoy = new Date();
    // Ajuste de milisegundos para Argentina (GMT-3)
    const offset = hoy.getTimezoneOffset() * 60000;
    const hoyLocal = new Date(hoy - offset).toISOString().split("T")[0];

    // El primer día del mes también basado en la fecha local
    const inicioMes = hoyLocal.substring(0, 8) + "01";

    return {
      inicio: inicioMes,
      fin: hoyLocal,
    };
  });

  const handleGenerar = () => {
    navigate(
      `/ventas/informes/productos/detalle?desde=${fechas.inicio}&hasta=${fechas.fin}`
    );
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Informe de Productos - Ventas</b>
        </h1>
        <hr />
        <div className="row d-flex justify-content-center">
          <div className="col-md-6">
            <div className="card card-outline card-success shadow">
              <div className="card-header">
                <h3 className="card-title">Informe de Productos Vendidos</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-5">
                    <label>Desde</label>
                    <input
                      type="date"
                      className="form-control"
                      value={fechas.inicio}
                      onChange={(e) =>
                        setFechas({ ...fechas, inicio: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-5">
                    <label>Hasta</label>
                    <input
                      type="date"
                      className="form-control"
                      value={fechas.fin}
                      onChange={(e) =>
                        setFechas({ ...fechas, fin: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      className="btn btn-success btn-block"
                      onClick={handleGenerar}
                    >
                      <i className="fas fa-file-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformeProductosVentas;
