/**
 * LUMEN THE CLUB — vite.config.js
 *
 * Configuracao do Vite como multi-page application.
 * Paginas: index.html (home) + galeria.html (galeria de fotos).
 */

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        galeria: resolve(import.meta.dirname, 'galeria.html'),
      },
    },
  },
  server: {
    open: true,
  },
});

