// src/pages/proveedores/CrearProveedor.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearProveedor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empresa: "",
    marca: "",
    direccion: "",
    telefono: "",
    email: "",
    contacto: "",
    celular: "",
    empresa_id: 1, // Ajustar según tu lógica de sesión
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/proveedores", formData);
      Swal.fire({
        icon: "success",
        title: "¡Registrado!",
        text: "El proveedor se ha guardado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/proveedores/listado");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "No se pudo registrar el proveedor",
      });
    }
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Registro de un nuevo proveedor</b>
            </h1>
          </div>
        </div>
        <hr />
        <br />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow">
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

                  <div className="row">
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
                        className="btn btn-primary shadow-sm"
                      >
                        <i className="fa-regular fa-floppy-disk mr-1"></i>{" "}
                        Registrar
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

export default CrearProveedor;
