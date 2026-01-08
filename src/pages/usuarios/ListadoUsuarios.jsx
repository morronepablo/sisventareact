// src/pages/usuarios/ListadoUsuarios.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const ListadoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const spanishLanguage = {
    sProcessing: "Procesando...",
    sLengthMenu: "Mostrar _MENU_ registros",
    sZeroRecords: "No se encontraron resultados",
    sEmptyTable: "Ningún dato disponible en esta tabla",
    sInfo:
      "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    sSearch: "Buscar:",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Siguiente",
      sPrevious: "Anterior",
    },
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/users");
      setUsuarios(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (!loading && usuarios.length > 0) {
      const tableId = "#usuarios-table";
      const timer = setTimeout(() => {
        if (window.$.fn.DataTable.isDataTable(tableId)) {
          window.$(tableId).DataTable().destroy();
        }
        window.$(tableId).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          autoWidth: false,
          pageLength: 10,
          language: spanishLanguage,
          dom: "rtip",
          columnDefs: [{ targets: -1, orderable: false }],
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, usuarios]);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/users/${id}`);
        await Swal.fire({
          title: "¡Eliminado!",
          text: "El usuario ha sido borrado.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // --- LA SOLUCIÓN DEFINITIVA ---
        window.location.reload();
      } catch (error) {
        const mensaje = error.response?.data?.message || "No se pudo eliminar.";
        Swal.fire("Error", mensaje, "error");
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <h1>
          <b>Listado de Usuarios</b>
        </h1>
        <hr />
        <div className="card card-outline card-primary shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Usuarios registrados</h3>
            <div className="card-tools">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/usuarios/crear")}
              >
                <i className="fa fa-plus"></i> Crear nuevo
              </button>
            </div>
          </div>
          <div className="card-body">
            <table
              id="usuarios-table"
              className="table table-striped table-bordered table-hover table-sm"
            >
              <thead className="thead-dark text-center">
                <tr>
                  <th>Nro.</th>
                  <th>Rol</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr key={usuario.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">
                      {usuario.roles?.map((r, i) => (
                        <span
                          key={i}
                          className={`badge ${
                            r.name === "Administrador"
                              ? "badge-danger"
                              : "badge-info"
                          } mr-1`}
                        >
                          {r.name}
                        </span>
                      ))}
                    </td>
                    <td>{usuario.name}</td>
                    <td>{usuario.email}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() =>
                            navigate(`/usuarios/ver/${usuario.id}`)
                          }
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            navigate(`/usuarios/editar/${usuario.id}`)
                          }
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        {usuario.puede_eliminarse && usuario.id !== user?.id ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(usuario.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm disabled"
                            style={{ cursor: "not-allowed", opacity: 0.6 }}
                          >
                            <i className="fas fa-lock"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoUsuarios;
