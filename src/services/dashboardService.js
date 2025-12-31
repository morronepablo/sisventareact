// src/services/dashboardService.js
import api from "./api";

export const fetchCounts = async () => {
  try {
    const [
      users,
      roles,
      permissions,
      categorias,
      unidades,
      productos,
      proveedores,
      provSummary,
      compras,
      compSummary,
      arqueos,
    ] = await Promise.all([
      api.get("/users/count").catch(() => ({ data: { total: 0 } })),
      api.get("/roles/count").catch(() => ({ data: { total: 0 } })),
      api.get("/permissions/count").catch(() => ({ data: { total: 0 } })),
      api.get("/categorias/count").catch(() => ({ data: { total: 0 } })),
      api.get("/unidades/count").catch(() => ({ data: { total: 0 } })),
      api.get("/productos/count").catch(() => ({ data: { total: 0 } })),
      api.get("/proveedores/count").catch(() => ({ data: { total: 0 } })),
      api
        .get("/proveedores/summary")
        .catch(() => ({ data: { total: 0, totalDeuda: 0 } })),
      api.get("/compras/count").catch(() => ({ data: { total: 0 } })),
      api
        .get("/compras/summary")
        .catch(() => ({ data: { total: 0, totalAnio: 0 } })),
      api.get("/arqueos/count").catch(() => ({ data: { total: 0 } })),
    ]);

    return {
      usuarios: users.data.total,
      roles: roles.data.total,
      permisos: permissions.data.total,
      categorias: categorias.data.total,
      unidades: unidades.data.total,
      productos: productos.data.total,
      proveedores: proveedores.data.total,
      proveedoresDeuda: provSummary.data.totalDeuda,
      compras: compras.data.total,
      comprasAnio: compSummary.data.totalAnio,
      arqueos: arqueos.data.total,
    };
  } catch (error) {
    console.error("Error al cargar conteos:", error);
    return {
      usuarios: 0,
      roles: 0,
      permisos: 0,
      categorias: 0,
      unidades: 0,
      productos: 0,
      proveedores: 0,
      proveedoresDeuda: 0,
      compras: 0,
      comprasAnio: 0,
      arqueos: 0,
    };
  }
};
