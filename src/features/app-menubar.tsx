import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"
import {currentFilePath, files, setFiles, type File as IFile} from "@/state"
import {batch, Signal, useSignal} from "@preact/signals-react"
import {saveAs} from "file-saver"
import JSZip from "jszip"
import {project} from "./app"

function requestFileUpload({accept}: {accept?: string} = {}): Promise<
    File | undefined
> {
    return new Promise((resolve) => {
        const element = document.createElement("input")
        element.type = "file"
        element.accept = accept || ""
        element.onchange = (e) => {
            const file = (e.target as HTMLInputElement | null)?.files?.[0]
            resolve(file)
        }
        element.click()
    })
}

function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result as string)
        }
        reader.readAsText(file)
    })
}

async function addFile(file: File) {
    const obj: IFile = {path: file.name, text: ""}
    if (file.name.endsWith(".gs") || file.name.endsWith(".svg")) {
        obj.text = await readFile(file)
    } else {
        obj.text = new Blob([await file.arrayBuffer()])
    }
    batch(() => {
        files.value = [...files.value, obj]
        currentFilePath.value = obj.path
    })
}

function saveProject() {
    if (!project.value) return
    saveAs(new Blob([project.value]), "project.sb3")
}

async function uploadProject() {
    const zipFile = await requestFileUpload({accept: "application/zip"})
    if (!zipFile) return

    const zip = await JSZip.loadAsync(zipFile)
    const extensionsAsText = ["gs", "svg", "toml", "txt"]

    const newFiles = await Promise.all(
        Object.values(zip.files).map(async (file) => {
            const ext = file.name.split(".").pop() || ""
            const content =
                extensionsAsText.includes(ext) ?
                    await file.async("text")
                :   await file.async("blob")

            return {
                path: file.name,
                text: content,
            }
        }),
    )

    const prefix =
        newFiles
            .find((f) => f.path.endsWith("/stage.gs"))
            ?.path.slice(0, -"stage.gs".length) ?? ""

    if (prefix === "" && !newFiles.find((f) => f.path === "stage.gs")) {
        newFiles.push({
            path: "stage.gs",
            text: "",
        })
    }

    batch(() => {
        setFiles(
            newFiles
                .map((f) => ({
                    ...f,
                    path:
                        f.path.startsWith(prefix) ?
                            f.path.slice(prefix.length)
                        :   f.path,
                }))
                .filter((f) => f.path),
        )
        currentFilePath.value = "stage.gs"
    })
}

function NewFileDialog({isOpen}: {isOpen: Signal<boolean>}) {
    const fileName = useSignal("New File.gs")
    return (
        <Dialog open={isOpen.value} onOpenChange={(open) => (isOpen.value = open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New File</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        placeholder="File name"
                        value={fileName.value}
                        onInput={(e) => (fileName.value = e.currentTarget.value)}
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            batch(() => {
                                isOpen.value = false
                                files.value = [
                                    ...files.value,
                                    {
                                        path: fileName.value,
                                        text: "",
                                    },
                                ]
                                currentFilePath.value = fileName.value
                            })
                        }}
                    >
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function AppMenubar() {
    const isNewFileDialogOpen = useSignal(false)

    return (
        <>
            <Menubar className="border-none">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={() => (isNewFileDialogOpen.value = true)}>
                            New File
                        </MenubarItem>
                        <MenubarItem
                            onClick={async () => {
                                const file = await requestFileUpload()
                                if (!file) return
                                await addFile(file)
                            }}
                        >
                            Upload File
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Project</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            onClick={() => {
                                saveProject()
                            }}
                        >
                            Download Project
                        </MenubarItem>
                        <MenubarItem
                            onClick={async () => {
                                await uploadProject()
                            }}
                        >
                            Upload Project
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <NewFileDialog isOpen={isNewFileDialogOpen} />
        </>
    )
}
