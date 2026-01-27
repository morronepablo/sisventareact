// src/pages/configuracion/ConfiguracionEmpresa.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
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
  const [resetting, setResetting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

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
          `http://localhost:3001/assets/img/${resEmpresa.data.logo}`,
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
        c.id === id ? { ...c, comision_porcentaje: value } : c,
      ),
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
        title: "Generando Copia de Seguridad...",
        text: "Esto puede demorar unos segundos dependiendo del tamaño de la base.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.get("/backup/download", {
        responseType: "blob",
      });

      // Lógica de fecha y hora local (Argentina)
      const ahora = new Date();
      const fecha = ahora.toISOString().split("T")[0]; // YYYY-MM-DD
      const hora = ahora.getHours().toString().padStart(2, "0");
      const mins = ahora.getMinutes().toString().padStart(2, "0");
      const timestamp = `${fecha}_${hora}-${mins}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Nombre del archivo: backup-Empresa_Nombre-2026-01-18_15-30.sql
      const nombreLimpio = empresa.nombre_empresa.replace(/\s+/g, "_");
      const fileName = `backup-${nombreLimpio}-${timestamp}.sql`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.close();
      Swal.fire("¡Éxito!", `Copia descargada: ${fileName}`, "success");
    } catch (error) {
      Swal.fire("Error", "Fallo al generar el backup en el servidor.", "error");
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
        setResetting(true); // ⬅️ Activar estado de carga

        // Mostrar SweetAlert con spinner
        Swal.fire({
          title: "Reseteando Sistema...",
          html: `
            <div class="text-center">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="sr-only">Cargando...</span>
              </div>
              <p>Esto puede tomar unos segundos. No cierre esta ventana.</p>
              <div class="progress" style="height: 5px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" 
                     style="width: 100%">
                </div>
              </div>
            </div>
          `,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await api.post("/backup/reset-system");

        if (res.data.success) {
          localStorage.removeItem("token");
          setResetting(false); // ⬅️ Desactivar estado de carga

          await Swal.fire({
            icon: "success",
            title: "¡Reseteo Exitoso!",
            text: "El sistema ha vuelto a cero.",
            timer: 3000,
            showConfirmButton: false,
          });

          window.location.href = "/login";
        }
      } catch (error) {
        setResetting(false); // ⬅️ Desactivar estado de carga en caso de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Fallo en el servidor. Intente nuevamente.",
        });
      }
    }
  };

  // const handleRestoreDatabase = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const confirm = await Swal.fire({
  //     title: "¿Restaurar?",
  //     text: "Se reemplazará toda la DB.",
  //     icon: "warning",
  //     showCancelButton: true,
  //   });
  //   if (confirm.isConfirmed) {
  //     const formData = new FormData();
  //     formData.append("backup", file);
  //     try {
  //       const res = await api.post("/backup/restore", formData, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //       if (res.data.success) {
  //         localStorage.removeItem("token");
  //         await Swal.fire("¡Éxito!", "Base de datos restaurada.", "success");
  //         window.location.href = "/login";
  //       }
  //     } catch (error) {
  //       Swal.fire("Error", "Archivo no válido.", "error");
  //     }
  //   }
  // };

  const handleRestoreDatabase = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar extensión .sql
    if (!file.name.endsWith(".sql")) {
      await Swal.fire({
        icon: "error",
        title: "Archivo inválido",
        text: "Por favor, seleccione un archivo con extensión .sql",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Restaurar Base de Datos?",
      html: `
        <div class="text-left">
          <p><b>Archivo:</b> ${file.name}</p>
          <p><b>Tamaño:</b> ${(file.size / 1024).toFixed(2)} KB</p>
          <p class="text-danger mt-2">
            <i class="fas fa-exclamation-triangle"></i> 
            <b>ADVERTENCIA:</b> Se reemplazará TODA la base de datos actual.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      setRestoring(true); // ⬅️ Activar estado de carga

      // Mostrar SweetAlert con spinner y detalles
      Swal.fire({
        title: "Restaurando Base de Datos...",
        html: `
          <div class="text-center">
            <div class="spinner-border text-info mb-3" role="status" style="width: 3rem; height: 3rem;">
              <span class="sr-only">Cargando...</span>
            </div>
            <h5 class="text-info">Proceso en curso</h5>
            <p class="mb-1"><b>Archivo:</b> ${file.name}</p>
            <p class="mb-3"><b>Estado:</b> Importando datos...</p>
            <div class="progress mb-2" style="height: 8px;">
              <div class="progress-bar progress-bar-striped progress-bar-animated bg-info" 
                   role="progressbar" 
                   style="width: 100%">
              </div>
            </div>
            <p class="text-muted small mt-3">
              <i class="fas fa-info-circle"></i> 
              Esto puede tomar varios minutos dependiendo del tamaño del backup.
            </p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        backdrop: "rgba(0,0,0,0.7)",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formData = new FormData();
      formData.append("backup", file);

      try {
        const res = await api.post("/backup/restore", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 300000, // 5 minutos timeout
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              // Puedes actualizar el progreso aquí si quieres
            }
          },
        });

        if (res.data.success) {
          setRestoring(false); // ⬅️ Desactivar estado de carga

          // Cerrar el spinner de carga
          Swal.close();

          // Mostrar mensaje de éxito
          await Swal.fire({
            icon: "success",
            title: "¡Restauración Exitosa!",
            html: `
              <div class="text-center">
                <div class="mb-3">
                  <i class="fas fa-check-circle fa-4x text-success"></i>
                </div>
                <p>La base de datos ha sido restaurada correctamente.</p>
                <p class="small text-muted">Serás redirigido al login...</p>
              </div>
            `,
            timer: 3000,
            showConfirmButton: false,
            willClose: () => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            },
          });
        }
      } catch (error) {
        setRestoring(false); // ⬅️ Desactivar estado de carga en caso de error

        // Cerrar el spinner de carga
        Swal.close();

        // Limpiar el input file
        if (fileInputRef.current) fileInputRef.current.value = "";

        let errorMessage = "Error al restaurar la base de datos";

        if (error.response) {
          // El servidor respondió con un código de error
          if (error.response.status === 413) {
            errorMessage = "El archivo es demasiado grande";
          } else if (error.response.status === 400) {
            errorMessage =
              error.response.data.message || "Archivo SQL inválido";
          } else if (error.response.status === 504) {
            errorMessage =
              "Tiempo de espera agotado. El archivo puede ser muy grande.";
          }
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          errorMessage = "No se pudo conectar con el servidor";
        } else if (error.code === "ECONNABORTED") {
          errorMessage =
            "Tiempo de espera agotado. Intente con un archivo más pequeño.";
        }

        await Swal.fire({
          icon: "error",
          title: "Error en la Restauración",
          html: `
            <div class="text-left">
              <p><b>${errorMessage}</b></p>
              ${
                error.response?.data?.error
                  ? `<p class="small text-muted mt-2">Detalle técnico: ${error.response.data.error}</p>`
                  : ""
              }
              <p class="mt-3">
                <i class="fas fa-lightbulb"></i> 
                <b>Sugerencia:</b> Verifique que el archivo .sql sea válido y no esté corrupto.
              </p>
            </div>
          `,
          confirmButtonColor: "#d33",
          confirmButtonText: "Entendido",
        });
      }
    } else {
      // Si cancela, limpiar el input file
      if (fileInputRef.current) fileInputRef.current.value = "";
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
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="card-title text-bold">Restaurar Copia</h3>
                  {restoring && (
                    <span className="badge badge-light">
                      <span
                        className="spinner-border spinner-border-sm mr-1"
                        role="status"
                      ></span>
                      Restaurando...
                    </span>
                  )}
                </div>
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
                      disabled={restoring} // ⬅️ Deshabilitar durante la restauración
                      ref={fileInputRef} // ⬅️ Referencia al input
                    />
                    <label
                      className="custom-file-label"
                      htmlFor="restoreBackup"
                    >
                      {restoring ? (
                        <span className="text-muted">
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                          Restauración en progreso...
                        </span>
                      ) : (
                        "Seleccionar archivo .SQL"
                      )}
                    </label>
                  </div>
                  {restoring && (
                    <div className="mt-3 p-3 bg-light border rounded">
                      <div className="d-flex align-items-center">
                        <div
                          className="spinner-border text-info mr-3"
                          role="status"
                        >
                          <span className="sr-only">Cargando...</span>
                        </div>
                        <div>
                          <p className="mb-1 font-weight-bold text-info">
                            <i className="fas fa-database mr-2"></i>
                            Restaurando base de datos...
                          </p>
                          <p className="small text-muted mb-0">
                            Por favor, no cierre esta ventana ni recargue la
                            página.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="alert alert-info mt-3 small">
                  <i className="fas fa-info-circle mr-2"></i>
                  <b>Nota:</b> El proceso de restauración puede tardar varios
                  minutos dependiendo del tamaño del archivo. Asegúrese de tener
                  una conexión estable a internet.
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
                      disabled={resetting} // ⬅️ Deshabilitar botón durante el reset
                    >
                      {resetting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm mr-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Reseteando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash-alt mr-1"></i> Resetear
                          Sistema
                        </>
                      )}
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
