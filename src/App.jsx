// // // // // // // // src/App.jsx
// // // // // // // import React from "react";
// // // // // // // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // // // // // // import { AuthProvider } from "./context/AuthContext";
// // // // // // // import { ThemeProvider } from "./context/ThemeContext";
// // // // // // // import { LayoutProvider } from "./context/LayoutContext";

// // // // // // // import MainLayout from "./layouts/MainLayout";
// // // // // // // import PublicLayout from "./layouts/PublicLayout";
// // // // // // // import ProtectedRoute from "./utils/ProtectedRoute";

// // // // // // // import Login from "./components/Auth/Login";
// // // // // // // import Home from "./pages/Home";
// // // // // // // import Dashboard from "./pages/Dashboard";
// // // // // // // import NotFoundPage from "./pages/NotFoundPage";

// // // // // // // const App = () => {
// // // // // // //   return (
// // // // // // //     <AuthProvider>
// // // // // // //       <ThemeProvider>
// // // // // // //         <LayoutProvider>
// // // // // // //           <BrowserRouter>
// // // // // // //             <Routes>
// // // // // // //               <Route element={<PublicLayout />}>
// // // // // // //                 <Route path="/" element={<Home />} />
// // // // // // //                 <Route path="/login" element={<Login />} />
// // // // // // //               </Route>

// // // // // // //               <Route element={<ProtectedRoute />}>
// // // // // // //                 <Route element={<MainLayout />}>
// // // // // // //                   <Route path="/dashboard" element={<Dashboard />} />
// // // // // // //                 </Route>
// // // // // // //               </Route>

// // // // // // //               <Route path="*" element={<NotFoundPage />} />
// // // // // // //             </Routes>
// // // // // // //           </BrowserRouter>
// // // // // // //         </LayoutProvider>
// // // // // // //       </ThemeProvider>
// // // // // // //     </AuthProvider>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default App;

// // // // // // // src/App.jsx
// // // // // // import React from "react";
// // // // // // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // // // // // import { AuthProvider } from "./context/AuthContext";
// // // // // // import { LayoutProvider } from "./context/LayoutContext";
// // // // // // import { ThemeProvider } from "./context/ThemeContext";
// // // // // // import MainLayout from "./layouts/MainLayout";
// // // // // // import Home from "./pages/Home";
// // // // // // import Dashboard from "./pages/Dashboard";

// // // // // // const App = () => {
// // // // // //   return (
// // // // // //     <BrowserRouter>
// // // // // //       <Routes>
// // // // // //         <Route path="/" element={<Home />} />
// // // // // //         <Route path="/dashboard" element={<Dashboard />} />
// // // // // //         <Route path="*" element={<Navigate to="/" replace />} />
// // // // // //       </Routes>
// // // // // //     </BrowserRouter>
// // // // // //   );
// // // // // // };

// // // // // // export default App;

// // // // // // src/App.jsx
// // // // // import React from "react";
// // // // // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // // // // import { AuthProvider } from "./context/AuthContext";
// // // // // import { LayoutProvider } from "./context/LayoutContext";
// // // // // import { ThemeProvider } from "./context/ThemeContext";
// // // // // import MainLayout from "./layouts/MainLayout";
// // // // // import Home from "./pages/Home";
// // // // // import Dashboard from "./pages/Dashboard";

// // // // // const App = () => {
// // // // //   return (
// // // // //     <BrowserRouter>
// // // // //       <AuthProvider>
// // // // //         <LayoutProvider>
// // // // //           <ThemeProvider>
// // // // //             <Routes>
// // // // //               <Route path="/" element={<Home />} />
// // // // //               <Route
// // // // //                 path="/dashboard"
// // // // //                 element={
// // // // //                   <MainLayout>
// // // // //                     <Dashboard />
// // // // //                   </MainLayout>
// // // // //                 }
// // // // //               />
// // // // //               <Route path="*" element={<Navigate to="/" replace />} />
// // // // //             </Routes>
// // // // //           </ThemeProvider>
// // // // //         </LayoutProvider>
// // // // //       </AuthProvider>
// // // // //     </BrowserRouter>
// // // // //   );
// // // // // };

