import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: {
    target:    'es2020',
    minify:    'esbuild',
    // Inline ALL assets into JS — eliminates the CSS MIME type problem entirely
    // by removing external .css files that Render serves with wrong Content-Type
    assetsInlineLimit: 100 * 1024, // inline everything under 100KB
    cssCodeSplit: false,            // single CSS chunk, then inlined
    rollupOptions: {
      output: {
        // Single bundle — no separate CSS file to serve with wrong MIME type
        manualChunks: undefined,
      }
    },
    sourcemap: false,
  }
});
