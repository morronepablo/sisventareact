// src/pages/configuracion/ConfiguracionEmpresa.jsx
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
        // Si hay logo en la DB, mostrar la URL del servidor
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

  // --- NUEVA FUNCIÓN PARA DESCARGAR BACKUP CON SEGURIDAD ---
  const handleDownloadBackup = async () => {
    try {
      Swal.fire({
        title: "Generando Copia de Seguridad",
        text: "Por favor espere, esto puede tardar unos segundos...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Pedimos el archivo al backend usando 'blob' como tipo de respuesta
      const response = await api.get("/backup/download", {
        responseType: "blob",
      });

      // Crear un objeto URL para el archivo binario recibido
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Nombre del archivo
      const fecha = new Date().toISOString().split("T")[0];
      const fileName = `backup-${empresa.nombre_empresa.replace(
        /\s+/g,
        "_"
      )}-${fecha}.sql`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Limpiar el DOM y la memoria
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.close();
      Swal.fire(
        "¡Éxito!",
        "Copia de seguridad descargada correctamente.",
        "success"
      );
    } catch (error) {
      console.error("Error al descargar backup:", error);
      Swal.close();
      Swal.fire(
        "Error",
        "No se pudo generar la copia de seguridad. Verifique que mysqldump esté instalado en el servidor.",
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmpresa({ ...empresa, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file)); // Vista previa instantánea
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!empresa.nombre_empresa.trim())
      newErrors.nombre_empresa = "El nombre es requerido";
    if (!empresa.cuit.trim()) newErrors.cuit = "El CUIT es requerido";
    if (!empresa.correo.trim()) newErrors.correo = "El correo es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      // Agregamos todos los campos de texto al FormData
      Object.keys(empresa).forEach((key) => {
        if (key !== "logo") {
          formData.append(key, empresa[key]);
        }
      });

      // Agregamos el archivo real si el usuario seleccionó uno nuevo
      const fileInput = document.getElementById("logo");
      if (fileInput.files[0]) {
        formData.append("logo", fileInput.files[0]);
      }

      await api.put(`/empresas/${empresa.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("¡Éxito!", "Empresa actualizada exitosamente.", "success").then(
        () => {
          window.location.href = "/dashboard";
        }
      );
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      Swal.fire("Error", "No se pudo actualizar la empresa.", "error");
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
            <div
              className="card card-outline card-success"
              style={{ boxShadow: "5px 5px 5px 5px #cccccc" }}
            >
              <div className="card-header">
                <h3 className="card-title float-none">Datos Registrados</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Logo - Columna 3 */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="logo">Logo</label>
                        <input
                          type="file"
                          id="logo"
                          name="logo"
                          accept=".jpg,.jpeg,.png"
                          className="form-control"
                          onChange={handleLogoChange}
                        />
                        <br />
                        <center>
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo"
                              width="80%"
                              style={{ marginTop: "10px" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "80%",
                                height: "150px",
                                border: "1px dashed #ccc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: "10px",
                              }}
                            >
                              SIN IMAGEN
                            </div>
                          )}
                        </center>
                      </div>
                    </div>

                    {/* Lado Derecho - Columna 9 */}
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
                        <div className="col-md-3">
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
                        <div className="col-md-4">
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
                      </div>

                      <div className="row">
                        <div className="col-md-9">
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
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>Código Postal</label>
                            <input
                              type="text"
                              className="form-control"
                              name="codigo_postal"
                              value={empresa.codigo_postal}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-4">
                      <button
                        type="submit"
                        className="btn btn-lg btn-success"
                        disabled={loading}
                      >
                        {loading ? "Actualizando..." : "Actualizar datos"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* SECCIÓN DE BACKUP ACTUALIZADA */}
            <div className="card card-outline card-warning mt-4 shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-bold">Base de Datos</h3>
              </div>
              <div className="card-body">
                <p>
                  Se recomienda realizar una copia de seguridad de su
                  información periódicamente para evitar pérdidas accidentales.
                </p>
                <button
                  type="button"
                  className="btn btn-warning text-white shadow-sm"
                  onClick={handleDownloadBackup} // 👈 USAMOS LA NUEVA FUNCIÓN
                >
                  <i className="fas fa-database mr-1"></i> Descargar Copia de
                  Seguridad (.SQL)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionEmpresa;
