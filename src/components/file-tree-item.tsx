import {cn} from "@/lib/utils"
import {currentFilePath, files, type File} from "@/state"
import {batch, Signal, useSignal} from "@preact/signals-react"
import {AudioLinesIcon, Code2Icon, FileIcon, ImageIcon} from "lucide-react"
import {Button} from "./ui/button"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "./ui/context-menu"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import {Input} from "./ui/input"

function RenameDialog({file, isOpen}: {file: File; isOpen: Signal<boolean>}) {
    const newName = useSignal(file.path)
    return (
        <Dialog
            open={isOpen.value}
            onOpenChange={(open) => {
                isOpen.value = open
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename {file.path}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        id="name"
                        value={newName.value}
                        onChange={(e) => {
                            newName.value = e.currentTarget.value
                        }}
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            isOpen.value = false
                            setTimeout(() => {
                                batch(() => {
                                    files.value = files.value.map((f) =>
                                        f.path === file.path ?
                                            {
                                                ...f,
                                                path: newName.value,
                                            }
                                        :   f,
                                    )
                                    currentFilePath.value = newName.value
                                })
                            }, 100)
                        }}
                    >
                        Rename
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DeleteDialog({file, isOpen}: {file: File; isOpen: Signal<boolean>}) {
    return (
        <Dialog
            open={isOpen.value}
            onOpenChange={(open) => {
                isOpen.value = open
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {file.path}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>Are you sure you want to delete {file.path}?</p>
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            isOpen.value = false
                            setTimeout(() => {
                                batch(() => {
                                    files.value = files.value.filter(
                                        (f) => f.path !== file.path,
                                    )
                                    currentFilePath.value = files.value[0]?.path ?? ""
                                })
                            }, 100)
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function FileTreeItem(props: File) {
    const isRenameDialogOpen = useSignal(false)
    const isDeleteDialogOpen = useSignal(false)
    const extension = props.path.split(".").pop() ?? ""
    let Icon = FileIcon
    if (extension == "gs") {
        Icon = Code2Icon
    } else if (["png", "svg"].includes(extension)) {
        Icon = ImageIcon
    } else if (["mp3", "wav", "flac"].includes(extension)) {
        Icon = AudioLinesIcon
    }
    const element = (
        <button
            className={cn(
                "hover:bg-input/75 active:bg-input/50 flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors",
                props.path === currentFilePath.value && "bg-input/75",
            )}
            onClick={() => {
                currentFilePath.value = props.path
            }}
        >
            <Icon className="text-muted-foreground size-4" />
            <span className="truncate">{props.path}</span>
        </button>
    )
    // stage.gs is a special file that should not be deleted or renamed
    if (props.path == "stage.gs") {
        return element
    }
    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{element}</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem
                        onClick={() => {
                            isRenameDialogOpen.value = true
                        }}
                    >
                        Rename
                    </ContextMenuItem>
                    <ContextMenuItem
                        variant="destructive"
                        onClick={() => {
                            isDeleteDialogOpen.value = true
                        }}
                    >
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <RenameDialog file={props} isOpen={isRenameDialogOpen} />
            <DeleteDialog file={props} isOpen={isDeleteDialogOpen} />
        </>
    )
}
