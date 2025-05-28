import * as goboscript from "@/lib/syntax/goboscript"
import * as toml from "@/lib/syntax/toml"
import type {useMonaco} from "@monaco-editor/react"

export function register(monaco: NonNullable<ReturnType<typeof useMonaco>>) {
    goboscript.register(monaco)
    toml.register(monaco)
}
