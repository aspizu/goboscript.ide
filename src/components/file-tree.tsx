import {files} from "@/state"
import {FileTreeItem} from "./file-tree-item"

export function FileTree() {
    return (
        <div className="flex h-full w-[200px] shrink-0 flex-col gap-0.5 overflow-y-scroll p-1">
            {files.value
                .sort((a, b) => a.path.localeCompare(b.path))
                .map((file) => (
                    <FileTreeItem key={file.path} {...file} />
                ))}
        </div>
    )
}
