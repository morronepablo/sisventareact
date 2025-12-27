// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
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

const App = () => {
  return (
    <Routes>
      {/* Rutas fuera del layout (Sin Sidebar/Navbar) */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* TODAS las rutas protegidas dentro de MainLayout */}
      <Route element={<MainLayout />}>
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

        {/* 404 dentro del layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
