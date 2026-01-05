// src/pages/ajustes/CrearAjuste.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

// --- CSS ESPECÍFICO PARA REPLICAR ADMINLTE/BOOTSTRAP4 EN SELECT2 ---
const select2CustomStyles = `
  .select2-container--default .select2-selection--single {
    height: 38px !important;
    padding: 6px 12px !important;
    font-size: 1rem !important;
    line-height: 1.5 !important;
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
    box-shadow: none !important;
    display: flex !important;
    align-items: center !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__rendered {
    color: #495057 !important;
    padding-left: 0 !important;
    line-height: normal !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 36px !important;
    right: 10px !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__placeholder {
    color: #6c757d !important;
  }
  .select2-dropdown {
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  }
  .select2-search__field {
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
    padding: 5px !important;
  }
  .input-uniforme {
    height: 38px !important;
  }
`;

const CrearAjuste = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectProdRef = useRef(null);
  const selectTipoRef = useRef(null);

  const [formData, setFormData] = useState({
    producto_id: "",
    tipo: "",
    cantidad: "",
    motivo: "",
    fecha: (() => {
      const hoy = new Date();
      const offset = hoy.getTimezoneOffset() * 60000;
      return new Date(hoy - offset).toISOString().slice(0, 16);
    })(),
  });

  useEffect(() => {
    api.get("/productos").then((res) => {
      setProductos(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && window.$) {
      const $prod = window.$(selectProdRef.current);
      const $tipo = window.$(selectTipoRef.current);

      // Inicialización con parámetros para asegurar el buscador y look bootstrap
      $prod.select2({
        placeholder: "Seleccione un producto",
        width: "100%",
        allowClear: false,
      });
      $prod.on("change", (e) =>
        setFormData((prev) => ({ ...prev, producto_id: e.target.value }))
      );

      $tipo.select2({
        placeholder: "Seleccione el tipo",
        width: "100%",
        allowClear: false,
        minimumResultsForSearch: Infinity, // Oculta buscador en el tipo porque solo son 2 opciones
      });
      $tipo.on("change", (e) =>
        setFormData((prev) => ({ ...prev, tipo: e.target.value }))
      );

      return () => {
        $prod.select2("destroy");
        $tipo.select2("destroy");
      };
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.producto_id || !formData.tipo) {
      return Swal.fire("Atención", "Seleccione producto y tipo", "warning");
    }

    try {
      await api.post("/ajustes", formData);
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Ajuste registrado y stock actualizado",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/ajustes/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar el ajuste", "error");
    }
  };

  if (loading)
    return <div className="p-5 text-center">Cargando formulario...</div>;

  return (
    <div className="content-header">
      <style>{select2CustomStyles}</style>
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">
              <b>Registro de un Nuevo Ajuste</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">Ingrese los datos</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="font-weight-bold">
                        Producto <b>*</b>
                      </label>
                      <select
                        ref={selectProdRef}
                        className="form-control"
                        required
                      >
                        <option value=""></option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="font-weight-bold">
                        Tipo de Ajuste <b>*</b>
                      </label>
                      <select
                        ref={selectTipoRef}
                        className="form-control"
                        required
                      >
                        <option value=""></option>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="font-weight-bold">
                        Cantidad <b>*</b>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control input-uniforme"
                        value={formData.cantidad}
                        onChange={(e) =>
                          setFormData({ ...formData, cantidad: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="font-weight-bold">
                        Motivo <b>*</b>
                      </label>
                      <input
                        type="text"
                        className="form-control input-uniforme"
                        value={formData.motivo}
                        onChange={(e) =>
                          setFormData({ ...formData, motivo: e.target.value })
                        }
                        required
                        placeholder="Ej: Rotura, pérdida, etc."
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="font-weight-bold">
                        Fecha <b>*</b>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control input-uniforme"
                        value={formData.fecha}
                        onChange={(e) =>
                          setFormData({ ...formData, fecha: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-light border-top p-3">
                  <div className="d-flex justify-content-between w-100">
                    <Link
                      to="/ajustes/listado"
                      className="btn btn-secondary shadow-sm text-white"
                    >
                      <i className="fas fa-reply mr-1"></i> Volver
                    </Link>
                    <button type="submit" className="btn btn-primary shadow-sm">
                      <i className="fa-regular fa-floppy-disk mr-1"></i>{" "}
                      Registrar Ajuste
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

export default CrearAjuste;
