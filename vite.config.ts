import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const runtimeProcess = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process

export default defineConfig({
  base: runtimeProcess?.env?.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    hmr: false,
  },
})
