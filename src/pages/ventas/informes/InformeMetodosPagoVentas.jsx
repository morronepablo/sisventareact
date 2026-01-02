// src/pages/ventas/informes/InformeMetodosPagoVentas.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InformeMetodosPagoVentas = () => {
  const navigate = useNavigate();
  const [fechas, setFechas] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  const handleGenerar = () => {
    navigate(
      `/ventas/informes/metodos-pago/detalle?desde=${fechas.inicio}&hasta=${fechas.fin}`
    );
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Informe de Ventas por Métodos de Pago</b>
        </h1>
        <hr />
        <div className="row d-flex justify-content-center">
          <div className="col-md-6">
            <div className="card card-outline card-info shadow">
              <div className="card-header">
                <h3 className="card-title">Seleccionar Rango</h3>
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
                      className="btn btn-info btn-block text-white"
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

export default InformeMetodosPagoVentas;
