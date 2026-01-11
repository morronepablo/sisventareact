// src/context/NotificationContext.jsx
/* eslint-disable react-hooks/set-state-in-effect */
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
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [providersWithDebt, setProvidersWithDebt] = useState([]);
  const [clientsWithDebt, setClientsWithDebt] = useState([]);

  // ESTADOS ORIGINALES
  const [arqueoAbierto, setArqueoAbierto] = useState(null);
  const [arqueoId, setArqueoId] = useState(null); // 👈 Volvemos a arqueoId para que el Navbar funcione

  const [counts, setCounts] = useState({});

  const refreshSidebarCounts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchCounts();
      setCounts(data);
    } catch (e) {
      console.error("Error counts:", e);
    }
  }, [user]);

  const refreshStock = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/productos/bajo-stock");
      setLowStockProducts(res.data);
    } catch (e) {
      console.error("Error stock:", e);
    }
  }, [user]);

  const refreshProviderDebts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/proveedores/con-deuda");
      setProvidersWithDebt(res.data);
    } catch (e) {
      console.error("Error provider debts:", e);
    }
  }, [user]);

  const refreshClientDebts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/clientes/con-deuda");
      setClientsWithDebt(res.data);
    } catch (e) {
      console.error("Error client debts:", e);
    }
  }, [user]);

  // 🔄 RUTA RESTAURADA (estado-abierto)
  const refreshArqueoStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/arqueos/estado-abierto"); // 👈 VOLVIMOS A LA RUTA ORIGINAL
      setArqueoAbierto(!!res.data.arqueoAbierto);
      setArqueoId(res.data.id_arqueo || null);
    } catch (e) {
      console.error("Error arqueo status:", e);
      setArqueoAbierto(false);
      setArqueoId(null);
    }
  }, [user]);

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

  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setCounts({});
      setLowStockProducts([]);
      setProvidersWithDebt([]);
      setClientsWithDebt([]);
      setArqueoAbierto(null);
      setArqueoId(null);
    }
  }, [user, refreshAll]);

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
        arqueoId, // 👈 Se exporta arqueoId para Navbar y Layout
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
