import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/messageDetector.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          // Output popup HTML to root as popup.html
          if (assetInfo.name === 'index.html' && assetInfo.source.includes('popup')) {
            return 'popup.html';
          }
          return '[name].[ext]';
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@mindful/common': resolve(__dirname, '../../packages/common/src'),
      '@mindful/nlp-worker': resolve(__dirname, '../../packages/nlp-worker/src')
    }
  },
  
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
