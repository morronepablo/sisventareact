// src/pages/gastos/CrearGasto.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

// --- COPIADO EXACTAMENTE DE CREAR AJUSTE ---
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

const CrearGasto = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectCatRef = useRef(null);
  const selectMetRef = useRef(null);

  const [formData, setFormData] = useState({
    monto: "",
    descripcion: "",
    categoria_gasto_id: "",
    metodo_pago: "efectivo",
    fecha: (() => {
      const hoy = new Date();
      const offset = hoy.getTimezoneOffset() * 60000;
      return new Date(hoy - offset).toISOString().slice(0, 16);
    })(),
  });

  useEffect(() => {
    // Cargar categorías
    api.get("/gastos/categorias").then((res) => {
      setCategorias(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && window.$) {
      const $cat = window.$(selectCatRef.current);
      const $met = window.$(selectMetRef.current);

      // Inicialización igual a CrearAjuste
      $cat.select2({
        placeholder: "Seleccione una categoría",
        width: "100%",
        allowClear: false,
      });
      $cat.on("change", (e) =>
        setFormData((prev) => ({ ...prev, categoria_gasto_id: e.target.value }))
      );

      $met.select2({
        placeholder: "Seleccione el método",
        width: "100%",
        allowClear: false,
        minimumResultsForSearch: Infinity,
      });
      $met.on("change", (e) =>
        setFormData((prev) => ({ ...prev, metodo_pago: e.target.value }))
      );

      return () => {
        $cat.select2("destroy");
        $met.select2("destroy");
      };
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoria_gasto_id || !formData.metodo_pago) {
      return Swal.fire(
        "Atención",
        "Complete los campos obligatorios",
        "warning"
      );
    }

    try {
      await api.post("/gastos", formData);
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Gasto registrado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/gastos/listado");
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar el gasto", "error");
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
              <b>Registro de un Nuevo Gasto</b>
            </h1>
          </div>
        </div>
        <hr />

        <div className="row d-flex justify-content-center">
          <div className="col-md-10">
            <div className="card card-outline card-primary shadow">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  Ingrese los datos del egreso
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="font-weight-bold">
                        Categoría de Gasto <b>*</b>
                      </label>
                      <select
                        ref={selectCatRef}
                        className="form-control"
                        required
                      >
                        <option value=""></option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="font-weight-bold">
                        Método de Pago <b>*</b>
                      </label>
                      <select
                        ref={selectMetRef}
                        className="form-control"
                        required
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="mercadopago">MercadoPago</option>
                        <option value="banco">Transferencia Bancaria</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="font-weight-bold">
                        Monto <b>*</b>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control input-uniforme"
                        value={formData.monto}
                        onChange={(e) =>
                          setFormData({ ...formData, monto: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="font-weight-bold">
                        Descripción / Motivo <b>*</b>
                      </label>
                      <input
                        type="text"
                        className="form-control input-uniforme"
                        value={formData.descripcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                        required
                        placeholder="Ej: Pago de luz"
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
                      to="/gastos/listado"
                      className="btn btn-secondary shadow-sm text-white"
                    >
                      <i className="fas fa-reply mr-1"></i> Volver
                    </Link>
                    <button type="submit" className="btn btn-primary shadow-sm">
                      <i className="fa-regular fa-floppy-disk mr-1"></i>{" "}
                      Registrar Gasto
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

export default CrearGasto;
