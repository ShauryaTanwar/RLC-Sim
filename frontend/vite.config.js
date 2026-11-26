import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/testSetup.js'], testTimeout: 15000, fileParallelism: false },
  server: { proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } } },
  build: { rollupOptions: { output: { manualChunks: { plotly: ['plotly.js-basic-dist-min'] } } } },
});
