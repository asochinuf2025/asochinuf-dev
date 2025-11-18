import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React as base vendor chunk (not lazy loaded)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Lazy-loaded optional dependencies
          'vendor-animation': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-http': ['axios'],
          'vendor-icons': ['lucide-react'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', '@dnd-kit/accessibility'],
        },
      },
    },
    // Increase chunk size warning threshold since we have large sections
    chunkSizeWarningLimit: 600,
  },
})
