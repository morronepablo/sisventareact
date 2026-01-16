// src/services/dashboardService.js
import api from "./api";

export const fetchCounts = async () => {
  try {
    const [
      users, // 0
      roles, // 1
      permissions, // 2
      categorias, // 3
      unidades, // 4
      productos, // 5
      bajoStock, // 6 👈 Pedido de bajo stock en posición 6
      proveedores, // 7
      provSummary, // 8
      compras, // 9
      compSummary, // 10
      clientes, // 11
      clieSummary, // 12
      ventas, // 13
      ventSummary, // 14
      arqueos, // 15
      arqueoSummary, // 16
      combos, // 17
      empresas, // 18
      devoluciones, // 19
      ventasMetrics, // 20 👈 AQUÍ VIENE EL TOP PRODUCTOS
      comprasMetrics, // 21
      ajustes, // 22
      movimientos, // 23
      gastos, // 24
      logs, // 25
    ] = await Promise.all([
      api.get("/users/count").catch(() => ({ data: { total: 0 } })), // 0
      api.get("/roles/count").catch(() => ({ data: { total: 0 } })), // 1
      api.get("/permissions/count").catch(() => ({ data: { total: 0 } })), // 2
      api.get("/categorias/count").catch(() => ({ data: { total: 0 } })), // 3
      api.get("/unidades/count").catch(() => ({ data: { total: 0 } })), // 4
      api.get("/productos/count").catch(() => ({ data: { total: 0 } })), // 5
      api
        .get("/productos/bajo-stock-count")
        .catch(() => ({ data: { total: 0 } })), // 6 👈
      api.get("/proveedores/count").catch(() => ({ data: { total: 0 } })), // 7
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
      api.get("/ventas/dashboard-metrics").catch(() => ({ data: {} })), // 20
      api.get("/compras/dashboard-metrics").catch(() => ({ data: {} })), // 21
      api.get("/ajustes/count").catch(() => ({ data: { total: 0 } })), // 22
      api.get("/movimientos/count").catch(() => ({ data: { total: 0 } })), // 23
      api.get("/gastos/count").catch(() => ({ data: { total: 0 } })), // 24
      api.get("/logs/count").catch(() => ({ data: { total: 0 } })), // 25
    ]);

    return {
      usuarios: users.data.total,
      roles: roles.data.total,
      permisos: permissions.data.total,
      categorias: categorias.data.total,
      unidades: unidades.data.total,
      productos: productos.data.total,
      productosBajoStock: bajoStock.data.total, // 👈 Ahora recibe el valor del pedido 6
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
      // 🟢 TOP PRODUCTOS RESTAURADO 🟢
      topProductos: ventasMetrics.data.topProductos || [],
      ventas_dia: ventasMetrics.data.ventas_dia || 0,
      ventas_mes: ventasMetrics.data.ventas_mes || 0,
      ventas_anio: ventasMetrics.data.ventas_anio || 0,
      ganancia_dia: ventasMetrics.data.ganancia_dia || 0,
      ganancia_mes: ventasMetrics.data.ganancia_mes || 0,
      ganancia_anio: ventasMetrics.data.ganancia_anio || 0,
      devoluciones_dia: ventasMetrics.data.devoluciones_dia || 0,
      devoluciones_mes: ventasMetrics.data.devoluciones_mes || 0,
      devoluciones_anio: ventasMetrics.data.devoluciones_anio || 0,
      compras_dia: comprasMetrics.data.compras_dia || 0,
      compras_mes: comprasMetrics.data.compras_mes || 0,
      compras_anio: comprasMetrics.data.compras_anio || 0,
      total_inventario: comprasMetrics.data.total_inventario || 0,
      ajustes: ajustes.data.total,
      movimientos: movimientos.data.total,
      gastos: gastos.data.total,
      logs: logs.data.total,
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
    console.error(error);
    return null;
  }
};

export const fetchPredictionBI = async () => {
  try {
    const res = await api.get("/dashboard/prediction"); // Asegúrate de crear esta ruta en tu router de backend
    return res.data;
  } catch (error) {
    console.error("Error al cargar predicción BI:", error);
    return null;
  }
};
