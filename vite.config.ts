import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@dnd-kit')) return 'drag-and-drop';
          if (id.includes('@radix-ui')) return 'radix-ui';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('html-to-image')) return 'image-export';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('zustand') || id.includes('immer') || id.includes('zundo')) {
            return 'state';
          }
          if (id.includes('react')) return 'react';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
