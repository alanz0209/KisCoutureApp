import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync } from 'fs'
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
          
          // Vérifier si le fichier index.html existe avant de le copier
          if (existsSync(indexPath)) {
            // Copier index.html vers 404.html pour le SPA routing
            copyFileSync(indexPath, notFoundPath)
            console.log('✓ 404.html created for SPA routing')
          } else {
            console.log('⚠ index.html not found, skipping 404.html creation')
          }
          
          // Copier render.json (au cas où)
          const renderJsonPath = resolve(__dirname, 'render.json')
          if (existsSync(renderJsonPath)) {
            copyFileSync(
              renderJsonPath,
              resolve(distDir, 'render.json')
            )
            console.log('✓ render.json copied to dist/')
          }
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