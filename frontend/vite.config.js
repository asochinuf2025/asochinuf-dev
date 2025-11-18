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
          // Split vendor libraries for better caching - React must be separate and loaded first
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Increase chunk size warning threshold since we have large sections
    chunkSizeWarningLimit: 1000,
  },
})
