import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Server-only configuration: never expose DATABASE_URL or other API secrets to the client.
  const env = loadEnv(mode, fileURLToPath(new URL('../server', import.meta.url)), '');
  const target = 'http://127.0.0.1:' + (process.env.PORT || env.PORT || '3001');
  const proxy = { '/api': { target, changeOrigin: true } };
  return {
    plugins: [react()],
    server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true, proxy },
  };
});
