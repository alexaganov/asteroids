import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/asteroids/',
  plugins: [react(), svgr()],
  build: {
    outDir: 'build'
  },
  resolve: {
    alias: [{ find: '@/', replacement: '/src/' }]
  }
});
