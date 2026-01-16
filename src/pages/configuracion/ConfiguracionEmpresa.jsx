// src/pages/configuracion/ConfiguracionEmpresa.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

const ConfiguracionEmpresa = () => {
  const [empresa, setEmpresa] = useState({
    id: 1,
    pais: "",
    nombre_empresa: "",
    tipo_empresa: "",
    cuit: "",
    telefono: "",
    correo: "",
    cantidad_impuesto: 0,
    nombre_impuesto: "",
    meta_gastos_fijos: 0,
    moneda: "",
    direccion: "",
    provincia: "",
    localidad: "",
    codigo_postal: "",
    logo: "",
  });

  // 🚀 NUEVO ESTADO: Comisiones
  const [comisiones, setComisiones] = useState([]);

  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      // Cargamos ambos datos en paralelo
      const [resEmpresa, resComisiones] = await Promise.all([
        api.get("/empresas/1"),
        api.get("/empresas/1/comisiones"), // Aseguramos que esta ruta exista en el back
      ]);

      setEmpresa(resEmpresa.data);
      setComisiones(resComisiones.data);

      if (resEmpresa.data.logo) {
        setLogoPreview(
          `http://localhost:3001/assets/img/${resEmpresa.data.logo}`
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE COMISIONES ---
  const handleComisionChange = (id, value) => {
    setComisiones(
      comisiones.map((c) =>
        c.id === id ? { ...c, comision_porcentaje: value } : c
      )
    );
  };

  const handleSubmitComisiones = async () => {
    try {
      await api.put("/empresas/1/comisiones", { comisiones });
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Comisiones actualizadas.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "No se pudieron guardar las comisiones.", "error");
    }
  };

  // --- TUS FUNCIONES ORIGINALES (RESTAURADAS) ---
  const handleDownloadBackup = async () => {
    try {
      Swal.fire({
        title: "Generando Copia...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await api.get("/backup/download", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const fileName = `backup-${empresa.nombre_empresa.replace(
        /\s+/g,
        "_"
      )}.sql`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      Swal.close();
      Swal.fire("¡Éxito!", "Copia descargada.", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo generar la copia.", "error");
    }
  };

  const handleResetSystem = async () => {
    const firstConfirm = await Swal.fire({
      title: "¿ESTÁ COMPLETAMENTE SEGURO?",
      text: "Se borrarán Ventas, Compras, Productos y Movimientos. ¡Irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar todo",
    });
    if (!firstConfirm.isConfirmed) return;
    const { value: word } = await Swal.fire({
      title: "Confirmación Final",
      text: 'Escriba "ELIMINAR" para confirmar:',
      input: "text",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (word === "ELIMINAR") {
      try {
        const res = await api.post("/backup/reset-system");
        if (res.data.success) {
          localStorage.removeItem("token");
          await Swal.fire(
            "¡Reseteo Exitoso!",
            "El sistema ha vuelto a cero.",
            "success"
          );
          window.location.href = "/login";
        }
      } catch (error) {
        Swal.fire("Error", "Fallo en el servidor.", "error");
      }
    }
  };

  const handleRestoreDatabase = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const confirm = await Swal.fire({
      title: "¿Restaurar?",
      text: "Se reemplazará toda la DB.",
      icon: "warning",
      showCancelButton: true,
    });
    if (confirm.isConfirmed) {
      const formData = new FormData();
      formData.append("backup", file);
      try {
        const res = await api.post("/backup/restore", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          localStorage.removeItem("token");
          await Swal.fire("¡Éxito!", "Base de datos restaurada.", "success");
          window.location.href = "/login";
        }
      } catch (error) {
        Swal.fire("Error", "Archivo no válido.", "error");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmpresa({ ...empresa, [name]: value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(empresa).forEach((key) => {
        if (key !== "logo") formData.append(key, empresa[key]);
      });
      const fileInput = document.getElementById("logo");
      if (fileInput.files[0]) formData.append("logo", fileInput.files[0]);

      await api.put(`/empresas/${empresa.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("¡Éxito!", "Empresa actualizada.", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Configuraciones / Editar</h1>
          </div>
        </div>
        <hr />
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            {/* --- CARD 1: DATOS REGISTRADOS --- */}
            <div className="card card-outline card-success shadow mb-4">
              <div className="card-header">
                <h3 className="card-title text-bold">Datos Registrados</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3 text-center">
                      <label>Logo</label>
                      <input
                        type="file"
                        id="logo"
                        accept=".jpg,.jpeg,.png"
                        className="form-control"
                        onChange={handleLogoChange}
                      />
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo"
                          width="80%"
                          className="mt-3 border shadow-sm"
                        />
                      ) : (
                        <div className="mt-3 border p-5 bg-light text-muted">
                          SIN IMAGEN
                        </div>
                      )}
                    </div>
                    <div className="col-md-9">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>País</label>
                            <input
                              type="text"
                              className="form-control"
                              name="pais"
                              value={empresa.pais}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Provincia</label>
                            <input
                              type="text"
                              className="form-control"
                              name="provincia"
                              value={empresa.provincia}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Localidad/Ciudad</label>
                            <input
                              type="text"
                              className="form-control"
                              name="localidad"
                              value={empresa.localidad}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Nombre de la Empresa</label>
                            <input
                              type="text"
                              className="form-control"
                              name="nombre_empresa"
                              value={empresa.nombre_empresa}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>Tipo de la Empresa</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tipo_empresa"
                              value={empresa.tipo_empresa}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>C.U.I.T.</label>
                            <input
                              type="text"
                              className="form-control"
                              name="cuit"
                              value={empresa.cuit}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>Moneda</label>
                            <input
                              type="text"
                              className="form-control"
                              name="moneda"
                              value={empresa.moneda}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>Nombre del impuesto</label>
                            <input
                              type="text"
                              className="form-control"
                              name="nombre_impuesto"
                              value={empresa.nombre_impuesto}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>% Impuesto</label>
                            <input
                              type="number"
                              className="form-control"
                              name="cantidad_impuesto"
                              value={empresa.cantidad_impuesto}
                              onChange={handleInputChange}
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="text-success">
                              <i className="fas fa-flag-checkered mr-1"></i>{" "}
                              Gastos Fijos (Meta PE)
                            </label>
                            <input
                              type="number"
                              className="form-control border-success"
                              name="meta_gastos_fijos"
                              value={empresa.meta_gastos_fijos}
                              onChange={handleInputChange}
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Teléfono</label>
                            <input
                              type="text"
                              className="form-control"
                              name="telefono"
                              value={empresa.telefono}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Correo</label>
                            <input
                              type="email"
                              className="form-control"
                              name="correo"
                              value={empresa.correo}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Dirección</label>
                            <input
                              type="text"
                              className="form-control"
                              name="direccion"
                              value={empresa.direccion}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success shadow mt-3">
                    Actualizar datos de Empresa
                  </button>
                </form>
              </div>
            </div>

            {/* 🚀 CARD 2: COMISIONES POR MÉTODOS DE PAGO (INTEGRADA) 🚀 */}
            <div className="card card-outline card-primary shadow mb-4">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  <i className="fas fa-percent mr-2"></i>Comisiones por Métodos
                  de Pago
                </h3>
              </div>
              <div className="card-body">
                <p className="text-muted small">
                  Establecé los costos reales de pasarelas para calcular tu{" "}
                  <b>Rentabilidad Neta</b>.
                </p>
                <div className="row">
                  {comisiones.map((c) => (
                    <div className="col-md-3" key={c.id}>
                      <div className="form-group">
                        <label className="text-capitalize">{c.metodo}</label>
                        <div className="input-group">
                          <input
                            type="number"
                            step="0.01"
                            className="form-control font-weight-bold"
                            value={c.comision_porcentaje}
                            onChange={(e) =>
                              handleComisionChange(c.id, e.target.value)
                            }
                          />
                          <div className="input-group-append">
                            <span className="input-group-text">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary shadow"
                  onClick={handleSubmitComisiones}
                >
                  <i className="fas fa-save mr-1"></i> Guardar Comisiones
                </button>
              </div>
            </div>

            {/* --- CARD 3: BACKUPS --- */}
            <div className="card card-outline card-warning mb-4 shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">
                  Base de Datos y Backups
                </h3>
              </div>
              <div className="card-body">
                <button
                  type="button"
                  className="btn btn-warning text-white shadow-sm"
                  onClick={handleDownloadBackup}
                >
                  <i className="fas fa-database mr-1"></i> Descargar Copia
                  (.SQL)
                </button>
              </div>
            </div>

            {/* --- CARD 4: RESTAURAR --- */}
            <div className="card card-outline card-info mb-4 shadow-sm">
              <div className="card-header bg-info text-white">
                <h3 className="card-title text-bold">Restaurar Copia</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <div className="custom-file">
                    <input
                      type="file"
                      className="custom-file-input"
                      id="restoreBackup"
                      accept=".sql"
                      onChange={handleRestoreDatabase}
                    />
                    <label
                      className="custom-file-label"
                      htmlFor="restoreBackup"
                    >
                      Seleccionar archivo .SQL
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* --- CARD 5: ZONA DE PELIGRO --- */}
            <div className="card card-outline card-danger shadow-sm border-danger">
              <div className="card-header bg-danger text-white">
                <h3 className="card-title text-bold">Zona de Peligro</h3>
              </div>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-9 text-danger">
                    <b>Reseteo de Fábrica:</b> Esta acción vaciará todas las
                    tablas de negocio.
                  </div>
                  <div className="col-md-3 text-right">
                    <button
                      type="button"
                      className="btn btn-danger shadow-sm"
                      onClick={handleResetSystem}
                    >
                      <i className="fas fa-trash-alt mr-1"></i> Resetear Sistema
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionEmpresa;
