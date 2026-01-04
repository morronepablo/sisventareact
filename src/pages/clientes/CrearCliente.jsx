// src/pages/clientes/CrearCliente.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const CrearCliente = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_cliente: "",
    cuil_codigo: "",
    telefono: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/clientes", formData);
      Swal.fire({
        icon: "success",
        title: "¡Registrado!",
        text: "El cliente se ha guardado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/clientes/listado");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "No se pudo registrar el cliente",
      });
    }
  };

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Registro de un nuevo cliente</b>
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
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Cliente</label> <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="nombre_cliente"
                          className="form-control"
                          placeholder="Nombre completo"
                          value={formData.nombre_cliente}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>C.U.I.L. / D.N.I.</label>{" "}
                        <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="cuil_codigo"
                          className="form-control"
                          placeholder="Número de identificación"
                          value={formData.cuil_codigo}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Teléfono</label> <b className="text-danger">*</b>
                        <input
                          type="text"
                          name="telefono"
                          className="form-control"
                          placeholder="Ej: 1122334455"
                          value={formData.telefono}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Correo Electrónico</label>{" "}
                        <b className="text-danger">*</b>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="usuario@correo.com"
                          value={formData.email}
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
                        onClick={() => navigate("/clientes/listado")}
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

export default CrearCliente;
