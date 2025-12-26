// src/context/ThemeContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const body = document.body;
    const navbar = document.querySelector(".main-header");

    if (theme === "dark") {
      body.classList.add("dark-mode");
      if (navbar) {
        navbar.classList.remove("navbar-white", "navbar-light");
        navbar.classList.add("navbar-dark");
      }
    } else {
      body.classList.remove("dark-mode");
      if (navbar) {
        navbar.classList.remove("navbar-dark");
        navbar.classList.add("navbar-white", "navbar-light");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
