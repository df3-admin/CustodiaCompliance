import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Custom plugin to exclude API directory
const excludeApiPlugin = () => {
  return {
    name: 'exclude-api',
    resolveId(id: string) {
      if (id.includes('api/') || id.includes('pg') || id.includes('@vercel/node')) {
        return { id, external: true }
      }
    },
    load(id: string) {
      if (id.includes('api/') || id.includes('pg') || id.includes('@vercel/node')) {
        return null
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), excludeApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          markdown: ['react-markdown'],
          helmet: ['react-helmet-async'],
          icons: ['lucide-react']
        }
      }
    }
  }
})
