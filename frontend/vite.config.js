import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Asegura que se copie todo lo de public
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Mantén el nombre de los archivos para caché
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
});