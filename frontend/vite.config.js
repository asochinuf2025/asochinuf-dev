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
          // Core React libraries
          'vendor-core': ['react', 'react-dom', 'react-router-dom'],
          // Animation library
          'vendor-animation': ['framer-motion'],
          // Charts library (lazy loaded, but separate chunk)
          'vendor-charts': ['recharts'],
          // Drag and drop (lazy loaded, admin only)
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          // UI components
          'vendor-ui': ['sonner'],
          // Utilities
          'vendor-utils': ['axios', 'lucide-react'],
        },
      },
    },
    // Increase chunk size warning threshold since we have large sections
    chunkSizeWarningLimit: 600,
  },
})
