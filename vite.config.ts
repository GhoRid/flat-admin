import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const config = defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    svgr(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
  ],
  resolve: {
    alias: {
      '#': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
      '@svgs': path.resolve(__dirname, 'src/assets/svgs'),
    },
  },
})

export default config
