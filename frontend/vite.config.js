import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-render-config',
      closeBundle() {
        // Copier render.json dans dist pour la configuration Render
        try {
          copyFileSync(
            resolve(__dirname, 'render.json'),
            resolve(__dirname, 'dist/render.json')
          )
          console.log('✓ render.json copied to dist/')
        } catch (err) {
          console.error('Failed to copy render.json:', err)
        }
      }
    }
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
