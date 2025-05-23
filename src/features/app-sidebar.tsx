import {Button} from "@/components/ui/button"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {Dialog, DialogContent, DialogFooter, DialogHeader} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {editor, FS, fs, selectedFile} from "@/lib/state"
import {cn} from "@/lib/utils"
import {type Signal, useSignal} from "@preact/signals-react"
import {DialogTitle} from "@radix-ui/react-dialog"
import {BoxIcon, FileIcon, PenToolIcon} from "lucide-react"

function RenameFileEntryDialog({
    isOpen,
    path,
}: {
    isOpen: Signal<boolean>
    path: string
}) {
    const newPath = useSignal(path)
    return (
        <Dialog open={isOpen.value} onOpenChange={(open) => (isOpen.value = open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename {path}</DialogTitle>
                </DialogHeader>
                <Input
                    value={newPath.value}
                    onChange={(e) => (newPath.value = e.target.value)}
                />
                <DialogFooter>
                    <Button
                        onClick={() => {
                            FS.renameFile(path, newPath.value)
                            isOpen.value = false
                        }}
                    >
                        Rename
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DeleteFileEntryDialog({
    isOpen,
    path,
}: {
    isOpen: Signal<boolean>
    path: string
}) {
    return (
        <Dialog open={isOpen.value} onOpenChange={(open) => (isOpen.value = open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {path}</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            isOpen.value = false
                            setTimeout(() => {
                                FS.removeFile(path)
                            }, 10)
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function FileEntry({path}: {path: string}) {
    const isRenameDialogOpen = useSignal(false)
    const isDeleteDialogOpen = useSignal(false)
    const isStage = path === "stage.gs"
    const isSprite = !isStage && /^[^/]+\.gs$/.test(path)
    const isSvg = path.endsWith(".svg")
    let Icon = FileIcon
    if (isStage || isSprite) Icon = BoxIcon
    else if (isSvg) Icon = PenToolIcon
    return (
        <>
            <SidebarMenuItem>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <SidebarMenuButton
                            isActive={path === selectedFile.value}
                            onClick={() => {
                                selectedFile.value = path
                                setTimeout(() => editor.value?.focus(), 0)
                            }}
                        >
                            <Icon
                                className={cn(
                                    isStage && "text-green-200",
                                    isSprite && "text-blue-200",
                                    isSvg && "text-amber-200",
                                )}
                            />
                            {path}
                        </SidebarMenuButton>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem
                            onClick={() => (isRenameDialogOpen.value = true)}
                        >
                            Rename
                        </ContextMenuItem>
                        <ContextMenuItem
                            variant="destructive"
                            onClick={() => (isDeleteDialogOpen.value = true)}
                        >
                            Delete
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </SidebarMenuItem>
            <RenameFileEntryDialog isOpen={isRenameDialogOpen} path={path} />
            <DeleteFileEntryDialog isOpen={isDeleteDialogOpen} path={path} />
        </>
    )
}

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Files</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {Object.entries(fs.value).map(([path]) => (
                                <FileEntry key={path} path={path} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
