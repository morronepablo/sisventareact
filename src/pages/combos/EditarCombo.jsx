// src/pages/combos/EditarCombo.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";

// --- CSS CORREGIDO PARA SELECT2 E INPUTS ---
const select2CustomStyles = `
  .select2-container .select2-selection--single {
    height: 38px !important;
    display: flex !important;
    align-items: center !important;
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
    box-shadow: none !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__rendered {
    line-height: 38px !important; /* Centrado vertical del texto */
    padding-left: 12px !important;
    color: #495057 !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 36px !important;
  }
  .input-cantidad {
    height: 38px !important;
    vertical-align: middle !important;
  }
  .btn-eliminar {
    height: 38px !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// --- COMPONENTE PARA LA FILA DE PRODUCTO ---
const FilaProducto = ({ item, index, listaProductos, onChange, onRemove }) => {
  const [loading, setLoading] = useState(true);
  const selectRef = useRef(null);

  useEffect(() => {
    const $select = window.$(selectRef.current);

    $select.select2({
      placeholder: "Seleccione un producto",
      width: "100%",
    });

    $select.on("change", (e) => {
      onChange(index, "producto_id", e.target.value);
    });

    $select.val(item.producto_id).trigger("change.select2");
    setLoading(false);
    return () => {
      $select.select2("destroy");
    };
  }, [listaProductos]);

  useEffect(() => {
    window.$(selectRef.current).val(item.producto_id).trigger("change.select2");
  }, [item.producto_id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row mb-3 align-items-end">
      <div className="col-md-6">
        <label className="font-weight-bold">Producto</label>
        <select
          ref={selectRef}
          className="form-control"
          value={item.producto_id}
          required
        >
          <option value="">Seleccione un producto</option>
          {listaProductos.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.nombre} (Stock: {p.stock})
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-4">
        <label className="font-weight-bold">Cantidad</label>
        <input
          type="number"
          className="form-control input-cantidad"
          min="1"
          value={item.cantidad}
          onChange={(e) => onChange(index, "cantidad", e.target.value)}
          required
        />
      </div>
      <div className="col-md-2">
        <button
          type="button"
          className="btn btn-danger btn-block btn-eliminar"
          onClick={() => onRemove(index)}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const EditarCombo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    precio_venta: "",
  });

  const [listaProductos, setListaProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const [resCombo, resProds] = await Promise.all([
        api.get(`/combos/${id}`),
        api.get("/productos"),
      ]);

      setFormData({
        nombre: resCombo.data.nombre,
        codigo: resCombo.data.codigo,
        precio_venta: resCombo.data.precio_venta,
      });

      setListaProductos(resProds.data);

      const prodsMapped = resCombo.data.productos.map((p) => ({
        producto_id: String(p.producto_id),
        cantidad: p.cantidad,
      }));

      setProductosSeleccionados(prodsMapped);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cargar la información", "error");
    }
  };

  const handleAddRow = () => {
    setProductosSeleccionados([
      ...productosSeleccionados,
      { producto_id: "", cantidad: 1 },
    ]);
  };

  const handleRemoveRow = (index) => {
    const nuevos = [...productosSeleccionados];
    nuevos.splice(index, 1);
    setProductosSeleccionados(nuevos);
  };

  const handleProductChange = (index, field, value) => {
    const nuevos = [...productosSeleccionados];
    nuevos[index][field] = value;
    setProductosSeleccionados(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (productosSeleccionados.some((p) => !p.producto_id)) {
      return Swal.fire("Atención", "Seleccione todos los productos", "warning");
    }

    try {
      await api.put(`/combos/${id}`, {
        ...formData,
        productos: productosSeleccionados,
      });

      Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "Combo actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/combos/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el combo", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <style>{select2CustomStyles}</style>

      <div className="container-fluid">
        <h1>
          Editar Combo: <b>{formData.nombre}</b>
        </h1>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-success shadow">
              <div className="card-header border-success">
                <h3 className="card-title text-bold text-success">
                  Ingrese los datos
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="font-weight-bold">Nombre</label>
                        <input
                          type="text"
                          className="form-control input-cantidad"
                          value={formData.nombre}
                          onChange={(e) =>
                            setFormData({ ...formData, nombre: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="font-weight-bold">Código</label>
                        <input
                          type="text"
                          className="form-control input-cantidad"
                          value={formData.codigo}
                          onChange={(e) =>
                            setFormData({ ...formData, codigo: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="font-weight-bold">Precio Venta</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control input-cantidad"
                          value={formData.precio_venta}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              precio_venta: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <hr />
                  <h5 className="mb-4 text-secondary font-weight-bold">
                    Productos del Combo
                  </h5>

                  {productosSeleccionados.map((item, index) => (
                    <FilaProducto
                      key={index}
                      index={index}
                      item={item}
                      listaProductos={listaProductos}
                      onChange={handleProductChange}
                      onRemove={handleRemoveRow}
                    />
                  ))}

                  <button
                    type="button"
                    className="btn btn-secondary mt-2 shadow-sm text-white"
                    onClick={handleAddRow}
                  >
                    <i className="fas fa-plus mr-1"></i> Agregar Producto
                  </button>
                </div>

                {/* --- FOOTER CORREGIDO --- */}
                <div className="card-footer bg-light border-top p-3">
                  <div className="d-flex justify-content-between w-100">
                    <Link
                      to="/combos/listado"
                      className="btn btn-secondary shadow-sm text-white"
                    >
                      <i className="fas fa-reply mr-1"></i> Volver
                    </Link>
                    <button type="submit" className="btn btn-success shadow-sm">
                      <i className="fas fa-save mr-1"></i> Actualizar Combo
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarCombo;
