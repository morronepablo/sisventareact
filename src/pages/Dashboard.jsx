// // // // src/pages/Dashboard.jsx
// // // import React from "react";

// // // const Dashboard = () => {
// // //   return (
// // //     <div
// // //       style={{
// // //         padding: "20px",
// // //         minHeight: "100vh",
// // //         backgroundColor: "#fff",
// // //         fontFamily: "Arial, sans-serif",
// // //       }}
// // //     >
// // //       <h1>🚀 ¡Hola, Pablo!</h1>
// // //       <p>
// // //         Estás logueado como: <strong>admin@admin.com</strong>
// // //       </p>
// // //       <p>Token guardado en localStorage ✅</p>
// // //       <p>Permisos: ver_usuarios, ver_permisos, etc. ✅</p>
// // //       <p>Si ves esto, el problema NO es el backend ni el AuthContext.</p>
// // //       <p>Probablemente era un error de estilos o layout.</p>
// // //     </div>
// // //   );
// // // };

// // // export default Dashboard;

// // // src/pages/Dashboard.jsx
// // import React from "react";

// // const Dashboard = () => {
// //   return <h1>📊 Dashboard</h1>;
// // };

// // export default Dashboard;

// <div className="card" style={{ backgroundColor: "#fff" }}>
//   <div className="card-body">
//     <h3>Bienvenido al sistema de ventas</h3>
//     <p>Desde aquí podrás gestionar usuarios, permisos, roles y más.</p>
//   </div>
// </div>;

// src/pages/Dashboard.jsx
import React from "react";

const Dashboard = () => {
  console.log("Dashboard renderizado");
  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">Dashboard</h1>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h3>Bienvenido al sistema de ventas</h3>
                <p>
                  Desde aquí podrás gestionar usuarios, permisos, roles y más.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
