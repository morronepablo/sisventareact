// src/pages/roles/AsignarPermisos.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

const AsignarPermisos = () => {
  const { id: roleId } = useParams(); // ← Usa useParams para obtener el id
  const [rolName, setRolName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar datos del rol y permisos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener nombre del rol
        const roleResponse = await api.get(`/roles/${roleId}`);
        setRolName(roleResponse.data.name);

        // Obtener permisos del rol
        const permissionsResponse = await api.get(`/roles/${roleId}/permisos`);
        setPermissions(permissionsResponse.data.permissions);

        // Establecer permisos seleccionados inicialmente
        const initiallySelected = permissionsResponse.data.permissions
          .filter((perm) => perm.assigned)
          .map((perm) => perm.id);
        setSelectedPermissions(initiallySelected);

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos del rol.", "error");
        window.location.href = "/roles/listado";
      }
    };

    fetchData();
  }, [roleId]);

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await api.post(`/roles/${roleId}/permisos`, {
        permissionIds: selectedPermissions,
      });

      Swal.fire({
        title: "¡Éxito!",
        text: "Permisos asignados exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        window.location.href = "/roles/listado";
      });
    } catch (error) {
      console.error("Error al asignar permisos:", error);
      Swal.fire("Error", "No se pudieron asignar los permisos.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    window.location.href = "/roles/listado";
  };

  const handleSelectAll = () => {
    const allIds = permissions.map((p) => p.id);
    setSelectedPermissions(allIds);
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  if (loading) {
    return (
      <div className="content-header">
        <div className="container-fluid">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Asignar Permisos a Rol</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-outline card-primary">
              <div className="card-header">
                <h3 className="card-title">Rol: {rolName}</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm mr-2"
                        onClick={handleSelectAll}
                      >
                        Seleccionar Todos
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleClearAll}
                      >
                        Limpiar Todos
                      </button>
                    </div>
                    <div>
                      <small className="text-muted">
                        {selectedPermissions.length} de {permissions.length}{" "}
                        permisos seleccionados
                      </small>
                    </div>
                  </div>

                  <div className="row">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="col-md-6 col-lg-4">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`perm-${permission.id}`}
                            checked={selectedPermissions.includes(
                              permission.id
                            )}
                            onChange={() =>
                              handlePermissionChange(permission.id)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`perm-${permission.id}`}
                          >
                            {permission.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {permissions.length === 0 && (
                    <div className="alert alert-info">
                      No hay permisos disponibles.{" "}
                      <a href="/permisos/crear">Crear nuevo permiso</a>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary float-right"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Asignación"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsignarPermisos;
