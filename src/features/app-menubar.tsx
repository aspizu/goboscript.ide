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
import {currentFilePath, files, type File as IFile} from "@/state"
import {batch, Signal, useSignal} from "@preact/signals-react"
import {saveAs} from "file-saver"
import {project} from "./app"

function requestFileUpload(): Promise<File | undefined> {
    return new Promise((resolve) => {
        const element = document.createElement("input")
        element.type = "file"
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
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <NewFileDialog isOpen={isNewFileDialogOpen} />
        </>
    )
}
