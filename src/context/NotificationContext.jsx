// src/context/NotificationContext.jsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import api from "../services/api";
import { fetchCounts } from "../services/dashboardService";
import { useAuth } from "./AuthContext"; // 👈 1. Importamos useAuth

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth(); // 👈 2. Consumimos el estado del usuario
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [providersWithDebt, setProvidersWithDebt] = useState([]);
  const [clientsWithDebt, setClientsWithDebt] = useState([]);
  const [arqueoAbierto, setArqueoAbierto] = useState(null);
  const [arqueoId, setArqueoId] = useState(null);
  const [counts, setCounts] = useState({});

  // 1. Refrescar totales del Sidebar/Dashboard
  const refreshSidebarCounts = useCallback(async () => {
    if (!user) return; // Seguridad: no pedir si no hay usuario
    try {
      const data = await fetchCounts();
      setCounts(data);
    } catch (e) {
      console.error("Error refreshSidebarCounts:", e);
    }
  }, [user]);

  // 2. Refrescar Stock bajo
  const refreshStock = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/productos/bajo-stock");
      setLowStockProducts(res.data);
    } catch (e) {
      console.error("Error refreshStock:", e);
    }
  }, [user]);

  // 3. Refrescar Deudas de Proveedores
  const refreshProviderDebts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/proveedores/con-deuda");
      setProvidersWithDebt(res.data);
    } catch (e) {
      console.error("Error refreshProviderDebts:", e);
    }
  }, [user]);

  // 4. Refrescar Deuda de Clientes
  const refreshClientDebts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/clientes/con-deuda");
      setClientsWithDebt(res.data);
    } catch (e) {
      console.error("Error refreshClientDebts:", e);
    }
  }, [user]);

  // 5. Refrescar Estado de Arqueo
  const refreshArqueoStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/arqueos/estado-abierto");
      setArqueoAbierto(!!res.data.arqueoAbierto);
      setArqueoId(res.data.id_arqueo || null);
    } catch (e) {
      setArqueoAbierto(false);
      setArqueoId(null);
    }
  }, [user]);

  // Función maestra que refresca TODO el sistema
  const refreshAll = useCallback(() => {
    if (!user) return;
    refreshStock();
    refreshProviderDebts();
    refreshClientDebts();
    refreshArqueoStatus();
    refreshSidebarCounts();
  }, [
    user,
    refreshStock,
    refreshProviderDebts,
    refreshClientDebts,
    refreshArqueoStatus,
    refreshSidebarCounts,
  ]);

  // 👈 3. EFECTO CLAVE: Refrescar cuando el usuario cambie (Login/Logout)
  useEffect(() => {
    if (user) {
      refreshAll(); // Carga datos apenas el usuario entra
    } else {
      // Limpiar estados al salir
      setCounts({});
      setLowStockProducts([]);
      setProvidersWithDebt([]);
      setClientsWithDebt([]);
      setArqueoAbierto(null);
      setArqueoId(null);
    }
  }, [user, refreshAll]);

  // Escuchar eventos manuales
  useEffect(() => {
    window.addEventListener("forceRefreshNotifications", refreshAll);
    return () =>
      window.removeEventListener("forceRefreshNotifications", refreshAll);
  }, [refreshAll]);

  return (
    <NotificationContext.Provider
      value={{
        counts,
        lowStockProducts,
        providersWithDebt,
        clientsWithDebt,
        arqueoAbierto,
        arqueoId,
        refreshAll,
        refreshSidebarCounts,
        refreshArqueoStatus,
        refreshStock,
        refreshProviderDebts,
        refreshClientDebts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
