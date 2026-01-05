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
      clientes,
      clieSummary,
      ventas,
      ventSummary,
      arqueos,
      arqueoSummary,
      combos,
      empresas,
      devoluciones,
      ventasMetrics,
      comprasMetrics,
      ajustes,
      movimientos,
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
        .catch(() => ({ data: { totalDeuda: 0 } })),
      api.get("/compras/count").catch(() => ({ data: { total: 0 } })),
      api.get("/compras/summary").catch(() => ({ data: { totalAnio: 0 } })),
      api.get("/clientes/count").catch(() => ({ data: { total: 0 } })),
      api.get("/clientes/summary").catch(() => ({ data: { totalDeuda: 0 } })),
      api.get("/ventas/count").catch(() => ({ data: { total: 0 } })),
      api.get("/ventas/summary").catch(() => ({ data: { totalAnio: 0 } })),
      api.get("/arqueos/count").catch(() => ({ data: { total: 0 } })),
      api
        .get("/arqueos/summary")
        .catch(() => ({ data: { total: 0, totalAnio: 0 } })),
      api.get("/combos/count").catch(() => ({ data: { total: 0 } })),
      api.get("/empresas/count").catch(() => ({ data: { total: 0 } })),
      api.get("/devoluciones/count").catch(() => ({ data: { total: 0 } })),
      api.get("/ventas/dashboard-metrics").catch(() => ({ data: {} })),
      api.get("/compras/dashboard-metrics").catch(() => ({ data: {} })),
      api.get("/ajustes/count").catch(() => ({ data: { total: 0 } })),
      api.get("/movimientos/count").catch(() => ({ data: { total: 0 } })),
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
      clientes: clientes.data.total,
      clientesDeuda: clieSummary.data.totalDeuda,
      ventas: ventas.data.total,
      ventasAnio: ventSummary.data.totalAnio,
      arqueos: arqueos.data.total,
      arqueosAnio: arqueoSummary.data.totalAnio,
      combos: combos.data.total,
      empresas: empresas.data.total,
      devoluciones: devoluciones.data.total,
      // Métricas financieras
      ventas_dia: ventasMetrics.data.ventas_dia || 0,
      ventas_mes: ventasMetrics.data.ventas_mes || 0,
      ventas_anio: ventasMetrics.data.ventas_anio || 0,
      ganancia_dia: ventasMetrics.data.ganancia_dia || 0,
      ganancia_mes: ventasMetrics.data.ganancia_mes || 0,
      ganancia_anio: ventasMetrics.data.ganancia_anio || 0,
      topProductos: ventasMetrics.data.topProductos || [],
      devoluciones_dia: ventasMetrics.data.devoluciones_dia || 0,
      devoluciones_mes: ventasMetrics.data.devoluciones_mes || 0,
      devoluciones_anio: ventasMetrics.data.devoluciones_anio || 0,
      compras_dia: comprasMetrics.data.compras_dia || 0,
      compras_mes: comprasMetrics.data.compras_mes || 0,
      compras_anio: comprasMetrics.data.compras_anio || 0,
      total_inventario: comprasMetrics.data.total_inventario || 0,
      ajustes: ajustes.data.total,
      movimientos: movimientos.data.total,
    };
  } catch (error) {
    console.error("Error al cargar conteos:", error);
    return {};
  }
};

export const fetchChartData = async (month) => {
  try {
    const res = await api.get(`/dashboard/charts?month=${month}`);
    return res.data;
  } catch (error) {
    console.error("Error al cargar gráficos:", error);
    return null;
  }
};
