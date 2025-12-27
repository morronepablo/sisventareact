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

// 👇 Importa el nuevo componente
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

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

        {/* 404 dentro del layout */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Redirección global para rutas no protegidas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
