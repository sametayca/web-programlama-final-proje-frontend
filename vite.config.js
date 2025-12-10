import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Tüm ağ arayüzlerinde dinle (mobil cihazlar için gerekli)
    port: 3001,
    allowedHosts: [
      'web-programlama-final-proje-frontend-production.up.railway.app',
      '.railway.app', // Tüm Railway domain'lerine izin ver
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend localhost'ta çalışıyor
        changeOrigin: true
      }
    }
  }
})

