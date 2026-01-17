// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Auth/Login";
import RootRedirect from "./utils/RootRedirect";
import NotFound from "./pages/NotFound";

// Usuarios
import ListadoUsuarios from "./pages/usuarios/ListadoUsuarios";
import CrearUsuario from "./pages/usuarios/CrearUsuario";
import VerUsuario from "./pages/usuarios/VerUsuario";
import EditarUsuario from "./pages/usuarios/EditarUsuario";

// Roles
import ListadoRoles from "./pages/roles/ListadoRoles";
import CrearRol from "./pages/roles/CrearRol";
import VerRol from "./pages/roles/VerRol";
import EditarRol from "./pages/roles/EditarRol";
import AsignarPermisos from "./pages/roles/AsignarPermisos";

// Permisos
import ListadoPermisos from "./pages/permisos/ListadoPermisos";
import CrearPermiso from "./pages/permisos/CrearPermiso";
import VerPermiso from "./pages/permisos/VerPermiso";
import EditarPermiso from "./pages/permisos/EditarPermiso";

// Configuración
import ConfiguracionEmpresa from "./pages/configuracion/ConfiguracionEmpresa";
import ConfiguracionSesion from "./pages/configuracion/ConfiguracionSesion";

// Categorías
import ListadoCategorias from "./pages/categorias/ListadoCategorias";
import CrearCategoria from "./pages/categorias/CrearCategoria";
import VerCategoria from "./pages/categorias/VerCategoria";
import EditarCategoria from "./pages/categorias/EditarCategoria";

// Unidades
import ListadoUnidades from "./pages/unidades/ListadoUnidades";
import CrearUnidad from "./pages/unidades/CrearUnidad";
import VerUnidad from "./pages/unidades/VerUnidad";
import EditarUnidad from "./pages/unidades/EditarUnidad";

// Productos
import ListadoProductos from "./pages/productos/ListadoProductos";
import CrearProducto from "./pages/productos/CrearProducto";
import VerProducto from "./pages/productos/VerProducto";
import EditarProducto from "./pages/productos/EditarProducto";
import ActualizacionMasiva from "./pages/productos/ActualizacionMasiva";
import MonitorReposicion from "./pages/productos/MonitorReposicion";
import Promociones from "./pages/productos/Promociones";
import AsistenteCompra from "./pages/productos/AsistenteCompra";
import GuardianMargenes from "./pages/productos/GuardianMargenes";
import LiquidadorInteligente from "./pages/productos/LiquidadorInteligente";
import SimuladorImpacto from "./pages/productos/SimuladorImpacto";
import AuditorFugas from "./pages/productos/AuditorFugas";
import RadarPareto from "./pages/productos/RadarPareto";
import TermometroVentas from "./pages/productos/TermometroVentas";
import OraculoStock from "./pages/productos/OraculoStock";
import CementerioStock from "./pages/productos/CementerioStock";
import LucroCesante from "./pages/productos/LucroCesante";
import EquityShield from "./pages/productos/EquityShield";
import OptimizadorMix from "./pages/productos/OptimizadorMix";

// Proveedores
import ListadoProveedores from "./pages/proveedores/ListadoProveedores";
import CrearProveedor from "./pages/proveedores/CrearProveedor";
import VerProveedor from "./pages/proveedores/VerProveedor";
import EditarProveedor from "./pages/proveedores/EditarProveedor";
import GestionPagos from "./pages/proveedores/GestionPagos";
import MovimientosProveedor from "./pages/proveedores/MovimientosProveedor";
import InformeCuentasPorPagar from "./pages/proveedores/informes/InformeCuentasPorPagar";
import RankingProveedoresBI from "./pages/proveedores/RankingProveedoresBI";
import RadarInflacion from "./pages/proveedores/RadarInflacion";
import SemaforoCumplimiento from "./pages/proveedores/SemaforoCumplimiento";
import MatrizDependencia from "./pages/proveedores/MatrizDependencia";

