// // src/pages/Home.jsx
// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6 text-center">
//           <h1>Sistema de Ventas</h1>
//           <p>Por favor, inicie sesión para continuar.</p>
//           <div className="mt-4">
//             <button
//               className="btn btn-primary me-2"
//               onClick={() => navigate("/login")}
//             >
//               Login
//             </button>
//             <button
//               className="btn btn-secondary"
//               onClick={() => navigate("/register")}
//             >
//               Register
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

// src/pages/Home.jsx
import React from "react";

const Home = () => {
  return <h1>🏠 Home</h1>;
};

export default Home;
