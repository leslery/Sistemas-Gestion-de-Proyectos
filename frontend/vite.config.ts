import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Usar base solo en producción (para GitHub Pages)
  base: command === 'build' ? '/Sistemas-Gestion-de-Proyectos/' : '/',
  server: {
    port: 8080,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
}))
