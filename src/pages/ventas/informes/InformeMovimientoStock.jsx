// src/pages/ventas/informes/InformeMovimientoStock.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InformeMovimientoStock = () => {
  const navigate = useNavigate();
  const [fechas, setFechas] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  const handleGenerar = () => {
    navigate(
      `/ventas/informes/movimiento-stock/detalle?desde=${fechas.inicio}&hasta=${fechas.fin}`
    );
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Informe de Movimiento de Stock</b>
        </h1>
        <hr />
        <div className="row d-flex justify-content-center">
          <div className="col-md-6">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title">Rango de Fechas</h3>
              </div>
              <div className="card-body">
                <div className="row align-items-end">
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
                  <div className="col-md-2">
                    <button
                      className="btn btn-primary btn-block"
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

export default InformeMovimientoStock;
