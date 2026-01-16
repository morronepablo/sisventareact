// src/layouts/WallStreetLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

const WallStreetLayout = () => {
  return (
    <div
      className="hold-transition dark-mode sidebar-collapse"
      style={{
        backgroundColor: "#000",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <Outlet />
    </div>
  );
};

export default WallStreetLayout;
