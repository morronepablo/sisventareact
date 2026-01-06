// src/context/AuthContext.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import api from "../services/api";

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

  const clearSessionLocal = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const logout = async (motivo = "Manual") => {
    try {
      await api.post("/auth/logout-log", { motivo });
    } catch (err) {
      console.log("No se pudo registrar log en servidor");
    } finally {
      clearSessionLocal();
      window.location.href = "/login";
    }
  };

  // --- FUNCIÓN DE EXPIRACIÓN ASÍNCRONA CORREGIDA ---
  const checkTokenExpiration = async () => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return;

    try {
      const decoded = jwtDecode(savedToken);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - currentTime;

      if (timeLeft > 0 && timeLeft <= 60) {
        console.log(`Sesión activa. Vence en: ${timeLeft} segundos.`);
      } else {
        console.log(`Sesión activa. Vence en: ${timeLeft}`);
      }

      if (timeLeft <= 0) {
        console.warn("¡SESIÓN EXPIRADA! Avisando al servidor...");

        // 1. Intentar avisar al servidor a través de la ruta pública de expiración
        try {
          await api.post("/auth/log-expiration", {
            userId: decoded.id,
            empresaId: decoded.empresa_id,
          });
        } catch (e) {
          console.error(
            "No se pudo registrar el log de expiración en el servidor."
          );
        }

        // 2. Limpiar localmente
        clearSessionLocal();

        // 3. Mostrar alerta
        Swal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "Su tiempo de acceso ha terminado por seguridad. Ingrese nuevamente.",
          confirmButtonText: "Entendido",
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = "/login";
        });
      }
    } catch (err) {
      clearSessionLocal();
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        if (decoded.exp > Math.floor(Date.now() / 1000)) {
          setUser(decoded);
          setToken(savedToken);
        } else {
          clearSessionLocal();
        }
      } catch (err) {
        clearSessionLocal();
      }
    }
    setLoading(false);

    const interval = setInterval(checkTokenExpiration, 5000);
    return () => clearInterval(interval);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode(newToken);
    setUser(decoded);
    setToken(newToken);
    console.log(
      "Login exitoso. El token vence en:",
      new Date(decoded.exp * 1000).toLocaleString()
    );
  };

  const hasPermission = (permiso) => user?.permisos?.includes(permiso) || false;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, hasPermission, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
