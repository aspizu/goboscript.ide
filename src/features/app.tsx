import {FileTree} from "@/components/file-tree"
import {ProjectPlayer} from "@/components/project-player"
import {Button} from "@/components/ui/button"
import * as b64 from "@/lib/b64"
import {currentFile, currentFilePath, files} from "@/state"
import {Editor} from "@monaco-editor/react"
import {signal, useSignal} from "@preact/signals-react"
import * as Goboscript from "goboscript"
import {PlayIcon} from "lucide-react"
import {AppMenubar} from "../features/app-menubar"

Goboscript.initialize()

const languages: Record<string, string> = {
    txt: "plaintext",
    gs: "c",
    svg: "svg",
    toml: "toml",
}

const project = signal<ArrayBuffer | null>(null)

async function onRun() {
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
    const result = Goboscript.build(memfs)
    console.log(`Built project (${result.byteLength} bytes)`)
    project.value = result
}

export function App() {
    const isCurrentFileText = typeof currentFile.value?.text === "string"
    const isRunning = useSignal(false)
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center">
                <AppMenubar />
                <Button
                    className="mr-1 ml-auto h-7 px-2"
                    disabled={isRunning.value}
                    size="sm"
                    onClick={async () => {
                        isRunning.value = true
                        await onRun()
                        isRunning.value = false
                    }}
                >
                    <PlayIcon />
                    Run
                </Button>
            </div>
            <div className="border-t-input flex grow gap-1 border-t p-1">
                <FileTree />
                <div className="grow overflow-hidden rounded-md">
                    {isCurrentFileText && (
                        <Editor
                            theme="vs-dark"
                            path={currentFilePath.value}
                            defaultLanguage={
                                languages[
                                    currentFilePath.value.split(".").pop() ?? "txt"
                                ]
                            }
                            defaultValue={currentFile.value.text as string}
                            onChange={(value) => {
                                files.value = files.value.map((f) =>
                                    f.path === currentFilePath.value ?
                                        {
                                            ...f,
                                            text: value ?? f.text,
                                        }
                                    :   f,
                                )
                            }}
                        />
                    )}
                    {!isCurrentFileText && (
                        <div className="text-muted-foreground">
                            {currentFile.value.path}
                        </div>
                    )}
                </div>
                <div className="h-[360px] w-[480px] shrink-0 rounded-md bg-neutral-300">
                    <ProjectPlayer project={project.value} />
                </div>
            </div>
        </div>
    )
}
