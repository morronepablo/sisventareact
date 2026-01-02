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

// Proveedores
import ListadoProveedores from "./pages/proveedores/ListadoProveedores";
import CrearProveedor from "./pages/proveedores/CrearProveedor";
import VerProveedor from "./pages/proveedores/VerProveedor";
import EditarProveedor from "./pages/proveedores/EditarProveedor";
import GestionPagos from "./pages/proveedores/GestionPagos";
import MovimientosProveedor from "./pages/proveedores/MovimientosProveedor";

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

// Clientes
import ListadoClientes from "./pages/clientes/ListadoClientes";
import VerCliente from "./pages/clientes/VerCliente";
import GestionarPagosClientes from "./pages/clientes/GestionPagosClientes";
import VerComprasCliente from "./pages/clientes/VerComprasCliente";
import HistorialCliente from "./pages/clientes/HistorialCliente";
import EditarCliente from "./pages/clientes/EditarCliente";

// Ventas
import ListadoVentas from "./pages/ventas/ListadoVentas";
import CrearVenta from "./pages/ventas/CrearVenta";
import VerVenta from "./pages/ventas/VerVenta";
import InformeProductosVentas from "./pages/ventas/informes/InformeProductosVentas";
import DetalleInformeProductosVentas from "./pages/ventas/informes/DetalleInformeProductosVentas";
import InformeClientesVentas from "./pages/ventas/informes/InformeClientesVentas";
import DetalleInformeClientesVentas from "./pages/ventas/informes/DetalleInformeClientesVentas";
import InformeMetodosPagoVentas from "./pages/ventas/informes/InformeMetodosPagoVentas";
import DetalleInformeMetodosPagoVentas from "./pages/ventas/informes/DetalleInformeMetodosPagoVentas";
import InformeMovimientoStock from "./pages/ventas/informes/InformeMovimientoStock";
import DetalleInformeMovimientoStock from "./pages/ventas/informes/DetalleInformeMovimientoStock";

// Arqueos
import ListadoArqueos from "./pages/arqueos/ListadoArqueos";
import CrearArqueo from "./pages/arqueos/CrearArqueo";
import VerArqueo from "./pages/arqueos/VerArqueo";
import EditarArqueo from "./pages/arqueos/EditarArqueo";
import MovimientoArqueo from "./pages/arqueos/MovimientoArqueo";
import CierreArqueo from "./pages/arqueos/CierreArqueo";

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

        {/* Compras */}
        <Route path="/compras/listado" element={<ListadoCompras />} />
        <Route path="/compras/crear" element={<CrearCompra />} />
        <Route path="/compras/ver/:id" element={<VerCompra />} />
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

        {/* Clientes */}
        <Route path="/clientes/listado" element={<ListadoClientes />} />
        <Route path="/clientes/ver/:id" element={<VerCliente />} />
        <Route
          path="/clientes/pagos/:id"
          element={<GestionarPagosClientes />}
        />
        <Route path="/clientes/compras/:id" element={<VerComprasCliente />} />
        <Route path="/clientes/historial/:id" element={<HistorialCliente />} />
        <Route path="/clientes/editar/:id" element={<EditarCliente />} />

        {/* Ventas */}
        <Route path="/ventas/listado" element={<ListadoVentas />} />
        <Route path="/ventas/crear" element={<CrearVenta />} />
        <Route path="/ventas/ver/:id" element={<VerVenta />} />
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

        {/* Arqueos */}
        <Route path="/arqueos/listado" element={<ListadoArqueos />} />
        <Route path="/arqueos/crear" element={<CrearArqueo />} />
        <Route path="/arqueos/ver/:id" element={<VerArqueo />} />
        <Route path="/arqueos/editar/:id" element={<EditarArqueo />} />
        <Route path="/arqueos/movimiento/:id" element={<MovimientoArqueo />} />
        <Route path="/arqueos/cierre/:id" element={<CierreArqueo />} />

        {/* 404 dentro del layout si la ruta no existe */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Redirección final para cualquier ruta desconocida fuera del layout */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
