import {scaffolding} from "@/features/app-player"
import * as base64 from "@/lib/base64"
import * as buildWorker from "@/lib/buildWorker"
import {EDITABLE_TYPES} from "@/lib/constants"
import {convertPosition, translatePosition} from "@/lib/diag"
import type {useMonaco} from "@monaco-editor/react"
import {type Signal, signal} from "@preact/signals-react"
import * as goboscript from "goboscript"
import * as localforage from "localforage"
import {editor as editorTypes, MarkerSeverity, Uri} from "monaco-editor"

async function persistentSignal<T>(initialValue: T, key: string): Promise<Signal<T>> {
    const stored = await localforage.getItem<T>(key)
    if (stored) {
        initialValue = stored
    }
    const $signal = signal<T>(initialValue)
    $signal.subscribe((value) => {
        localforage.setItem(key, value)
    })
    return $signal
}

export const editor = signal() as Signal<editorTypes.IStandaloneCodeEditor>
export const monaco = signal() as Signal<NonNullable<ReturnType<typeof useMonaco>>>
export const fs = await persistentSignal<Record<string, string | Blob>>(
    {
        "stage.gs": `# This is the Stage, list more backdrops separated by comma.\ncostumes "blank.svg";\n`,
        "main.gs": `# This is a sprite.\ncostumes "blank.svg";\n\n# when green flag clicked\nonflag {\n  say "Hello, World!";\n}\n`,
        "blank.svg": `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg"></svg>\n`,
        "goboscript.toml": `# goboscript project configuration\n\n# The target number of frames per second (FPS)\nframe_rate = 30\n\n# Maximum number of clones that can exist simultaneously\nmax_clones = 300.0\n\n# If true, removes various limits unrelated to clones or rendering\nno_miscellaneous_limits = false\n\n# If true, disables sprite fencing (sprites can move beyond stage borders)\nno_sprite_fencing = false\n\n# If true, enables frame interpolation for smoother animations\nframe_interpolation = false\n\n# If true, improves pen rendering quality (may affect performance)\nhigh_quality_pen = false\n\n# Width of the stage in pixels\nstage_width = 480\n\n# Height of the stage in pixels\nstage_height = 360\n`,
    },
    "fs",
)
export const selectedFile = await persistentSignal<string | undefined>(
    undefined,
    "selectedFile",
)

export class FS {
    static async addFile(path: string, file: string | Blob) {
        FS.pullModelState()
        if (
            EDITABLE_TYPES.includes(path.split(".").pop() ?? "") &&
            typeof file != "string"
        ) {
            file = await file.text()
        }
        fs.value = {...fs.value, [path]: file}
    }

    static removeFile(path: string) {
        FS.pullModelState()
        const {value} = fs
        fs.value = Object.fromEntries(Object.entries(value).filter(([p]) => p !== path))
        if (path === selectedFile.value) selectedFile.value = undefined
    }

    static renameFile(oldPath: string, newPath: string) {
        FS.pullModelState()
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
            if (path in newfs) newfs[path] = model.getValue()
        }
        fs.value = newfs
    }
}

goboscript.initialize()
export const build = await persistentSignal<goboscript.Build | undefined>(
    undefined,
    "build",
)

export class Compiler {
    static async compile() {
        const $entries = []
        for (let [path, file] of Object.entries(fs.value)) {
            if (path.endsWith(".gs")) {
                file += "\n"
            }
            const blob = typeof file == "string" ? new Blob([file]) : file
            $entries.push({path: `project/${path}`, blob})
        }
        const entries = await Promise.all(
            $entries.map(async ({path, blob}) => [
                path,
                {inner: await base64.encode(blob)},
            ]),
        )
        build.value = await buildWorker.build({files: Object.fromEntries(entries)})
    }

    static updateDiagnostics() {
        if (!build.value) return
        monaco.value.editor.removeAllMarkers("goboscript")
        const {project, sprites_diagnostics, stage_diagnostics} = build.value.artifact
        const markers = []
        for (const diagnostic of stage_diagnostics.diagnostics) {
            const marker = Compiler.diagnosticToMarker(
                stage_diagnostics.translation_unit,
                project.stage,
                diagnostic,
            )
            markers.push(marker)
        }
        for (const [name, diagnostics] of sprites_diagnostics.entries()) {
            for (const diagnostic of diagnostics.diagnostics) {
                const sprite = project.sprites.get(name)!
                const marker = Compiler.diagnosticToMarker(
                    diagnostics.translation_unit,
                    sprite,
                    diagnostic,
                )
                markers.push(marker)
            }
        }
        const grouped = Object.groupBy(markers, (marker) => marker.uri.path)
        for (const markers of Object.values(grouped)) {
            if (!markers) continue
            const uri = markers[0].uri
            const model = monaco.value.editor.getModel(uri)
            if (!model) continue
            monaco.value.editor.setModelMarkers(model, "goboscript", markers)
        }
        $console.value = markers
            .sort((a, b) => a.uri.path.localeCompare(b.uri.path))
            .map((marker) => ({
                severity: marker.severity === MarkerSeverity.Error ? "error" : "warn",
                message: marker.message,
                path: marker.uri.path,
                lineNo: marker.startLineNumber,
            }))
    }

    // TODO: fix paths!!!
    static diagnosticToMarker(
        translation_unit: goboscript.TranslationUnit,
        sprite: goboscript.Sprite,
        diagnostic: goboscript.Diagnostic,
    ): editorTypes.IMarkerData & {uri: Uri} {
        const message = goboscript.diagnostic_to_string(diagnostic, sprite)
        const [start, incStart] = translatePosition(
            translation_unit,
            diagnostic.span.start,
        )
        const [end, incEnd] = translatePosition(translation_unit, diagnostic.span.end)
        const [startLineNumber, startColumn] = convertPosition(incStart, start)
        const [endLineNumber, endColumn] = convertPosition(incEnd, end)
        return {
            uri: Uri.parse(`urn:${incStart.path.slice("project/".length)}`),
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

export const $console = await persistentSignal<ConsoleMessage[]>([], "$console")

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

setInterval(() => {
    FS.pullModelState()
}, 1000 * 60)

Compiler.loadProject()
