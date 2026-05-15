import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: false,
    proxy: {
      // Proxy /api/usuarios to ms-usuarios
      '/api/usuarios': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Proxy /api/comics to ms-comics
      '/api/comics': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // Proxy /orders to ms-ventas
      '/orders': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      }
    }
  }
})
