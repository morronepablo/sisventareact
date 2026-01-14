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
    meta_gastos_fijos: 0, // 👈 NUEVO: Estado para el Punto de Equilibrio
    moneda: "",
    direccion: "",
    provincia: "",
    localidad: "",
    codigo_postal: "",
    logo: "",
  });
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await api.get("/empresas/1");
        setEmpresa(response.data);
        if (response.data.logo) {
          setLogoPreview(
            `http://localhost:3001/assets/img/${response.data.logo}`
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar empresa:", error);
        Swal.fire("Error", "No se pudieron cargar los datos.", "error");
        setLoading(false);
      }
    };
    fetchEmpresa();
  }, []);

  const handleDownloadBackup = async () => {
    try {
      Swal.fire({
        title: "Generando Copia de Seguridad",
        text: "Espere unos segundos...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await api.get("/backup/download", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const fecha = new Date().toISOString().split("T")[0];
      const fileName = `backup-${empresa.nombre_empresa.replace(
        /\s+/g,
        "_"
      )}-${fecha}.sql`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      Swal.close();
      Swal.fire("¡Éxito!", "Copia de seguridad descargada.", "success");
    } catch (error) {
      Swal.close();
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
      Swal.fire({
        title: "Reseteando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const res = await api.post("/backup/reset-system");
        if (res.data.success) {
          localStorage.removeItem("token");
          Swal.close();
          await Swal.fire(
            "¡Reseteo Exitoso!",
            "Use admin@admin.com / admin.",
            "success"
          );
          window.location.href = "/login";
        }
      } catch (error) {
        Swal.close();
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
      confirmButtonText: "Sí, restaurar",
    });
    if (confirm.isConfirmed) {
      Swal.fire({
        title: "Restaurando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const formData = new FormData();
      formData.append("backup", file);
      try {
        const res = await api.post("/backup/restore", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          localStorage.removeItem("token");
          Swal.close();
          await Swal.fire("¡Éxito!", "Base de datos restaurada.", "success");
          window.location.href = "/login";
        }
      } catch (error) {
        Swal.close();
        Swal.fire("Error", "Archivo no válido.", "error");
      }
    }
    e.target.value = "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmpresa({ ...empresa, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!empresa.nombre_empresa.trim()) newErrors.nombre_empresa = "Requerido";
    if (!empresa.cuit.trim()) newErrors.cuit = "Requerido";
    if (!empresa.correo.trim()) newErrors.correo = "Requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
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
      Swal.fire("¡Éxito!", "Empresa actualizada.", "success").then(() => {
        window.location.href = "/dashboard";
      });
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
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-success shadow">
              <div className="card-header">
                <h3 className="card-title">Datos Registrados</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group text-center">
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
                              className={`form-control ${
                                errors.nombre_empresa ? "is-invalid" : ""
                              }`}
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
                              className={`form-control ${
                                errors.cuit ? "is-invalid" : ""
                              }`}
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

                        {/* 💰 CAMPO: META DE GASTOS FIJOS (PUNTO DE EQUILIBRIO) 💰 */}
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
                              className={`form-control ${
                                errors.correo ? "is-invalid" : ""
                              }`}
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
                  <hr />
                  <button
                    type="submit"
                    className="btn btn-lg btn-success shadow"
                    disabled={loading}
                  >
                    {loading
                      ? "Actualizando..."
                      : "Actualizar datos de Empresa"}
                  </button>
                </form>
              </div>
            </div>

            <div className="card card-outline card-warning mt-4 shadow-sm">
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

            <div className="card card-outline card-info mt-4 shadow-sm">
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

            <div className="card card-outline card-danger mt-4 shadow-sm border-danger">
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
