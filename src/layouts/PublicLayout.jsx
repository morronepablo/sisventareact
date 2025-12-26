// src/layouts/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  React.useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  return <Outlet />;
};

export default PublicLayout;
