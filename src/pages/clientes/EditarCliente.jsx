// src/pages/clientes/EditarCliente.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const EditarCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState({
    nombre_cliente: "",
    cuil_codigo: "",
    telefono: "",
    email: "",
    fecha_nacimiento: "", // 👈 Agregado al estado
  });

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const res = await api.get(`/clientes/${id}`);

        // 👈 FORMATEO DE FECHA PARA EL INPUT (De ISO a YYYY-MM-DD)
        if (res.data.fecha_nacimiento) {
          res.data.fecha_nacimiento = res.data.fecha_nacimiento.split("T")[0];
        }

        setCliente(res.data);
        setLoading(false);
      } catch (error) {
        Swal.fire("Error", "No se pudo obtener la información", "error");
        navigate("/clientes/listado");
      }
    };
    fetchCliente();
  }, [id, navigate]);

  const handleChange = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clientes/${id}`, cliente);
      Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "El cliente ha sido modificado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/clientes/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el cliente", "error");
    }
  };

  if (loading) return <div className="p-4 text-center">Cargando datos...</div>;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>
              <b>Modificación de un cliente</b>
            </h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-9">
            <div className="card card-outline card-success shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Datos del Perfil</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Cliente</label>
                        <input
                          type="text"
                          name="nombre_cliente"
                          className="form-control"
                          value={cliente.nombre_cliente}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>C.U.I.L./D.N.I.</label>
                        <input
                          type="text"
                          name="cuil_codigo"
                          className="form-control"
                          value={cliente.cuil_codigo}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input
                          type="text"
                          name="telefono"
                          className="form-control"
                          value={cliente.telefono}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={cliente.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 🚀 NUEVO CAMPO FECHA DE NACIMIENTO */}
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          <i className="fas fa-birthday-cake mr-1 text-danger"></i>{" "}
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          name="fecha_nacimiento"
                          className="form-control"
                          value={cliente.fecha_nacimiento || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <hr />
                  <div className="row">
                    <div className="col-md-12 d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-secondary shadow-sm"
                        onClick={() => navigate("/clientes/listado")}
                      >
                        <i className="fas fa-reply mr-1"></i> Volver
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success shadow-sm font-weight-bold"
                      >
                        <i className="fas fa-save mr-1"></i> Guardar Cambios
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

export default EditarCliente;
