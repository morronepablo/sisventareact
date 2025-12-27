// src/pages/usuarios/VerUsuario.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const VerUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUsuario(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        alert("No se pudo cargar el usuario.");
        navigate("/usuarios/listado");
      }
    };

    fetchUsuario();
  }, [id, navigate]);

  const handleVolver = () => {
    navigate("/usuarios/listado");
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
            <h1 className="m-0">Ver Usuario</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Detalles del usuario</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        <strong>Nombre:</strong>
                      </label>
                      <p className="form-control-static">{usuario.name}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        <strong>Email:</strong>
                      </label>
                      <p className="form-control-static">{usuario.email}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        <strong>ID de Empresa:</strong>
                      </label>
                      <p className="form-control-static">
                        {usuario.empresa_id}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        <strong>Rol(es):</strong>
                      </label>
                      {usuario.roles && usuario.roles.length > 0 ? (
                        <div>
                          {usuario.roles.map((role, idx) => (
                            <span
                              key={idx}
                              className={`badge ${
                                role.name === "Administrador"
                                  ? "badge-danger"
                                  : "badge-info"
                              } mr-1`}
                            >
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

export default VerUsuario;
