import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB (default is 500 kB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into vendor chunk
          if (id.includes('node_modules')) {
            // Split large libraries into separate chunks
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('gsap') || id.includes('lottie')) {
              return 'animation-vendor';
            }
            // All other node_modules go into vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
})
