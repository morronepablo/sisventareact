// src/utils/RootRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default RootRedirect;
