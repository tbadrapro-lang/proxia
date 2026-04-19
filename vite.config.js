import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('@supabase/supabase-js')) return 'supabase';
            if (
              id.includes('react-router-dom') ||
              id.includes('react-dom') ||
              /node_modules[\\/]react[\\/]/.test(id)
            ) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
})
