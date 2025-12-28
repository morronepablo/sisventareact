// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    console.log("AuthProvider: savedToken =", savedToken);
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        console.log("AuthProvider: decoded =", decoded);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded); // ← Ya incluye permisos reales del backend
          setToken(savedToken);
          console.log("AuthProvider: Usuario establecido:", decoded);
        } else {
          console.log("AuthProvider: Token expirado");
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Error decodificando token:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
    console.log("AuthProvider: loading =", false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode(newToken);
    setUser(decoded); // ← Permisos reales
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const hasPermission = (permiso) => {
    return user?.permisos?.includes(permiso) || false; // ← "permisos", no "permissions"
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, hasPermission, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
