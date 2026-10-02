import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { sourcemap: false, target: 'es2022' },
  server: {
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
});
