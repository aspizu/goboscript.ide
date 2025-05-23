import {scaffolding} from "@/features/app-player"
import * as base64 from "@/lib/base64"
import {convertPosition, translatePosition} from "@/lib/diag"
import type {useMonaco} from "@monaco-editor/react"
import {type Signal, signal} from "@preact/signals-react"
import * as goboscript from "goboscript"
import {editor as editorTypes, MarkerSeverity, Uri} from "monaco-editor"

export const editor = signal() as Signal<editorTypes.IStandaloneCodeEditor>
export const monaco = signal() as Signal<NonNullable<ReturnType<typeof useMonaco>>>
export const fs = signal<Record<string, string | Blob>>({
    "stage.gs": `# This is the Stage, list more backdrops separated by comma.\ncostumes "blank.svg";\n`,
    "main.gs": `# This is a sprite.\ncostumes "blank.svg";\n\n# when green flag clicked\nonflag {\n  say "Hello, World!";\n}\n`,
    "blank.svg": `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg"></svg>\n`,
})
export const selectedFile = signal<string>()

export class FS {
    static addFile(path: string, file: string | Blob) {
        fs.value = {...fs.value, [path]: file}
    }

    static removeFile(path: string) {
        const {value} = fs
        fs.value = Object.fromEntries(Object.entries(value).filter(([p]) => p !== path))
        if (path === selectedFile.value) selectedFile.value = undefined
    }

    static renameFile(oldPath: string, newPath: string) {
        const {value} = fs
        fs.value = Object.fromEntries(
            Object.entries(value).map(([path, file]) => [
                path === oldPath ? newPath : path,
                file,
            ]),
        )
        if (oldPath === selectedFile.value) selectedFile.value = newPath
    }

    static pullModelState() {
        const $monaco = monaco.value
        if (!$monaco) return
        const newfs = {...fs.value}
        for (const model of $monaco.editor.getModels()) {
            const {path} = model.uri
            if (newfs[path]) newfs[path] = model.getValue()
        }
        fs.value = newfs
    }
}

goboscript.initialize()
export const build = signal<goboscript.Build>()

export class Compiler {
    static async compile() {
        const entries = await Promise.all(
            Object.entries(fs.value)
                .map(([path, blob]) => ({
                    path,
                    blob: typeof blob == "string" ? new Blob([blob]) : blob,
                }))
                .map(async ({path, blob}) => [
                    `project/${path}`,
                    {inner: (await base64.encode(blob)) as any},
                ]),
        )
        build.value = goboscript.build({files: Object.fromEntries(entries)})
    }

    static updateDiagnostics() {
        const $monaco = monaco.value
        const $build = build.value
        if (!$build) return
        const {artifact} = $build
        const stageModel = $monaco.editor.getModel(Uri.parse("urn:stage.gs"))
        if (stageModel) {
            const {translation_unit, diagnostics} = artifact.stage_diagnostics
            const stageMarkers = diagnostics.map((diagnostic) =>
                Compiler.diagnosticToMarker(
                    translation_unit,
                    artifact.project.stage,
                    diagnostic,
                ),
            )
            $monaco.editor.setModelMarkers(stageModel, "goboscript", stageMarkers)
        }
        for (const [
            name,
            {translation_unit, diagnostics},
        ] of artifact.sprites_diagnostics.entries()) {
            const model = $monaco.editor.getModel(Uri.parse(`urn:${name}.gs`))
            if (!model) continue
            const markers = diagnostics.map((diagnostic) =>
                Compiler.diagnosticToMarker(
                    translation_unit,
                    artifact.project.sprites.get(name)!,
                    diagnostic,
                ),
            )
            $monaco.editor.setModelMarkers(model, "goboscript", markers)
        }
    }

    // TODO: fix paths!!!
    static diagnosticToMarker(
        translation_unit: goboscript.TranslationUnit,
        sprite: goboscript.Sprite,
        diagnostic: goboscript.Diagnostic,
    ): editorTypes.IMarkerData {
        const message = goboscript.diagnostic_to_string(diagnostic, sprite)
        const [start, incStart] = translatePosition(
            translation_unit,
            diagnostic.span.start,
        )
        const [end, incEnd] = translatePosition(translation_unit, diagnostic.span.end)
        const [startLineNumber, startColumn] = convertPosition(incStart, start)
        const [endLineNumber, endColumn] = convertPosition(incEnd, end)
        return {
            severity: MarkerSeverity.Error,
            message,
            startLineNumber,
            startColumn,
            endLineNumber,
            endColumn,
        }
    }

    static async loadProject(): Promise<boolean> {
        const $build = build.value
        if (!$build) return true
        const data = base64.decode($build.file as any)
        console.log(`Loaded project (${data.size} bytes)`)
        const buffer = await data.arrayBuffer()
        try {
            await scaffolding.loadProject(buffer)
            return true
        } catch {
            return false
        }
    }
}

export interface ConsoleMessage {
    severity: "log" | "warn" | "error"
    message: string
    path: string
    lineNo: number
}

export const $console = signal<ConsoleMessage[]>([])

export class Console {
    static addMessage(
        severity: "log" | "warn" | "error",
        message: string,
        path: string,
        lineNo: number,
    ) {
        $console.value = [...$console.value, {severity, message, path, lineNo}]
    }
}
