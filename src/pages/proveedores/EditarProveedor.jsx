// src/pages/proveedores/EditarProveedor.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const EditarProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    empresa: "",
    marca: "",
    direccion: "",
    telefono: "",
    email: "",
    contacto: "",
    celular: "",
  });

  // Cargar datos actuales del proveedor
  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        const response = await api.get(`/proveedores/${id}`);
        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar proveedor:", error);
        Swal.fire(
          "Error",
          "No se pudo cargar la información del proveedor",
          "error"
        );
        navigate("/proveedores/listado");
      }
    };
    fetchProveedor();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/proveedores/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "El proveedor se ha actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/proveedores/listado");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "No se pudo actualizar el proveedor",
      });
    }
  };

  if (loading)
    return <div className="p-4">Cargando datos del proveedor...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Actualizar un proveedor</b>
            </h1>
          </div>
        </div>
        <hr />
        <br />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            {/* card-success para diferenciar que es edición */}
            <div className="card card-outline card-success shadow">
              <div className="card-header">
                <h3 className="card-title">Ingrese los datos</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Empresa</label> <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="empresa"
                          className="form-control"
                          value={formData.empresa}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label>Marca</label> <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="marca"
                          className="form-control"
                          value={formData.marca}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Dirección</label>{" "}
                        <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="direccion"
                          className="form-control"
                          value={formData.direccion}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label>Teléfono</label> <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="telefono"
                          className="form-control"
                          value={formData.telefono}
                          onChange={handleChange}
                          required
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
                          name="email"
                          className="form-control"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Contacto</label> <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="contacto"
                          className="form-control"
                          value={formData.contacto}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Celular</label> <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="celular"
                          className="form-control"
                          value={formData.celular}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <hr />
                  <div className="row">
                    <div className="col-md-12 d-flex justify-content-between">
                      <button
                        type="button"
                        onClick={() => navigate("/proveedores/listado")}
                        className="btn btn-secondary shadow-sm"
                      >
                        <i className="fas fa-reply mr-1"></i> Volver
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success shadow-sm"
                      >
                        <i className="fa-regular fa-floppy-disk mr-1"></i>{" "}
                        Actualizar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProveedor;
