import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 개발 서버 프록시 대상 백엔드. 배포 서버로 붙이려면 .env.local에 VITE_PROXY_TARGET을 지정한다
  const env = loadEnv(mode, '.', '');
  const target = env.VITE_PROXY_TARGET || 'http://localhost:8080';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      global: 'globalThis',
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false
        },
        '/oauth2': {
          target,
          changeOrigin: true,
          secure: false
        },
        // SockJS (XHR 폴백 + WebSocket 업그레이드)
        '/ws': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    }
  };
});
