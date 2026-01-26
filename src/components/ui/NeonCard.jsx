// src/components/ui/NeonCard.jsx
import React from "react";

const NeonCard = ({ title, value, unit, factor, type = "cyan" }) => {
  const colors = {
    cyan: {
      border: "#00f3ff",
      shadow: "rgba(0, 243, 255, 0.3)",
      text: "#00f3ff",
    },
    magenta: {
      border: "#ff00ff",
      shadow: "rgba(255, 0, 255, 0.3)",
      text: "#ff00ff",
    },
    amber: {
      border: "#ffab00",
      shadow: "rgba(255, 171, 0, 0.3)",
      text: "#ffab00",
    },
  };

  const config = colors[type] || colors.cyan;

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        borderLeft: `4px solid ${config.border}`,
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: `0 4px 15px ${config.shadow}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "120px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <span
          style={{
            color: "#94a3b8",
            fontSize: "10px",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          {title}
        </span>
        <span style={{ color: config.text, fontSize: "10px" }}>●</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          marginTop: "10px",
        }}
      >
        <div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "white" }}>
            {value}
          </div>
          <div
            style={{ fontSize: "9px", color: "#64748b", fontWeight: "bold" }}
          >
            {unit}
          </div>
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: "10px", color: "#cbd5e1" }}>
            F.C. {factor}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NeonCard;
