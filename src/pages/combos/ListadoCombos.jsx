// src/pages/combos/ListadoCombos.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";

const ListadoCombos = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({}); // Controla qué filas están expandidas

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const res = await api.get("/combos");
      setCombos(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/combos/${id}`);
          setCombos(combos.filter((c) => c.id !== id));
          Swal.fire("Eliminado", "El combo ha sido eliminado.", "success");
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el combo.", "error");
        }
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>Listado de Combos</h1>
          </div>
        </div>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-11">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title">Combos Registrados</h3>
                <Link
                  to="/combos/crear"
                  className="btn btn-primary float-right"
                >
                  <i className="fas fa-plus"></i> Nuevo Combo
                </Link>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover table-sm">
                    <thead className="thead-dark text-center">
                      <tr>
                        <th style={{ width: "40px" }}></th>
                        <th style={{ width: "60px" }}>Nro.</th>
                        <th style={{ width: "120px" }}>Código</th>
                        <th>Nombre</th>
                        <th style={{ width: "150px" }}>Precio Venta</th>
                        <th style={{ width: "150px" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combos.map((combo, index) => (
                        <React.Fragment key={combo.id}>
                          <tr>
                            <td
                              className="text-center"
                              style={{ verticalAlign: "middle" }}
                            >
                              <button
                                className="btn btn-sm p-0"
                                onClick={() => toggleRow(combo.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  outline: "none",
                                }}
                              >
                                {expandedRows[combo.id] ? (
                                  <i
                                    className="fas fa-minus-circle text-danger"
                                    style={{
                                      fontSize: "1.3rem",
                                      cursor: "pointer",
                                    }}
                                  ></i>
                                ) : (
                                  <i
                                    className="fas fa-plus-circle text-success"
                                    style={{
                                      fontSize: "1.3rem",
                                      cursor: "pointer",
                                    }}
                                  ></i>
                                )}
                              </button>
                            </td>
                            <td
                              className="text-center"
                              style={{ verticalAlign: "middle" }}
                            >
                              {index + 1}
                            </td>
                            <td
                              className="text-center"
                              style={{ verticalAlign: "middle" }}
                            >
                              {combo.codigo}
                            </td>
                            <td style={{ verticalAlign: "middle" }}>
                              {combo.nombre}
                            </td>
                            <td
                              className="text-right"
                              style={{
                                verticalAlign: "middle",
                                fontWeight: "bold",
                              }}
                            >
                              ${" "}
                              {parseFloat(combo.precio_venta).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td
                              className="text-center"
                              style={{ verticalAlign: "middle" }}
                            >
                              <div className="btn-group">
                                <Link
                                  to={`/combos/ver/${combo.id}`}
                                  className="btn btn-info btn-sm"
                                  title="Ver detalles"
                                >
                                  <i className="fas fa-eye"></i>
                                </Link>
                                <Link
                                  to={`/combos/editar/${combo.id}`}
                                  className="btn btn-success btn-sm"
                                  title="Editar combo"
                                >
                                  <i className="fas fa-edit"></i>
                                </Link>
                                <button
                                  onClick={() => handleDelete(combo.id)}
                                  className="btn btn-danger btn-sm"
                                  title="Eliminar combo"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* FILA DE DETALLES EXPANDIDA */}
                          {expandedRows[combo.id] && (
                            <tr className="bg-light">
                              <td colSpan="6" className="p-3">
                                <div className="card shadow-sm border-0">
                                  <div className="card-body p-0">
                                    <table className="table table-sm table-bordered m-0">
                                      <thead
                                        className="bg-secondary text-white text-center"
                                        style={{ fontSize: "0.8rem" }}
                                      >
                                        <tr>
                                          <th style={{ width: "150px" }}>
                                            Código
                                          </th>
                                          <th>Producto</th>
                                          <th style={{ width: "100px" }}>
                                            Stock
                                          </th>
                                          <th style={{ width: "150px" }}>
                                            Cantidad / Unidad
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {combo.productos &&
                                        combo.productos.length > 0 ? (
                                          combo.productos.map((prod, i) => (
                                            <tr
                                              key={i}
                                              style={{ fontSize: "0.85rem" }}
                                            >
                                              <td className="text-center">
                                                {prod.codigo}
                                              </td>
                                              <td>{prod.nombre}</td>
                                              <td className="text-center">
                                                {prod.stock}
                                              </td>
                                              <td className="text-right pr-3">
                                                {prod.cantidad}{" "}
                                                {prod.unidad || "Unidades"}
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan="4"
                                              className="text-center"
                                            >
                                              No hay productos registrados en
                                              este combo.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}

                      {combos.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center p-4">
                            No hay combos registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoCombos;
