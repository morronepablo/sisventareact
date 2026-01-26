/** @type {import('tailwindcss').Config} */
export default {
  important: true, // 👈 ESTO ES VITAL: Fuerza a Tailwind sobre AdminLTE
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "cyber-bg": "#0a0b10",
        "neon-cyan": "#00f3ff",
        "neon-magenta": "#ff00ff",
        "neon-amber": "#ffab00",
      },
    },
  },
  plugins: [],
};
