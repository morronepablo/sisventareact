// src/pages/permisos/VerPermiso.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const VerPermiso = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || window.location.pathname.split("/").pop();

  const [permiso, setPermiso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermiso = async () => {
      try {
        const response = await api.get(`/permissions/${id}/detalles`);
        setPermiso(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar permiso:", error);
        alert("No se pudo cargar el permiso.");
        window.location.href = "/permisos/listado";
      }
    };

    fetchPermiso();
  }, [id]);

  const handleVolver = () => {
    window.location.href = "/permisos/listado";
  };

  if (loading) {
    return (
      <div className="content-header">
        <div className="container-fluid">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Ver Permiso</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Detalles del permiso</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        <strong>Nombre:</strong>
                      </label>
                      <p className="form-control-static">{permiso.name}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        <strong>Roles asignados:</strong>
                      </label>
                      {permiso.roles && permiso.roles.length > 0 ? (
                        <div>
                          {permiso.roles.map((role, idx) => (
                            <span key={idx} className="badge badge-info mr-1">
                              {role.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="form-control-static">
                          Sin roles asignados
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={handleVolver}
                >
                  Volver al listado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerPermiso;
