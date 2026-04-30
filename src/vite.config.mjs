import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiPort = env._PORT;

    return {
        plugins: [react(), tailwindcss()],
        server: {
            host: '127.0.0.1',
            port: 5173,
            strictPort: true,
            proxy: {
                '/api': {
                    target: `http://localhost:${apiPort}`,
                    changeOrigin: true,
                },
            },
        },
    };
})