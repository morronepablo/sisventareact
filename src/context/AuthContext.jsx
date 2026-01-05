/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

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

  // Función para cerrar sesión (definida arriba para usarse en el control de expiración)
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Función para verificar expiración en tiempo real
  const checkTokenExpiration = () => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos

        if (decoded.exp < currentTime) {
          console.warn("La sesión ha expirado.");
          logout();
          Swal.fire({
            icon: "warning",
            title: "Sesión expirada",
            text: "Su tiempo de sesión ha terminado. Por favor, ingrese nuevamente.",
            confirmButtonText: "Ok",
          }).then(() => {
            window.location.href = "/login";
          });
        }
      } catch (err) {
        logout();
      }
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          setToken(savedToken);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);

    // CONTROL DE SESIÓN ACTIVO: Revisa la expiración cada 10 segundos
    const interval = setInterval(checkTokenExpiration, 10000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode(newToken);
    setUser(decoded);
    setToken(newToken);
  };

  const hasPermission = (permiso) => {
    return user?.permisos?.includes(permiso) || false;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, hasPermission, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
