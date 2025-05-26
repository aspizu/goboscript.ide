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
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar"
import {useShortcuts} from "@/hooks/use-shortcuts"
import {decode} from "@/lib/base64"
import {build, FS} from "@/lib/state"
import {openFilePicker} from "@/lib/utils"
import {type Signal, useSignal} from "@preact/signals-react"
import {saveAs} from "file-saver"

function NewFileDialog({isOpen}: {isOpen: Signal<boolean>}) {
    const path = useSignal("new_file.gs")
    return (
        <Dialog open={isOpen.value} onOpenChange={(open) => (isOpen.value = open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new file</DialogTitle>
                </DialogHeader>
                <Input
                    value={path.value}
                    onChange={(e) => (path.value = e.target.value)}
                />
                <DialogFooter>
                    <Button
                        disabled={!path.value.trim()}
                        onClick={async () => {
                            await FS.addFile(path.value, "")
                            isOpen.value = false
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
    async function uploadFile() {
        const files = await openFilePicker({multiple: true})
        if (!files) return
        await Promise.all(files.map((file) => FS.addFile(file.name, file)))
    }
    useShortcuts({
        "alt+n": () => (isNewFileDialogOpen.value = true),
        "alt+o": uploadFile,
    })
    return (
        <>
            <Menubar className="m-0 h-auto border-none p-0">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={() => (isNewFileDialogOpen.value = true)}>
                            New File <MenubarShortcut>⌘N</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={uploadFile}>
                            Upload File <MenubarShortcut>⌘O</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Project</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>Upload Project</MenubarItem>
                        <MenubarItem
                            onClick={() => {
                                if (!build.value) return
                                const data = decode(build.value.file as any)
                                saveAs(data, "project.sb3")
                            }}
                        >
                            Download Project
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Help</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem asChild>
                            <a
                                href="https://github.com/aspizu/goboscript.ide"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub
                            </a>
                        </MenubarItem>
                        <MenubarItem asChild>
                            <a
                                href="https://aspizu.github.io/goboscript/language/syntax"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Documentation
                            </a>
                        </MenubarItem>
                        <MenubarItem asChild>
                            <a
                                href="https://discord.gg/W9ZWy6ZMA3"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Discord
                            </a>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <NewFileDialog isOpen={isNewFileDialogOpen} />
        </>
    )
}
