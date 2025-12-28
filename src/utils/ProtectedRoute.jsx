// src/components/Auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mientras carga, no renderices nada (o un spinner)
  if (loading) {
    return null; // o <div>Cargando...</div>
  }

  // Si terminó de cargar y no hay usuario → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
