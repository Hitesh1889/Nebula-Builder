import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      server: { port: 3000, host: '0.0.0.0' },
      plugins: [react()],
      define: {
        // Render: set these in dashboard → baked into build at deploy time
        'process.env.GROQ_API_KEY':        JSON.stringify(env.GROQ_API_KEY        || ''),
        'process.env.OPENROUTER_API_KEY':  JSON.stringify(env.OPENROUTER_API_KEY  || ''),
      },
      resolve: { alias: { '@': path.resolve(__dirname, '.') } },
      build: {
        target: 'es2020',
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-ui':    ['lucide-react', 'jszip'],
            }
          }
        },
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 0,
        cssCodeSplit: true,
      }
    };
});
