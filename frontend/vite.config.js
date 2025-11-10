import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['albaysan-onlinefrontend.onrender.com'],
    host: '0.0.0.0',
    port: 10000
  }
})

