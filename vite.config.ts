import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          if (id.includes('commonjsHelpers')) return 'common';
          if (id.includes('/node_modules/phaser/')) return 'phaser';
        },
      },
    },
  },
  test: { include: ['tests/**/*.test.ts'] },
});
