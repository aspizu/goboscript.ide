import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import {defineConfig} from "vite"
import wasm from "vite-plugin-wasm"

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        wasm(),
        react({
            babel: {
                plugins: [["module:@preact/signals-react-transform"]],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        target: "esnext",
        sourcemap: true,
    },
})
