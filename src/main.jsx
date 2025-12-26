// // // // // // // // src/main.jsx
// // // // // // // import React from "react";
// // // // // // // import ReactDOM from "react-dom/client";
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

// // // // // // // import LoadingSpinner from "./components/LoadingSpinner";
// // // // // // // import RootRedirect from "./utils/RootRedirect";

// // // // // // // ReactDOM.createRoot(document.getElementById("root")).render(
// // // // // // //   <React.StrictMode>
// // // // // // //     <BrowserRouter>
// // // // // // //       <AuthProvider>
// // // // // // //         <ThemeProvider>
// // // // // // //           <LayoutProvider>
// // // // // // //             <Routes>
// // // // // // //               <Route element={<PublicLayout />}>
// // // // // // //                 <Route path="/" element={<RootRedirect />} />
// // // // // // //                 <Route path="/login" element={<Login />} />
// // // // // // //               </Route>

// // // // // // //               <Route element={<ProtectedRoute />}>
// // // // // // //                 <Route element={<MainLayout />}>
// // // // // // //                   <Route path="/dashboard" element={<Dashboard />} />
// // // // // // //                 </Route>
// // // // // // //               </Route>

// // // // // // //               <Route path="*" element={<NotFoundPage />} />
// // // // // // //             </Routes>
// // // // // // //           </LayoutProvider>
// // // // // // //         </ThemeProvider>
// // // // // // //       </AuthProvider>
// // // // // // //     </BrowserRouter>
// // // // // // //   </React.StrictMode>
// // // // // // // );

// // // // // // // // src/main.jsx
// // // // // // // import React from "react";
// // // // // // // import ReactDOM from "react-dom/client";

// // // // // // // const App = () => {
// // // // // // //   return (
// // // // // // //     <div
// // // // // // //       style={{
// // // // // // //         padding: "40px",
// // // // // // //         background: "#000",
// // // // // // //         color: "#fff",
// // // // // // //         minHeight: "100vh",
// // // // // // //         fontSize: "24px",
// // // // // // //       }}
// // // // // // //     >
// // // // // // //       ✅ ¡React funciona!
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // ReactDOM.createRoot(document.getElementById("root")).render(
// // // // // // //   <React.StrictMode>
// // // // // // //     <App />
// // // // // // //   </React.StrictMode>
// // // // // // // );

// // // // // // // // src/main.jsx
// // // // // // // import React from "react";
// // // // // // // import ReactDOM from "react-dom/client";

// // // // // // // const App = () => {
// // // // // // //   return (
// // // // // // //     <div
// // // // // // //       style={{
// // // // // // //         padding: "40px",
// // // // // // //         background: "#fff",
// // // // // // //         minHeight: "100vh",
// // // // // // //         fontSize: "24px",
// // // // // // //       }}
// // // // // // //     >
// // // // // // //       👋 ¡Hola desde App!
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // ReactDOM.createRoot(document.getElementById("root")).render(
// // // // // // //   <React.StrictMode>
// // // // // // //     <App />
// // // // // // //   </React.StrictMode>
// // // // // // // );

// // // // // // // src/main.jsx
// // // // // // import React from "react";
// // // // // // import ReactDOM from "react-dom/client";
// // // // // // import { AuthProvider } from "./context/AuthContext";

// // // // // // const App = () => {
// // // // // //   return (
// // // // // //     <div
// // // // // //       style={{
// // // // // //         padding: "40px",
// // // // // //         background: "#fff",
// // // // // //         minHeight: "100vh",
// // // // // //         fontSize: "24px",
// // // // // //       }}
// // // // // //     >
// // // // // //       👋 ¡Hola desde App!
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // ReactDOM.createRoot(document.getElementById("root")).render(
// // // // // //   <React.StrictMode>
// // // // // //     <AuthProvider>
// // // // // //       <App />
// // // // // //     </AuthProvider>
// // // // // //   </React.StrictMode>
// // // // // // );

// // // // // // src/main.jsx
// // // // // import React from "react";
// // // // // import ReactDOM from "react-dom/client";
// // // // // import { AuthProvider } from "./context/AuthContext";
// // // // // import { LayoutProvider } from "./context/LayoutContext";
// // // // // import { ThemeProvider } from "./context/ThemeContext";

