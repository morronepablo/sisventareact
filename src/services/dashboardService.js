// src/services/dashboardService.js
import api from "./api";

export const fetchCounts = async () => {
  try {
    const [users, roles, permissions, categorias, unidades] = await Promise.all(
      [
        api.get("/users/count").catch(() => ({ data: { total: 0 } })),
        api.get("/roles/count").catch(() => ({ data: { total: 0 } })),
        api.get("/permissions/count").catch(() => ({ data: { total: 0 } })),
        api.get("/categorias/count").catch(() => ({ data: { total: 0 } })),
        api.get("/unidades/count").catch(() => ({ data: { total: 0 } })),
      ]
    );

    return {
      usuarios: users.data.total,
      roles: roles.data.total,
      permisos: permissions.data.total,
      categorias: categorias.data.total,
      unidades: unidades.data.total,
    };
  } catch (error) {
    console.error("Error al cargar conteos:", error);
    return { usuarios: 0, roles: 0, permisos: 0, categorias: 0, unidades: 0 };
  }
};
