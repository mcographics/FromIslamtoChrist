import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.1.1'),
    'import.meta.env.VITE_GITHUB_OWNER': JSON.stringify(process.env.VITE_GITHUB_OWNER || 'mcographics'),
    'import.meta.env.VITE_GITHUB_REPO': JSON.stringify(process.env.VITE_GITHUB_REPO || 'FromIslamtoChrist'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
