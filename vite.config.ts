import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import {defineConfig} from "vite"
import {nodePolyfills} from "vite-plugin-node-polyfills"
import topLevelAwait from "vite-plugin-top-level-await"
import wasm from "vite-plugin-wasm"

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [["module:@preact/signals-react-transform", {mode: "all"}]]
            }
        }),
        tailwindcss(),
        wasm(),
        topLevelAwait(),
        nodePolyfills()
    ],
    worker: {format: "es", plugins: () => [wasm(), topLevelAwait(), nodePolyfills()]},
    resolve: {alias: {"@": path.resolve(__dirname, "./src")}},
    build: {target: "esnext", sourcemap: true, emptyOutDir: true}
})
