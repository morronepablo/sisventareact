// src/utils/RootRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RootRedirect = () => {
  const { token, loading } = useAuth();
  console.log("RootRedirect: token=", token, "loading=", loading); // ← AÑADE ESTO

  if (loading) return <div>Cargando...</div>;
  return token ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default RootRedirect;
