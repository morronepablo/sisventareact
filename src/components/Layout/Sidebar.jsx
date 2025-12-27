// // src/components/layout/Sidebar.jsx
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { useLayout } from "../../context/LayoutContext";
// import menuItems from "../../data/menu.json";

// const Sidebar = () => {
//   const [openMenu, setOpenMenu] = useState(null);
//   const location = useLocation();
//   const { user, hasPermission } = useAuth(); // ← user puede ser null
//   const { closeMobileSidebar } = useLayout();

//   useEffect(() => {
//     const activeParent = menuItems.find((item) =>
//       item.children?.some((child) => location.pathname.startsWith(child.path))
//     );
//     if (activeParent) setOpenMenu(activeParent.id);
//     console.log("Menú cargado:", menuItems);
//     console.log("Usuario actual:", user); // ← AÑADE ESTO
//   }, [location.pathname]);

//   const handleMenuClick = (id) => {
//     setOpenMenu(openMenu === id ? null : id);
//   };

//   const renderMenuItems = (items) => {
//     return items
//       .filter((item) => !item.permiso || hasPermission(item.permiso))
//       .map((item) => {
//         const isActiveParent = openMenu === item.id;

//         if (item.children) {
//           return (
//             <li
//               key={item.id}
//               className={`nav-item ${isActiveParent ? "menu-open" : ""}`}
//             >
//               <a
//                 href="#"
//                 className="nav-link"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleMenuClick(item.id);
//                 }}
//               >
//                 <i className={`nav-icon ${item.icon}`}></i>
//                 <p>
//                   {item.text} <i className="right fas fa-angle-left"></i>
//                 </p>
//               </a>
//               <ul className="nav nav-treeview">
//                 {renderMenuItems(item.children)}
//               </ul>
//             </li>
//           );
//         }

//         return (
//           <li key={item.id} className="nav-item">
//             <NavLink
//               to={item.path}
//               className={({ isActive }) =>
//                 `nav-link ${isActive ? "active" : ""}`
//               }
//               onClick={closeMobileSidebar}
//             >
//               <i className={`nav-icon ${item.icon}`}></i>
//               <p>{item.text}</p>
//             </NavLink>
//           </li>
//         );
//       });
//   };

//   return (
//     <aside className="main-sidebar sidebar-dark-primary elevation-4">
//       <div className="brand-link">
//         <img
//           src="/src/assets/img/logo.jpg"
//           alt="Logo"
//           className="brand-image img-circle elevation-3"
//           style={{ opacity: ".8" }}
//         />
//         <span className="brand-text font-weight-light">
//           {import.meta.env.VITE_APP_NAME || "Sistema de Ventas"}
//         </span>
//       </div>
//       <div className="sidebar">
//         {/* Solo muestra el user-panel si hay usuario */}
//         {user && (
//           <div className="user-panel mt-3 pb-3 mb-3 d-flex">
//             <div className="image">
//               <img
//                 src="/src/assets/img/usuario.png"
//                 className="img-circle elevation-2"
//                 alt="User"
//               />
//             </div>
//             <div className="info">
//               <a href="#" className="d-block">
//                 {user.name || user.nombre || "Usuario"}
//               </a>
//             </div>
//           </div>
//         )}
//         <nav className="mt-2">
//           <ul
//             className="nav nav-pills nav-sidebar flex-column"
//             data-widget="treeview"
//             role="menu"
//             data-accordion="false"
//           >
//             {renderMenuItems(menuItems)}
//           </ul>
//         </nav>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import menuItems from "../../data/menu.json";
import { fetchCounts } from "../../services/dashboardService"; // ← nuevo

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [counts, setCounts] = useState({}); // ← almacena totales
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const { closeMobileSidebar } = useLayout();

  // Cargar conteos al inicio
  useEffect(() => {
    const loadCounts = async () => {
      if (user) {
        const data = await fetchCounts();
        setCounts(data);
      }
    };
    loadCounts();
  }, [user]);

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path))
    );
    if (activeParent) setOpenMenu(activeParent.id);
  }, [location.pathname]);

  const handleMenuClick = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  // Función para obtener el badge con color personalizado
  const getTotalBadge = (item) => {
    if (!item.children || !item.permiso) return null;

    let total = 0;
    let badgeClass = "badge-info"; // default

    if (item.permiso === "ver_usuarios") {
      total = counts.usuarios || 0;
      badgeClass = "badge-primary"; // azul oscuro
    } else if (item.permiso === "ver_roles") {
      total = counts.roles || 0;
      badgeClass = "badge-success"; // verde
    } else if (item.permiso === "ver_permisos") {
      total = counts.permisos || 0;
      badgeClass = "badge-warning"; // amarillo
    } else if (item.permiso === "ver_categorias") {
      total = counts.categorias || 0;
      badgeClass = "badge-danger"; // rojo
    } else if (item.permiso === "ver_unidades") {
      total = counts.unidades || 0;
      badgeClass = "badge-info"; // azul claro
    } else {
      return null;
    }

    return total > 0 ? (
      <span className={`badge ${badgeClass} right`}>{total}</span>
    ) : null;
  };

  const renderMenuItems = (items) => {
    return items
      .filter((item) => !item.permiso || hasPermission(item.permiso))
      .map((item) => {
        const isActiveParent = openMenu === item.id;

        if (item.children) {
          return (
            <li
              key={item.id}
              className={`nav-item ${isActiveParent ? "menu-open" : ""}`}
            >
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick(item.id);
                }}
              >
                <i className={`nav-icon ${item.icon}`}></i>
                <p>
                  {item.text} <i className="right fas fa-angle-left"></i>
                  {getTotalBadge(item)}
                </p>
              </a>
              <ul className="nav nav-treeview">
                {renderMenuItems(item.children)}
              </ul>
            </li>
          );
        }

        return (
          <li key={item.id} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMobileSidebar}
            >
              <i className={`nav-icon ${item.icon}`}></i>
              <p>{item.text}</p>
            </NavLink>
          </li>
        );
      });
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <NavLink to="/dashboard" className="brand-link">
        <img
          src="/src/assets/img/logo.jpg"
          alt="Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: ".8" }}
        />
        <span className="brand-text font-weight-light">
          {import.meta.env.VITE_APP_NAME || "Sistema de Ventas"}
        </span>
      </NavLink>
      <div className="sidebar">
        {user && (
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="image">
              <img
                src="/src/assets/img/usuario.png"
                className="img-circle elevation-2"
                alt="User"
              />
            </div>
            <div className="info">
              <NavLink
                to="/dashboard"
                className="d-block"
                onClick={closeMobileSidebar}
              >
                {user.name || user.nombre || "Usuario"}
              </NavLink>
            </div>
          </div>
        )}
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            {renderMenuItems(menuItems)}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
