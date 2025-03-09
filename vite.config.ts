import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html'),
                content: resolve(__dirname, 'src/content.ts'),
            },
            output: {
                entryFileNames: (chunk) => {
                    if (chunk.name === 'popup') return 'popup.js';
                    if (chunk.name === 'content') return 'content.js';
                    return '[name].js';
                },
            },
        },
    },
});
