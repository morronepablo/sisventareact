// src/pages/categorias/ListadoCategorias.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const ListadoCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategorias = async () => {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleCrear = () => {
    window.location.href = "/categorias/crear";
  };

  const handleVer = (id) => {
    window.location.href = `/categorias/ver/${id}`;
  };

  const handleEditar = (id) => {
    window.location.href = `/categorias/editar/${id}`;
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categorias/${id}`);
        Swal.fire("¡Eliminado!", "La categoría ha sido eliminada.", "success");
        fetchCategorias();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar la categoría.", "error");
      }
    }
  };

  if (loading)
    return (
      <div className="content-header">
        <div className="container-fluid">Cargando...</div>
      </div>
    );

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Categorías</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title my-1">Listado de categorías</h3>
                <div className="card-tools">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleCrear}
                  >
                    <i className="fa fa-plus"></i> Crear categoría
                  </button>
                </div>
              </div>
              <div className="card-body">
                <table className="table table-striped table-bordered">
                  <thead className="thead-dark">
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((cat, i) => (
                      <tr key={cat.id}>
                        <td>{i + 1}</td>
                        <td>{cat.nombre}</td>
                        <td>{cat.descripcion || "–"}</td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => handleVer(cat.id)}
                              title="Ver"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditar(cat.id)}
                              title="Editar"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleEliminar(cat.id)}
                              title="Eliminar"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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
      </div>
    </div>
  );
};

export default ListadoCategorias;