// // // // // const App = () => {
// // // // //   return (
// // // // //     <div
// // // // //       style={{
// // // // //         padding: "40px",
// // // // //         background: "#fff",
// // // // //         minHeight: "100vh",
// // // // //         fontSize: "24px",
// // // // //       }}
// // // // //     >
// // // // //       👋 ¡Hola desde App!
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // ReactDOM.createRoot(document.getElementById("root")).render(
// // // // //   <React.StrictMode>
// // // // //     <AuthProvider>
// // // // //       <LayoutProvider>
// // // // //         <ThemeProvider>
// // // // //           <App />
// // // // //         </ThemeProvider>
// // // // //       </LayoutProvider>
// // // // //     </AuthProvider>
// // // // //   </React.StrictMode>
// // // // // );

// // // // // src/main.jsx
// // // // import React from "react";
// // // // import ReactDOM from "react-dom/client";
// // // // import { AuthProvider } from "./context/AuthContext";
// // // // import { LayoutProvider } from "./context/LayoutContext";
// // // // import { ThemeProvider } from "./context/ThemeContext";
// // // // import MainLayout from "./layouts/MainLayout";

// // // // const App = () => {
// // // //   return (
// // // //     <div
// // // //       style={{
// // // //         padding: "40px",
// // // //         background: "#fff",
// // // //         minHeight: "100vh",
// // // //         fontSize: "24px",
// // // //       }}
// // // //     >
// // // //       👋 ¡Hola desde App!
// // // //     </div>
// // // //   );
// // // // };

// // // // ReactDOM.createRoot(document.getElementById("root")).render(
// // // //   <React.StrictMode>
// // // //     <AuthProvider>
// // // //       <LayoutProvider>
// // // //         <ThemeProvider>
// // // //           <MainLayout>
// // // //             <App />
// // // //           </MainLayout>
// // // //         </ThemeProvider>
// // // //       </LayoutProvider>
// // // //     </AuthProvider>
// // // //   </React.StrictMode>
// // // // );

// // // // src/main.jsx
// // // import React from "react";
// // // import ReactDOM from "react-dom/client";
// // // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // // import { AuthProvider } from "./context/AuthContext";
// // // import { LayoutProvider } from "./context/LayoutContext";
// // // import { ThemeProvider } from "./context/ThemeContext";
// // // import MainLayout from "./layouts/MainLayout";
// // // import Home from "./pages/Home";
// // // import Dashboard from "./pages/Dashboard";

// // // const App = () => {
// // //   return (
// // //     <BrowserRouter>
// // //       <Routes>
// // //         <Route path="/" element={<Home />} />
// // //         <Route path="/dashboard" element={<Dashboard />} />
// // //         <Route path="*" element={<Navigate to="/" replace />} />
// // //       </Routes>
// // //     </BrowserRouter>
// // //   );
// // // };

// // // ReactDOM.createRoot(document.getElementById("root")).render(
// // //   <React.StrictMode>
// // //     <AuthProvider>
// // //       <LayoutProvider>
// // //         <ThemeProvider>
// // //           <MainLayout>
// // //             <App />
// // //           </MainLayout>
// // //         </ThemeProvider>
// // //       </LayoutProvider>
// // //     </AuthProvider>
// // //   </React.StrictMode>
// // // );

// // // // src/main.jsx
// // // import React from "react";
// // // import ReactDOM from "react-dom/client";
// // // import App from "./App";

// // // ReactDOM.createRoot(document.getElementById("root")).render(
// // //   <React.StrictMode>
// // //     <App />
// // //   </React.StrictMode>
// // // );

// // // src/main.jsx
// // import React from "react";
// // import ReactDOM from "react-dom/client";
// // import { BrowserRouter } from "react-router-dom";
// // import App from "./App";
// // import { AuthProvider } from "./context/AuthContext";

// // ReactDOM.createRoot(document.getElementById("root")).render(
// //   <React.StrictMode>
// //     <BrowserRouter>
// //       <AuthProvider>
// //         <App />
// //       </AuthProvider>
// //     </BrowserRouter>
// //   </React.StrictMode>
// // );

// // src/main.jsx
// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import { AuthProvider } from "./context/AuthContext";
// import { LayoutProvider } from "./context/LayoutContext";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <LayoutProvider>
//           <App />
//         </LayoutProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );

// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
