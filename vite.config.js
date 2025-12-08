import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Docker container için gerekli
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://backend:3000', // Docker network içinde container adı
        changeOrigin: true
      }
    }
  }
})

