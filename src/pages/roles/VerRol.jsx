// src/pages/roles/VerRol.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const VerRol = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRol = async () => {
      try {
        const response = await api.get(`/roles/${id}/detalles`);
        setRol(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar rol:", error);
        alert("No se pudo cargar el rol.");
        navigate("/roles/listado");
      }
    };

    fetchRol();
  }, [id, navigate]);

  const handleVolver = () => {
    window.location.href = "/roles/listado";
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
            <h1 className="m-0">Ver Rol</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Detalles del rol</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        <strong>Nombre:</strong>
                      </label>
                      <p className="form-control-static">{rol.name}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        <strong>Usuarios asignados:</strong>
                      </label>
                      <p className="form-control-static">{rol.user_count}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        <strong>Permisos asignados:</strong>
                      </label>
                      {rol.permissions && rol.permissions.length > 0 ? (
                        <div>
                          {rol.permissions.map((permiso, idx) => (
                            <span key={idx} className="badge badge-info mr-1">
                              {permiso.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="form-control-static">
                          Sin permisos asignados
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

export default VerRol;
