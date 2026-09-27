import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["albaysan-onlinefrontend.onrender.com"],
    host: "0.0.0.0",
    port: 10000,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          animations: ["animejs"],
          vendor: ["react", "react-dom", "react-router-dom", "axios", "i18next", "react-i18next"],
        },
      },
    },
  },
});
