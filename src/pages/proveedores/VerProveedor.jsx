// src/pages/proveedores/VerProveedor.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        const response = await api.get(`/proveedores/${id}`);
        setProveedor(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar proveedor:", error);
        setLoading(false);
      }
    };
    fetchProveedor();
  }, [id]);

  if (loading) return <div className="p-4">Cargando datos...</div>;
  if (!proveedor) return <div className="p-4">Proveedor no encontrado.</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Detalle del Proveedor</b>
            </h1>
          </div>
        </div>
        <hr />
        <br />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            {/* Clase callout-info de AdminLTE */}
            <div className="callout callout-info shadow-sm bg-white">
              <div className="card-header border-0 bg-transparent">
                <h3 className="card-title text-info font-weight-bold">
                  Datos Registrados
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Empresa</label>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={proveedor.empresa || ""}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <label>Marca</label>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={proveedor.marca || ""}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Dirección</label>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={proveedor.direccion || ""}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <label>Teléfono</label> <b className="text-danger">*</b>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={proveedor.telefono || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Email</label> <b className="text-danger">*</b>
                      <input
                        type="email"
                        className="form-control border-info bg-white"
                        value={proveedor.email || ""}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Contacto</label> <b className="text-danger">*</b>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={proveedor.contacto || ""}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Celular</label> <b className="text-danger">*</b>
                      <input
                        type="text"
                        className="form-control border-info bg-white"
                        value={proveedor.celular || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <hr />
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-end">
                    <button
                      onClick={() => navigate("/proveedores/listado")}
                      className="btn btn-secondary shadow-sm"
                    >
                      <i className="fas fa-reply mr-1"></i> Volver
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

export default VerProveedor;
