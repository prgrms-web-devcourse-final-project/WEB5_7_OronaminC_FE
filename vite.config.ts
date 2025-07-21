import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://15.165.241.81:8080',
        changeOrigin: true,
        secure: false
      },
      '/oauth2': {
        target: 'http://15.165.241.81:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
