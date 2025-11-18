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
        manualChunks: (id) => {
          // Vendor libraries - split by function
          if (id.includes('node_modules')) {
            if (id.includes('react') && !id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation'; // Lazy loaded anyway
            }
            if (id.includes('recharts')) {
              return 'vendor-charts'; // Lazy loaded anyway
            }
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd'; // Admin only
            }
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            if (id.includes('lucide')) {
              return 'vendor-icons';
            }
            // Default for other node_modules
            return 'vendor-other';
          }
        },
      },
    },
    // Increase chunk size warning threshold since we have large sections
    chunkSizeWarningLimit: 600,
  },
})
