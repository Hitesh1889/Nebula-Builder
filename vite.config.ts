import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // API key is injected at BUILD TIME from the environment variable.
    // On Render Static Site: set GEMINI_API_KEY in dashboard → baked into build automatically.
    // Locally: set GEMINI_API_KEY in .env.local
    const apiKey = env.GEMINI_API_KEY || env.API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2020',
        // FIX: Use esbuild (built into Vite, zero extra deps) instead of terser
        // terser requires a separate install and was causing the Render build failure
        minify: 'esbuild',
        rollupOptions: {
          output: {
            // Code-split for faster initial load
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-genai': ['@google/genai'],
              'vendor-ui': ['lucide-react', 'jszip'],
            }
          }
        },
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 0, // Ensure CSS/assets are always separate files with correct MIME types
        cssCodeSplit: true,
      }
    };
});
