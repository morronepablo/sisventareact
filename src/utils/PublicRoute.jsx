// src/utils/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mientras carga el estado del AuthContext, no renderizamos nada para evitar parpadeos
  if (loading) return null;

  // Si el usuario ya está logueado, lo mandamos al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está logueado, le permitimos ver el componente (Login)
  return children;
};

export default PublicRoute;
