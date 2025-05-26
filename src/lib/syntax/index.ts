import type {useMonaco} from "@monaco-editor/react"
import * as goboscript from "./goboscript"
import * as toml from "./toml"

export function register(monaco: NonNullable<ReturnType<typeof useMonaco>>) {
    goboscript.register(monaco)
    toml.register(monaco)
}