// // // // // export default App;

// // // // // src/App.jsx
// // // // import React from "react";
// // // // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // // // import { AuthProvider } from "./context/AuthContext";
// // // // import MainLayout from "./layouts/MainLayout";
// // // // import Home from "./pages/Home";
// // // // import Dashboard from "./pages/Dashboard";
// // // // import Login from "./components/Auth/Login";
// // // // import RootRedirect from "./utils/RootRedirect";

// // // // const App = () => {
// // // //   return (
// // // //     <BrowserRouter>
// // // //       <Routes>
// // // //         <Route path="/" element={<RootRedirect />} />
// // // //         <Route path="/login" element={<Login />} />
// // // //         <Route
// // // //           path="/dashboard"
// // // //           element={
// // // //             <MainLayout>
// // // //               <Dashboard />
// // // //             </MainLayout>
// // // //           }
// // // //         />
// // // //         <Route path="*" element={<Navigate to="/" replace />} />
// // // //       </Routes>
// // // //     </BrowserRouter>
// // // //   );
// // // // };

// // // // export default App;

// // // // src/App.jsx
// // // import React from "react";
// // // import { Routes, Route, Navigate } from "react-router-dom";
// // // import MainLayout from "./layouts/MainLayout";
// // // import Home from "./pages/Home";
// // // import Dashboard from "./pages/Dashboard";
// // // import Login from "./components/Auth/Login"; // ← Corrige la ruta
// // // import RootRedirect from "./utils/RootRedirect";

// // // const App = () => {
// // //   return (
// // //     <Routes>
// // //       <Route path="/" element={<RootRedirect />} />
// // //       <Route path="/login" element={<Login />} />
// // //       <Route
// // //         path="/dashboard"
// // //         element={
// // //           <MainLayout>
// // //             <Dashboard />
// // //           </MainLayout>
// // //         }
// // //       />
// // //       <Route path="*" element={<Navigate to="/" replace />} />
// // //     </Routes>
// // //   );
// // // };

// // // export default App;

// // // src/App.jsx
// // import React from "react";
// // import { Routes, Route, Navigate } from "react-router-dom";
// // import MainLayout from "./layouts/MainLayout";
// // import Home from "./pages/Home";
// // import Dashboard from "./pages/Dashboard";
// // import Login from "./components/Auth/Login"; // ← minúscula "auth"
// // import RootRedirect from "./utils/RootRedirect";

// // const App = () => {
// //   return (
// //     <Routes>
// //       <Route path="/" element={<RootRedirect />} />
// //       <Route path="/login" element={<Login />} />
// //       <Route path="/dashboard" element={<MainLayout />}>
// //         <Route index element={<Dashboard />} />
// //       </Route>
// //       <Route path="*" element={<Navigate to="/" replace />} />
// //     </Routes>
// //   );
// // };

// // export default App;

// // src/App.jsx
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import MainLayout from "./layouts/MainLayout";
// import Home from "./pages/Home";
// import Dashboard from "./pages/Dashboard";
// import Login from "./components/auth/Login";
// import RootRedirect from "./utils/RootRedirect";
// import ListadoUsuarios from "./pages/usuarios/ListadoUsuarios"; // ← Importa el nuevo componente

// const App = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<RootRedirect />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/dashboard" element={<MainLayout />}>
//         <Route index element={<Dashboard />} />
//       </Route>
//       <Route path="/usuarios/listado" element={<MainLayout />}>
//         <Route index element={<ListadoUsuarios />} />
//       </Route>
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// };

// export default App;

// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Auth/Login";
import RootRedirect from "./utils/RootRedirect";
import ListadoUsuarios from "./pages/usuarios/ListadoUsuarios";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/usuarios/listado" element={<MainLayout />}>
        <Route index element={<ListadoUsuarios />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
