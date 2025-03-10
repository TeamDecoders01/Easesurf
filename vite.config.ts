import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html'), // Popup entry
                content: resolve(__dirname, 'src/content.ts'), // Content script entry
            },
            output: {
                entryFileNames: '[name].js', // This should generate popup.js and content.js
            },
        },
    },
});
