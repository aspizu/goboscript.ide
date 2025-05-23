import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import {defineConfig} from "vite"
import wasm from "vite-plugin-wasm"

export default defineConfig({
    plugins: [
        react({babel: {plugins: [["module:@preact/signals-react-transform"]]}}),
        tailwindcss(),
        wasm(),
    ],
    resolve: {alias: {"@": path.resolve(__dirname, "./src")}},
    build: {target: "esnext"},
})
