import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/asteroids/',
  plugins: [react()],
  build: {
    outDir: 'build'
  },
  resolve: {
    alias: [{ find: '@/', replacement: '/src/' }]
  }
});
