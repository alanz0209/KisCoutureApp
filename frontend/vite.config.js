import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-spa-files',
      closeBundle() {
        try {
          const distDir = resolve(__dirname, 'dist')
          const indexPath = resolve(distDir, 'index.html')
          const notFoundPath = resolve(distDir, '404.html')
          
          // Copier index.html vers 404.html pour le SPA routing
          copyFileSync(indexPath, notFoundPath)
          console.log('✓ 404.html created for SPA routing')
          
          // Copier render.json (au cas où)
          copyFileSync(
            resolve(__dirname, 'render.json'),
            resolve(distDir, 'render.json')
          )
          console.log('✓ render.json copied to dist/')
        } catch (err) {
          console.error('Failed to copy SPA files:', err)
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
