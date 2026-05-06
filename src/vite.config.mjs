import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        istanbul({
            include: 'client/**/*',
            exclude: ['node_modules', 'cypress'],
            extension: ['.js', '.jsx'],
            requireEnv: true,
            cypress: true,
        }),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: `http://localhost:${process.env._PORT}`,
                changeOrigin: true,
            },
        },
    },
})