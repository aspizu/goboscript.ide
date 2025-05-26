import {Button} from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {editor, FS, fs, selectedFile} from "@/lib/state"
import {cn} from "@/lib/utils"
import {type Signal, useSignal} from "@preact/signals-react"
import {DialogTitle} from "@radix-ui/react-dialog"
import {
    BoxIcon,
    BracesIcon,
    CogIcon,
    FileIcon,
    FolderIcon,
    PenToolIcon,
} from "lucide-react"

type FTreeSegment =
    | {kind: "file"; path: string}
    | {kind: "folder"; path: string; children: FTreeSegment[]}

function fileTree(paths: string[]): FTreeSegment[] {
    const tree: FTreeSegment[] = []
    const sortedPaths = [...paths].sort()

    for (const path of sortedPaths) {
        const parts = path.split("/")
        let currentLevel = tree
        let currentPath = ""

        for (let i = 0; i < parts.length - 1; i++) {
            const folderName = parts[i]
            currentPath = currentPath ? `${currentPath}/${folderName}` : folderName
            const folderMap = new Map<string, FTreeSegment>()

            for (const item of currentLevel) {
                if (item.kind === "folder") folderMap.set(item.path, item)
            }

            let folder = folderMap.get(currentPath)
            if (!folder) {
                folder = {kind: "folder", path: currentPath, children: []}
                currentLevel.push(folder)
            }
            currentLevel = (folder as FTreeSegment & {kind: "folder"}).children
        }

        currentLevel.push({kind: "file", path: path})
    }
    return tree
}

function RenameFileEntryDialog({
    isOpen,
    path,
}: {
    isOpen: Signal<boolean>
    path: string
}) {
    const newPath = useSignal(path)

    function handleRename() {
        FS.renameFile(path, newPath.value)
        isOpen.value = false
    }

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
                    <Button onClick={handleRename}>Rename</Button>
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
    function handleDelete() {
        isOpen.value = false
        setTimeout(() => FS.removeFile(path), 10)
    }
    return (
        <Dialog open={isOpen.value} onOpenChange={(open) => (isOpen.value = open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {path}</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function TreeEntry({segment}: {segment: FTreeSegment}) {
    if (segment.kind === "file") {
        return <FileEntry segment={segment} />
    }

    const folderName = segment.path.split("/").pop() || segment.path

    return (
        <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <FolderIcon className="text-muted-foreground" />
                        {folderName}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {segment.children.map((child) => (
                            <SidebarMenuSubItem key={child.path}>
                                <TreeEntry segment={child} />
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

function FileEntry({segment}: {segment: FTreeSegment}) {
    const isRenameDialogOpen = useSignal(false)
    const isDeleteDialogOpen = useSignal(false)
    const fileName = segment.path.split("/").pop() || segment.path
    const isStage = segment.kind == "file" && fileName == "stage.gs"
    const isSprite =
        segment.kind == "file" && !isStage && /^[^/]+\.gs$/.test(segment.path)
    const isHeader =
        segment.kind == "file" && !isSprite && !isStage && fileName.endsWith(".gs")
    const isSvg = segment.kind == "file" && fileName.endsWith(".svg")
    const isConfig = segment.kind == "file" && fileName == "goboscript.toml"

    let Icon = FileIcon
    if (isStage || isSprite) Icon = BoxIcon
    else if (isHeader) Icon = BracesIcon
    else if (isSvg) Icon = PenToolIcon
    else if (isConfig) Icon = CogIcon

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <SidebarMenuButton
                    isActive={segment.path === selectedFile.value}
                    onClick={() => {
                        selectedFile.value = segment.path
                        setTimeout(() => editor.value?.focus(), 0)
                    }}
                >
                    <Icon
                        className={cn(
                            "text-muted-foreground",
                            isStage && "text-green-200",
                            isSprite && "text-blue-200",
                            isSvg && "text-amber-200",
                            isConfig && "text-orange-200",
                            isHeader && "text-purple-200",
                        )}
                    />
                    {fileName}
                </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => (isRenameDialogOpen.value = true)}>
                    Rename
                </ContextMenuItem>
                <ContextMenuItem
                    variant="destructive"
                    onClick={() => (isDeleteDialogOpen.value = true)}
                >
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
            <RenameFileEntryDialog isOpen={isRenameDialogOpen} path={segment.path} />
            <DeleteFileEntryDialog isOpen={isDeleteDialogOpen} path={segment.path} />
        </ContextMenu>
    )
}

export function AppSidebar() {
    const tree = fileTree(Object.keys(fs.value))
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Files</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {tree.map((segment) => (
                                <TreeEntry key={segment.path} segment={segment} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
