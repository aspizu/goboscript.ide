import {Editor, useMonaco} from "@monaco-editor/react"
import {signal, useSignal} from "@preact/signals-react"
import {PlayIcon} from "lucide-react"

import {FileTree} from "@/components/file-tree"
import {ProjectPlayer} from "@/components/project-player"
import {Button} from "@/components/ui/button"
import * as b64 from "@/lib/b64"
import {convertPosition, getDiagnosticMessage, translatePosition} from "@/lib/diag"
import type {Diagnostic, Diagnostics} from "@/lib/types"
import {currentFilePath, files} from "@/state"
import * as Goboscript from "goboscript"

import {cn} from "@/lib/utils"
import {AppMenubar} from "../features/app-menubar"

Goboscript.initialize()
export const project = signal<ArrayBuffer | null>(null)

export const LANGUAGES: Record<string, string> = {
    txt: "plaintext",
    gs: "c",
    svg: "svg",
    toml: "toml",
}

function createDiagnosticMarker(
    unit: any,
    d: Diagnostic,
    monaco: ReturnType<typeof useMonaco>,
) {
    const [start, startInclude] = translatePosition(unit, d.span.start)
    const [end, endInclude] = translatePosition(unit, d.span.end)
    const [startLine, startColumn] = convertPosition(startInclude, start)
    const [endLine, endColumn] = convertPosition(endInclude, end)

    return {
        startLineNumber: startLine,
        endLineNumber: endLine,
        startColumn,
        endColumn,
        message: getDiagnosticMessage(d.kind),
        severity: monaco!.MarkerSeverity.Error,
    }
}

async function onRun(monaco: ReturnType<typeof useMonaco>) {
    monaco?.editor.removeAllMarkers("goboscript")

    const memfs = {
        files: Object.fromEntries(
            await Promise.all(
                files.value.map(async (file) => [
                    `project/${file.path}`,
                    {inner: await b64.dataToBase64(file.text)},
                ]),
            ),
        ),
    }

    const result: ArrayBuffer | Diagnostics = Goboscript.build(memfs)

    if ("byteLength" in result) {
        console.log(`Built project (${result.byteLength} bytes)`)
        project.value = result
    } else {
        if (!monaco) return

        const {stage_diagnostics, sprites_diagnostics} = result

        const stageModel = monaco.editor.getModel(monaco.Uri.parse(`file:///stage.gs`))
        if (stageModel) {
            monaco.editor.setModelMarkers(
                stageModel,
                "goboscript",
                stage_diagnostics.diagnostics.map((d) =>
                    createDiagnosticMarker(
                        stage_diagnostics.translation_unit,
                        d,
                        monaco,
                    ),
                ),
            )
        }

        for (const [name, diagnostics] of sprites_diagnostics.entries()) {
            const model = monaco.editor.getModel(monaco.Uri.parse(`file:///${name}.gs`))
            if (model) {
                monaco.editor.setModelMarkers(
                    model,
                    "goboscript",
                    diagnostics.diagnostics.map((d) =>
                        createDiagnosticMarker(diagnostics.translation_unit, d, monaco),
                    ),
                )
            }
        }
    }
}

export const $monaco = signal<ReturnType<typeof useMonaco> | null>(null)

export function App() {
    const monaco = useMonaco()
    if (monaco && !$monaco.value) {
        $monaco.value = monaco
    }
    const isRunning = useSignal(false)

    const currentFile =
        files.value.find(
            (f) => f.path === currentFilePath.value && typeof f.text === "string",
        ) ?? files.value.find((f) => f.path === "stage.gs")!

    const isNotFile = currentFile.path !== currentFilePath.value

    const handleEditorChange = (value?: string) => {
        files.value = files.value.map((f) =>
            f.path === currentFile.path ? {...f, text: value ?? f.text} : f,
        )
    }

    const getLanguage = () => LANGUAGES[currentFile.path.split(".").pop() ?? "txt"]

    return (
        <div className="flex h-full w-full grow flex-col">
            <div className="flex items-center">
                <AppMenubar />
                <Button
                    className="mr-1 ml-auto h-7 px-2"
                    disabled={isRunning.value}
                    size="sm"
                    onClick={async () => {
                        isRunning.value = true
                        await onRun(monaco)
                        isRunning.value = false
                    }}
                >
                    <PlayIcon />
                    Run
                </Button>
            </div>

            <div className="border-t-input flex grow gap-1 overflow-hidden border-t p-1">
                <FileTree />

                <div className="grow overflow-hidden rounded-md">
                    <Editor
                        className={cn(isNotFile && "hidden")}
                        theme="vs-dark"
                        path={`file:///${currentFile.path}`}
                        defaultLanguage={getLanguage()}
                        defaultValue={currentFile.text as string}
                        onChange={handleEditorChange}
                    />
                </div>

                <div className="h-[360px] w-[480px] shrink-0 rounded-md bg-neutral-300">
                    <ProjectPlayer project={project.value} />
                </div>
            </div>
        </div>
    )
}