// Compras
import ListadoCompras from "./pages/compras/ListadoCompras";
import CrearCompra from "./pages/compras/CrearCompra";
import VerCompra from "./pages/compras/VerCompra";
import InformeProductos from "./pages/compras/informes/InformeProductos";
import DetalleInformeProductos from "./pages/compras/informes/DetalleInformeProductos";
import InformeProveedores from "./pages/compras/informes/InformeProveedores";
import DetalleInformeProveedores from "./pages/compras/informes/DetalleInformeProveedores";
import InformeNoPagadas from "./pages/compras/informes/InformeNoPagadas";
import DetalleInformeNoPagadas from "./pages/compras/informes/DetalleInformeNoPagadas";
import AuditoriaTraicion from "./pages/compras/AuditoriaTraicion";
import ListadoOrdenes from "./pages/compras/ListadoOrdenes";
import CrearOrdenCompra from "./pages/compras/CrearOrdenCompra";
import VerOrdenCompra from "./pages/compras/VerOrdenCompra";
import RecibirOrdenCompra from "./pages/compras/RecibirOrdenCompra";
import AsistenteCompra2 from "./pages/compras/AsistenteCompra";

// Clientes
import ListadoClientes from "./pages/clientes/ListadoClientes";
import CrearCliente from "./pages/clientes/CrearCliente";
import VerCliente from "./pages/clientes/VerCliente";
import GestionarPagosClientes from "./pages/clientes/GestionPagosClientes";
import VerComprasCliente from "./pages/clientes/VerComprasCliente";
import HistorialCliente from "./pages/clientes/HistorialCliente";
import EditarCliente from "./pages/clientes/EditarCliente";
import InformeCobranzas from "./pages/clientes/informes/InformeCobranzas";
import RecapturaClientes from "./pages/clientes/RecapturaClientes";
import FidelizacionClientes from "./pages/clientes/FidelizacionClientes";
import ScoringConfianza from "./pages/clientes/ScoringConfianza";
import RadarCelebraciones from "./pages/clientes/RadarCelebraciones";

// Ventas
import ListadoVentas from "./pages/ventas/ListadoVentas";
import CrearVenta from "./pages/ventas/CrearVenta";
import VerVenta from "./pages/ventas/VerVenta";
import AuditorIntegridad from "./pages/ventas/AuditorIntegridad";
import InformeProductosVentas from "./pages/ventas/informes/InformeProductosVentas";
import DetalleInformeProductosVentas from "./pages/ventas/informes/DetalleInformeProductosVentas";
import InformeClientesVentas from "./pages/ventas/informes/InformeClientesVentas";
import DetalleInformeClientesVentas from "./pages/ventas/informes/DetalleInformeClientesVentas";
import InformeMetodosPagoVentas from "./pages/ventas/informes/InformeMetodosPagoVentas";
import DetalleInformeMetodosPagoVentas from "./pages/ventas/informes/DetalleInformeMetodosPagoVentas";
import InformeMovimientoStock from "./pages/ventas/informes/InformeMovimientoStock";
import DetalleInformeMovimientoStock from "./pages/ventas/informes/DetalleInformeMovimientoStock";
import Rentabilidad from "./pages/ventas/informes/Rentabilidad";
import EstadoResultados from "./pages/ventas/informes/EstadoResultados";
import MapaTesoro from "./pages/ventas/informes/MapaTesoro";
import AnalistaPasarelas from "./pages/ventas/informes/AnalistaPasarelas";
import PodioVendedores from "./pages/ventas/PodioVendedores";
import VelocidadCaja from "./pages/ventas/VelocidadCaja";

// Arqueos
import ListadoArqueos from "./pages/arqueos/ListadoArqueos";
import CrearArqueo from "./pages/arqueos/CrearArqueo";
import VerArqueo from "./pages/arqueos/VerArqueo";
import EditarArqueo from "./pages/arqueos/EditarArqueo";
import MovimientoArqueo from "./pages/arqueos/MovimientoArqueo";
import CierreArqueo from "./pages/arqueos/CierreArqueo";
import MonitorRealTime from "./pages/arqueos/MonitorRealTime";

// Combos
import ListadoCombos from "./pages/combos/ListadoCombos";
import CrearCombo from "./pages/combos/CrearCombo";
import VerCombo from "./pages/combos/VerCombo";
import EditarCombo from "./pages/combos/EditarCombo";
import SugeridorCombos from "./pages/combos/SugeridorCombos";

// Devoluciones
import ListadoDevoluciones from "./pages/devoluciones/ListadoDevoluciones";
import CrearDevolucion from "./pages/devoluciones/CrearDevolucion";
import VerDevolucion from "./pages/devoluciones/VerDevolucion";

// Ajustes
import ListadoAjustes from "./pages/ajustes/ListadoAjustes";
import CrearAjuste from "./pages/ajustes/CrearAjuste";
import VerAjuste from "./pages/ajustes/VerAjuste";

// Movimientos
import ListadoProductosMovimientos from "./pages/movimientos/ListadoProductosMovimientos";
import VerMovimientosProducto from "./pages/movimientos/VerMovimientosProducto";

