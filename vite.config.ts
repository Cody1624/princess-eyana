import { defineConfig } from 'vite';
export default defineConfig(({ command, isPreview }) => ({ base: command === 'build' || isPreview ? '/princess-eyana/' : '/', build: { chunkSizeWarningLimit: 1600 } }));
