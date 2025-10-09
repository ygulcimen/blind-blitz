import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Brotli compression (better than gzip - 20-25% smaller!)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10kb
    }),
    // Gzip compression (fallback for older browsers)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split chess logic (heavy library)
          'chess-engine': ['chess.js', 'react-chessboard'],
          // Split UI animation library
          'ui-animations': ['framer-motion'],
          // Split icons library
          'ui-icons': ['lucide-react'],
          // Split Supabase SDK
          'supabase': ['@supabase/supabase-js'],
          // Split React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Sentry (error tracking)
          'sentry': ['@sentry/react'],
          // Split Analytics
          'analytics': ['react-ga4'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2, // Run compression twice for better results
        unsafe_arrows: true, // Optimize arrow functions
        unsafe_methods: true, // Optimize method calls
      },
      mangle: {
        safari10: true, // Fix Safari 10 bug
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Enable source maps only for errors (smaller than full maps)
    sourcemap: false,
    // Report compressed size
    reportCompressedSize: true,
  },
})
