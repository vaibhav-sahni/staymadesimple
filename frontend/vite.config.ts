import { defineConfig } from 'vite'

// Proxy /api/* to backend at http://localhost:8000 and strip /api prefix
export default defineConfig({
  server: {
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
