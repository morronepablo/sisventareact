// src/layouts/MainLayout.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import Footer from "../components/Layout/Footer";

const MainLayout = () => {
  const { isDesktopCollapsed, isMobileOpen, closeMobileSidebar } = useLayout();
  const location = useLocation();

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.add("sidebar-mini", "layout-fixed");
    if (isDesktopCollapsed) document.body.classList.add("sidebar-collapse");
    else document.body.classList.remove("sidebar-collapse");

    if (isMobileOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => {
      document.body.classList.remove(
        "sidebar-mini",
        "layout-fixed",
        "sidebar-collapse",
        "sidebar-open"
      );
    };
  }, [isDesktopCollapsed, isMobileOpen]);

  return (
    <>
      <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>
      <div className="wrapper">
        <Navbar />
        <Sidebar />
        <div className="content-wrapper">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
