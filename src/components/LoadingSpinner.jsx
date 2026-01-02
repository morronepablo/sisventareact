// src/components/LoadingSpinner.jsx
// import React from "react";

// const LoadingSpinner = () => (
//   <div className="d-flex justify-content-center align-items-center vh-100">
//     <div className="spinner-border text-primary" role="status">
//       <span className="sr-only">Cargando...</span>
//     </div>
//   </div>
// );

// export default LoadingSpinner;

// import React from "react";

// const LoadingSpinner = () => {
//   return (
//     <div style={styles.overlay}>
//       <div style={styles.container}>
//         <div style={styles.spinner}>
//           <div style={styles.doubleBounce1}></div>
//           <div style={styles.doubleBounce2}></div>
//         </div>
//         <p style={styles.text}>Cargando sistema...</p>
//       </div>

//       <style>
//         {`
//           @keyframes sk-bounce {
//             0%, 100% { transform: scale(0.0); }
//             50% { transform: scale(1.0); }
//           }
//           @keyframes spin {
//             to { transform: rotate(360deg); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// const styles = {
//   overlay: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "100vh",
//     width: "100%",
//     backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semitransparente
//     position: "fixed",
//     top: 0,
//     left: 0,
//     zIndex: 9999,
//   },
//   container: {
//     textAlign: "center",
//   },
//   spinner: {
//     width: "60px",
//     height: "60px",
//     position: "relative",
//     margin: "0 auto 15px",
//   },
//   doubleBounce1: {
//     width: "100%",
//     height: "100%",
//     borderRadius: "50%",
//     backgroundColor: "#007bff", // Color primary
//     opacity: 0.6,
//     position: "absolute",
//     top: 0,
//     left: 0,
//     animation: "sk-bounce 2.0s infinite ease-in-out",
//   },
//   doubleBounce2: {
//     width: "100%",
//     height: "100%",
//     borderRadius: "50%",
//     backgroundColor: "#17a2b8", // Color info para un degradado bonito
//     opacity: 0.6,
//     position: "absolute",
//     top: 0,
//     left: 0,
//     animation: "sk-bounce 2.0s infinite ease-in-out",
//     animationDelay: "-1.0s",
//   },
//   text: {
//     color: "#333",
//     fontSize: "1.1rem",
//     fontWeight: "bold",
//     fontFamily: "Arial, sans-serif",
//     letterSpacing: "1px",
//   },
// };

// export default LoadingSpinner;

import React from "react";

const LoadingSpinner = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.spinnerWrapper}>
          <svg style={styles.svg} viewBox="0 0 100 100">
            {/* Círculo Azul */}
            <circle
              cx="50"
              cy="50"
              r="40"
              style={{
                ...styles.circle,
                stroke: "#4285F4",
                animationDelay: "0s",
              }}
            />
            {/* Círculo Rojo */}
            <circle
              cx="50"
              cy="50"
              r="40"
              style={{
                ...styles.circle,
                stroke: "#EA4335",
                animationDelay: "-0.5s",
              }}
            />
            {/* Círculo Amarillo */}
            <circle
              cx="50"
              cy="50"
              r="40"
              style={{
                ...styles.circle,
                stroke: "#FBBC05",
                animationDelay: "-1s",
              }}
            />
            {/* Círculo Verde */}
            <circle
              cx="50"
              cy="50"
              r="40"
              style={{
                ...styles.circle,
                stroke: "#34A853",
                animationDelay: "-1.5s",
              }}
            />
          </svg>
        </div>
        <p style={styles.text}>Cargando información...</p>
      </div>

      <style>
        {`
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes dash {
            0% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 89, 200;
              stroke-dashoffset: -35;
            }
            100% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: -124;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  overlay: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Fondo blanco traslúcido
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  spinnerWrapper: {
    width: "100px",
    height: "100px",
    position: "relative",
  },
  svg: {
    width: "100%",
    height: "100%",
    animation: "rotate 2s linear infinite",
    transformOrigin: "center",
  },
  circle: {
    fill: "none",
    strokeWidth: "8",
    strokeLinecap: "round",
    animation: "dash 2s ease-in-out infinite",
    transformOrigin: "center",
    position: "absolute",
  },
  text: {
    marginTop: "20px",
    color: "#444",
    fontSize: "1rem",
    fontWeight: "500",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    letterSpacing: "0.5px",
  },
};

export default LoadingSpinner;
