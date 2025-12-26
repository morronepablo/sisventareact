// src/context/LayoutContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const toggleDesktopSidebar = () => setDesktopCollapsed(!isDesktopCollapsed);
  const toggleMobileSidebar = () => setMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setMobileOpen(false);

  return (
    <LayoutContext.Provider
      value={{
        isDesktopCollapsed,
        isMobileOpen,
        toggleDesktopSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
