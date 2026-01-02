// src/context/NotificationContext.jsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import api from "../services/api";
import { fetchCounts } from "../services/dashboardService";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [providersWithDebt, setProvidersWithDebt] = useState([]);
  const [clientsWithDebt, setClientsWithDebt] = useState([]);
  const [arqueoAbierto, setArqueoAbierto] = useState(null);
  const [arqueoId, setArqueoId] = useState(null);
  const [counts, setCounts] = useState({});

  // 1. Refrescar totales del Sidebar/Dashboard
  const refreshSidebarCounts = useCallback(async () => {
    try {
      const data = await fetchCounts();
      setCounts(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 2. Refrescar Stock bajo
  const refreshStock = useCallback(async () => {
    try {
      const res = await api.get("/productos/bajo-stock");
      setLowStockProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 3. Refrescar Deudas de Proveedores
  const refreshProviderDebts = useCallback(async () => {
    try {
      const res = await api.get("/proveedores/con-deuda");
      setProvidersWithDebt(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 4. Refrescar Deuda de Clientes
  const refreshClientDebts = useCallback(async () => {
    try {
      const res = await api.get("/clientes/con-deuda");
      setClientsWithDebt(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 5. Refrescar Estado de Arqueo
  const refreshArqueoStatus = useCallback(async () => {
    try {
      const res = await api.get("/arqueos/estado-abierto");
      setArqueoAbierto(!!res.data.arqueoAbierto);
      setArqueoId(res.data.id_arqueo || null);
    } catch (e) {
      setArqueoAbierto(false);
    }
  }, []);

  // Función maestra que refresca TODO el sistema
  const refreshAll = useCallback(() => {
    refreshStock();
    refreshProviderDebts();
    refreshClientDebts();
    refreshArqueoStatus();
    refreshSidebarCounts();
  }, [
    refreshStock,
    refreshProviderDebts,
    refreshClientDebts,
    refreshArqueoStatus,
    refreshSidebarCounts,
  ]);

  // Escuchar eventos globales para refrescar
  useEffect(() => {
    refreshAll();
    window.addEventListener("forceRefreshNotifications", refreshAll);
    return () =>
      window.removeEventListener("forceRefreshNotifications", refreshAll);
  }, [refreshAll]);

  return (
    <NotificationContext.Provider
      value={{
        // Estados
        counts,
        lowStockProducts,
        providersWithDebt,
        clientsWithDebt,
        arqueoAbierto,
        arqueoId,
        // Funciones (TODAS exportadas para evitar TypeErrors)
        refreshAll,
        refreshSidebarCounts,
        refreshArqueoStatus,
        refreshStock,
        refreshProviderDebts, // 👈 Esta arregla el error de proveedores
        refreshClientDebts, // 👈 Esta para el dropdown de clientes
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
