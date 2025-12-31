// src/context/NotificationContext.jsx
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

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [providersWithDebt, setProvidersWithDebt] = useState([]);
  const [arqueoAbierto, setArqueoAbierto] = useState(false);
  const [arqueoId, setArqueoId] = useState(null);

  // 1. Cargar Stock
  const refreshStock = useCallback(async () => {
    try {
      const res = await api.get("/productos/bajo-stock");
      setLowStockProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 2. Cargar Deudas
  const refreshProviderDebts = useCallback(async () => {
    try {
      const res = await api.get("/proveedores/con-deuda");
      setProvidersWithDebt(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 3. Cargar Estado de Arqueo
  const refreshArqueoStatus = useCallback(async () => {
    try {
      const res = await api.get("/arqueos/estado-abierto");
      setArqueoAbierto(!!res.data.arqueoAbierto);
      setArqueoId(res.data.id_arqueo || null);
    } catch (e) {
      setArqueoAbierto(false);
    }
  }, []);

  // Función global para refrescar todo
  const refreshAll = useCallback(() => {
    setTimeout(() => {
      refreshStock();
      refreshProviderDebts();
      refreshArqueoStatus();
    }, 500);
  }, [refreshStock, refreshProviderDebts, refreshArqueoStatus]);

  // Inicialización y escucha de eventos
  useEffect(() => {
    refreshAll();
    window.addEventListener("forceRefreshNotifications", refreshAll);
    return () =>
      window.removeEventListener("forceRefreshNotifications", refreshAll);
  }, [refreshAll]);

  return (
    <NotificationContext.Provider
      value={{
        lowStockProducts,
        providersWithDebt,
        arqueoAbierto,
        arqueoId,
        refreshStock,
        refreshProviderDebts,
        refreshArqueoStatus,
        refreshAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
