import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import {defineConfig} from "vite"
import topLevelAwait from "vite-plugin-top-level-await"
import wasm from "vite-plugin-wasm"

export default defineConfig({
    plugins: [
        react({babel: {plugins: [["module:@preact/signals-react-transform"]]}}),
        tailwindcss(),
        wasm(),
        topLevelAwait(),
    ],
    worker: {
        format: "es",
        plugins: () => [wasm(), topLevelAwait()],
    },
    resolve: {alias: {"@": path.resolve(__dirname, "./src")}},
    build: {target: "esnext", outDir: "dist", sourcemap: true, emptyOutDir: true},
})
