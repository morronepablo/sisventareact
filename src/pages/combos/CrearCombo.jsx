// src/pages/combos/CrearCombo.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";

// --- CSS PARA CORREGIR SELECT2 E INPUTS ---
const select2CustomStyles = `
  .select2-container .select2-selection--single {
    height: 38px !important;
    display: flex !important;
    align-items: center !important;
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__rendered {
    line-height: 38px !important;
    padding-left: 12px !important;
    color: #495057 !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 36px !important;
  }
  .input-uniforme {
    height: 38px !important;
  }
  .btn-uniforme {
    height: 38px !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// --- COMPONENTE PARA LA FILA DE PRODUCTO ---
const FilaProducto = ({
  item,
  index,
  listaProductos,
  onChange,
  onRemove,
  showRemove,
}) => {
  const selectRef = useRef(null);

  useEffect(() => {
    const $select = window.$(selectRef.current);
    $select.select2({ placeholder: "Seleccione un producto", width: "100%" });
    $select.on("change", (e) => onChange(index, "producto_id", e.target.value));
    return () => {
      $select.select2("destroy");
    };
  }, [listaProductos]);

  return (
    <div className="row mb-3 align-items-end">
      <div className="col-md-6">
        <label className="font-weight-bold">Producto</label>
        <select ref={selectRef} className="form-control" required>
          <option value="">Seleccione un producto</option>
          {listaProductos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} (Stock: {p.stock})
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-4">
        <label className="font-weight-bold">Cantidad</label>
        <input
          type="number"
          className="form-control input-uniforme"
          min="1"
          value={item.cantidad}
          onChange={(e) => onChange(index, "cantidad", e.target.value)}
          required
        />
      </div>
      <div className="col-md-2">
        {showRemove && (
          <button
            type="button"
            className="btn btn-danger btn-block btn-uniforme"
            onClick={() => onRemove(index)}
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const CrearCombo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    precio_venta: "",
  });
  const [listaProductos, setListaProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([
    { producto_id: "", cantidad: 1 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/productos").then((res) => {
      setListaProductos(res.data);
      setLoading(false);
    });
  }, []);

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
      await api.post("/combos", {
        ...formData,
        productos: productosSeleccionados,
      });
      Swal.fire({
        icon: "success",
        title: "Registrado",
        text: "Combo creado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/combos/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar el combo", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <style>{select2CustomStyles}</style>
      <div className="container-fluid">
        <h1>Crear Nuevo Combo</h1>
        <hr />
        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow">
              <div className="card-header border-primary">
                <h3 className="card-title text-bold text-primary">
                  Formulario de Registro
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
                          className="form-control input-uniforme"
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
                          className="form-control input-uniforme"
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
                          className="form-control input-uniforme"
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
                      showRemove={productosSeleccionados.length > 1}
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

                <div className="card-footer bg-light border-top p-3">
                  <div className="d-flex justify-content-between w-100">
                    <Link
                      to="/combos/listado"
                      className="btn btn-secondary shadow-sm text-white"
                    >
                      <i className="fas fa-reply mr-1"></i> Volver
                    </Link>
                    <button type="submit" className="btn btn-primary shadow-sm">
                      <i className="fas fa-save mr-1"></i> Registrar Combo
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

export default CrearCombo;