// Gastos
import ListadoGastos from "./pages/gastos/ListadoGastos";
import CrearGasto from "./pages/gastos/CrearGasto";
import VerGasto from "./pages/gastos/VerGasto";
import CirujanoCostos from "./pages/gastos/informes/CirujanoCostos";
import ListadoCategoriasGastos from "./pages/gastos/ListadoCategoriasGastos";
import PuntoEquilibrio from "./pages/gastos/informes/PuntoEquilibrio";
import RadarHormiga from "./pages/gastos/informes/RadarHormiga";
import SaludFinanciera from "./pages/gastos/informes/SaludFinanciera";
import OraculoFinanciero from "./pages/gastos/informes/OraculoFinanciero";

// Logs
import ListadoLogs from "./pages/logs/ListadoLogs";

// Whatsapp
import WhatsAppConfig from "./pages/configuracion/WhatsAppConfig";

import WallStreetLayout from "./layouts/WallStreetLayout"; // 👈 Agregar import
import DashboardWallStreet from "./pages/DashboardWallStreet"; // 👈 Agregar import

// 👇 IMPORTACIÓN DE COMPONENTES DE RUTA
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";

const App = () => {
  return (
    <Routes>
      {/* Redirección inicial (/) */}
      <Route path="/" element={<RootRedirect />} />

      {/* 
          Ruta de Login PROTEGIDA para que no la vean logueados.
          Si el usuario ya está logueado, PublicRoute lo enviará al dashboard.
      */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Todas las rutas protegidas dentro de MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Usuarios */}
        <Route path="/usuarios/listado" element={<ListadoUsuarios />} />
        <Route path="/usuarios/crear" element={<CrearUsuario />} />
        <Route path="/usuarios/ver/:id" element={<VerUsuario />} />
        <Route path="/usuarios/editar/:id" element={<EditarUsuario />} />

        {/* Roles */}
        <Route path="/roles/listado" element={<ListadoRoles />} />
        <Route path="/roles/crear" element={<CrearRol />} />
        <Route path="/roles/ver/:id" element={<VerRol />} />
        <Route path="/roles/editar/:id" element={<EditarRol />} />
        <Route path="/roles/:id/permisos" element={<AsignarPermisos />} />

        {/* Permisos */}
        <Route path="/permisos/listado" element={<ListadoPermisos />} />
        <Route path="/permisos/crear" element={<CrearPermiso />} />
        <Route path="/permisos/ver/:id" element={<VerPermiso />} />
        <Route path="/permisos/editar/:id" element={<EditarPermiso />} />

        {/* Configuración */}
        <Route
          path="/configuracion/empresa"
          element={<ConfiguracionEmpresa />}
        />
        <Route path="/configuracion/sesion" element={<ConfiguracionSesion />} />

        {/* Categorías */}
        <Route path="/categorias/listado" element={<ListadoCategorias />} />
        <Route path="/categorias/crear" element={<CrearCategoria />} />
        <Route path="/categorias/ver/:id" element={<VerCategoria />} />
        <Route path="/categorias/editar/:id" element={<EditarCategoria />} />

        {/* Unidades */}
        <Route path="/unidades/listado" element={<ListadoUnidades />} />
        <Route path="/unidades/crear" element={<CrearUnidad />} />
        <Route path="/unidades/ver/:id" element={<VerUnidad />} />
        <Route path="/unidades/editar/:id" element={<EditarUnidad />} />

        {/* Productos */}
        <Route path="/productos/listado" element={<ListadoProductos />} />
        <Route path="/productos/crear" element={<CrearProducto />} />
        <Route path="/productos/ver/:id" element={<VerProducto />} />
        <Route path="/productos/editar/:id" element={<EditarProducto />} />
        <Route
          path="/productos/actualizacion-masiva"
          element={<ActualizacionMasiva />}
        />
        <Route path="/productos/reposicion" element={<MonitorReposicion />} />
        <Route path="/productos/promociones" element={<Promociones />} />
        <Route
          path="/productos/asistente-compra"
          element={<AsistenteCompra />}
        />
        <Route
          path="/productos/guardian-margenes"
          element={<GuardianMargenes />}
        />
        <Route
          path="/productos/liquidador"
          element={<LiquidadorInteligente />}
        />
        <Route path="/productos/simulador" element={<SimuladorImpacto />} />
        <Route path="/productos/auditor-fugas" element={<AuditorFugas />} />
        <Route path="/productos/radar-pareto" element={<RadarPareto />} />
        <Route path="/productos/termometro" element={<TermometroVentas />} />
        <Route path="/productos/oraculo" element={<OraculoStock />} />
        <Route path="/productos/cementerio" element={<CementerioStock />} />
        <Route path="/productos/lucro-cesante" element={<LucroCesante />} />
        <Route path="/productos/equity-shield" element={<EquityShield />} />
        <Route
          path="/productos/optimizador-mix"
          element={
            <ProtectedRoute>
              <OptimizadorMix />
            </ProtectedRoute>
          }
        />

        {/* Proveedores */}
        <Route path="/proveedores/listado" element={<ListadoProveedores />} />
        <Route path="/proveedores/crear" element={<CrearProveedor />} />
        <Route path="/proveedores/ver/:id" element={<VerProveedor />} />
        <Route path="/proveedores/editar/:id" element={<EditarProveedor />} />
        <Route path="/proveedores/pagos/:id" element={<GestionPagos />} />
        <Route
          path="/proveedores/movimientos/:id"
          element={<MovimientosProveedor />}
        />
        <Route
          path="/proveedores/informes/cuentas-por-pagar"
          element={<InformeCuentasPorPagar />}
        />
        <Route
          path="/proveedores/ranking-bi"
          element={<RankingProveedoresBI />}
        />
        <Route
          path="/proveedores/radar-inflacion"
          element={<RadarInflacion />}
        />
        <Route
          path="/proveedores/cumplimiento"
          element={<SemaforoCumplimiento />}
        />
        <Route
          path="/proveedores/dependencia"
          element={<MatrizDependencia />}
        />

        {/* Compras */}
        <Route path="/compras/ordenes" element={<ListadoOrdenes />} />
        <Route path="/compras/listado" element={<ListadoCompras />} />
        <Route path="/compras/crear" element={<CrearCompra />} />
        <Route path="/compras/ver/:id" element={<VerCompra />} />
        <Route
          path="/compras/auditoria-traicion"
          element={<AuditoriaTraicion />}
        />
        <Route
          path="/compras/informes/productos"
          element={<InformeProductos />}
        />
        <Route
          path="/compras/informes/productos/detalle"
          element={<DetalleInformeProductos />}
        />
        <Route
          path="/compras/informes/proveedores"
          element={<InformeProveedores />}
        />
        <Route
          path="/compras/informes/proveedores/detalle"
          element={<DetalleInformeProveedores />}
        />
        <Route
          path="/compras/informes/no-pagadas"
          element={<InformeNoPagadas />}
        />
        <Route
          path="/compras/informes/no-pagadas/detalle"
          element={<DetalleInformeNoPagadas />}
        />
        <Route path="/compras/ordenes/crear" element={<CrearOrdenCompra />} />
        <Route path="/compras/ordenes/ver/:id" element={<VerOrdenCompra />} />
        <Route
          path="/compras/ordenes/recibir/:id"
          element={<RecibirOrdenCompra />}
        />
        <Route path="/compras/asistente" element={<AsistenteCompra2 />} />

        {/* Clientes */}
        <Route path="/clientes/listado" element={<ListadoClientes />} />
        <Route path="/clientes/crear" element={<CrearCliente />} />
        <Route path="/clientes/ver/:id" element={<VerCliente />} />
        <Route
          path="/clientes/pagos/:id"
          element={<GestionarPagosClientes />}
        />
        <Route path="/clientes/compras/:id" element={<VerComprasCliente />} />
        <Route path="/clientes/historial/:id" element={<HistorialCliente />} />
        <Route path="/clientes/editar/:id" element={<EditarCliente />} />
        <Route
          path="/clientes/informes/cobranzas"
          element={<InformeCobranzas />}
        />
        <Route path="/clientes/recaptura" element={<RecapturaClientes />} />
        <Route
          path="/clientes/fidelizacion"
          element={<FidelizacionClientes />}
        />
        <Route path="/clientes/scoring" element={<ScoringConfianza />} />
        <Route
          path="/clientes/celebraciones"
          element={<RadarCelebraciones />}
        />

        {/* Ventas */}
        <Route path="/ventas/listado" element={<ListadoVentas />} />
        <Route path="/ventas/crear" element={<CrearVenta />} />
        <Route path="/ventas/ver/:id" element={<VerVenta />} />
        <Route path="/ventas/auditoria" element={<AuditorIntegridad />} />
        <Route path="/ventas/podio" element={<PodioVendedores />} />
        <Route path="/ventas/velocidad" element={<VelocidadCaja />} />
        <Route
          path="/ventas/informes/productos"
          element={<InformeProductosVentas />}
        />
        <Route
          path="/ventas/informes/productos/detalle"
          element={<DetalleInformeProductosVentas />}
        />
        <Route
          path="/ventas/informes/clientes"
          element={<InformeClientesVentas />}
        />
        <Route
          path="/ventas/informes/clientes/detalle"
          element={<DetalleInformeClientesVentas />}
        />
        <Route
          path="/ventas/informes/metodos-pago"
          element={<InformeMetodosPagoVentas />}
        />
        <Route
          path="/ventas/informes/metodos-pago/detalle"
          element={<DetalleInformeMetodosPagoVentas />}
        />
        <Route
          path="/ventas/informes/movimiento-stock"
          element={<InformeMovimientoStock />}
        />
        <Route
          path="/ventas/informes/movimiento-stock/detalle"
          element={<DetalleInformeMovimientoStock />}
        />
        <Route
          path="/ventas/informes/rentabilidad"
          element={<Rentabilidad />}
        />
        <Route
          path="/ventas/informes/estado-resultados"
          element={<EstadoResultados />}
        />
        <Route path="/ventas/informes/mapa-tesoro" element={<MapaTesoro />} />
        <Route
          path="/ventas/informes/analista-pasarelas"
          element={<AnalistaPasarelas />}
        />

        {/* Arqueos */}
        <Route path="/arqueos/listado" element={<ListadoArqueos />} />
        <Route path="/arqueos/crear" element={<CrearArqueo />} />
        <Route path="/arqueos/ver/:id" element={<VerArqueo />} />
        <Route path="/arqueos/editar/:id" element={<EditarArqueo />} />
        <Route path="/arqueos/movimiento/:id" element={<MovimientoArqueo />} />
        <Route path="/arqueos/cierre/:id" element={<CierreArqueo />} />
        <Route path="/arqueos/monitor" element={<MonitorRealTime />} />

        {/* Combos */}
        <Route path="/combos/listado" element={<ListadoCombos />} />
        <Route path="/combos/crear" element={<CrearCombo />} />
        <Route path="/combos/ver/:id" element={<VerCombo />} />
        <Route path="/combos/editar/:id" element={<EditarCombo />} />
        <Route path="/combos/alquimista" element={<SugeridorCombos />} />

        {/* Devoluciones */}
        <Route path="/devoluciones/listado" element={<ListadoDevoluciones />} />
        <Route path="/devoluciones/crear" element={<CrearDevolucion />} />
        <Route path="/devoluciones/ver/:id" element={<VerDevolucion />} />

        {/* Ajustes */}
        <Route path="/ajustes/listado" element={<ListadoAjustes />} />
        <Route path="/ajustes/crear" element={<CrearAjuste />} />
        <Route path="/ajustes/ver/:id" element={<VerAjuste />} />

        {/* Movimientos */}
        <Route
          path="/movimientos/listado"
          element={<ListadoProductosMovimientos />}
        />
        <Route
          path="/movimientos/ver/:id"
          element={<VerMovimientosProducto />}
        />

        {/* Gastos */}
        <Route path="/gastos/listado" element={<ListadoGastos />} />
        <Route path="/gastos/crear" element={<CrearGasto />} />
        <Route path="/gastos/ver/:id" element={<VerGasto />} />
        <Route path="/gastos/cirujano" element={<CirujanoCostos />} />
        <Route
          path="/gastos/categorias"
          element={<ListadoCategoriasGastos />}
        />
        <Route path="/gastos/punto-equilibrio" element={<PuntoEquilibrio />} />
        <Route path="/gastos/radar-hormiga" element={<RadarHormiga />} />
        <Route path="/gastos/salud-financiera" element={<SaludFinanciera />} />
        <Route
          path="/gastos/oraculo-financiero"
          element={<OraculoFinanciero />}
        />

        {/* Logs */}
        <Route path="/logs/listado" element={<ListadoLogs />} />

        {/* Whatsapp */}
        <Route path="/configuracion/whatsapp" element={<WhatsAppConfig />} />

        {/* 404 dentro del layout si la ruta no existe */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 🚀 BLOQUE NUEVO: MODO WALL STREET (SIN MENÚ) 🚀 */}
      <Route
        element={
          <ProtectedRoute>
            <WallStreetLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard/wall-street"
          element={<DashboardWallStreet />}
        />
      </Route>

      {/* Redirección final para cualquier ruta desconocida fuera del layout */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
