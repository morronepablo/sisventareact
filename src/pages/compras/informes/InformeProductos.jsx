// src/pages/compras/informes/InformeProductos.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InformeProductos = () => {
  const navigate = useNavigate();
  const [fechas, setFechas] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  const handleGenerar = () => {
    navigate(
      `/compras/informes/productos/detalle?desde=${fechas.inicio}&hasta=${fechas.fin}`,
    );
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1 className="text-bold">
          <i className="fas fa-boxes text-primary mr-2"></i>
          Informe de Compras por Productos
        </h1>
        <p className="text-muted">
          Analice el volumen de compra discriminado por proveedor y costo
          histórico.
        </p>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-6">
            <div className="card card-outline card-primary shadow-lg">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  Configuración del Período
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-5">
                    <label className="small text-muted">FECHA INICIO</label>
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
                    <label className="small text-muted">FECHA FIN</label>
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
                      className="btn btn-primary btn-block shadow-sm"
                      onClick={handleGenerar}
                    >
                      <i className="fas fa-search"></i>
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

export default InformeProductos;
