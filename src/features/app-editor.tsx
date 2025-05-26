import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {theme} from "@/lib/monaco-theme"
import {editor, fs, monaco, selectedFile} from "@/lib/state"
import * as syntax from "@/lib/syntax"
import {cn} from "@/lib/utils"
import {Editor} from "@monaco-editor/react"
import {Fragment} from "react/jsx-runtime"

function FileBreadcrumb() {
    if (!selectedFile.value) return null

    const pathParts = selectedFile.value.split("/")
    const fileName = pathParts[pathParts.length - 1]
    const folderPath = pathParts.slice(0, -1)

    const folderBreadcrumbs = folderPath.map((folder, index) => (
        <Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbLink href="#" className="pointer-events-none">
                    {folder}
                </BreadcrumbLink>
            </BreadcrumbItem>
        </Fragment>
    ))

    const fileBreadcrumb =
        fileName ?
            <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{fileName}</BreadcrumbPage>
                </BreadcrumbItem>
            </>
        :   null

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="pointer-events-none">
                        Project
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {folderBreadcrumbs}
                {fileBreadcrumb}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export function AppEditor() {
    const file = selectedFile.value && fs.value[selectedFile.value]
    const isText = typeof file === "string"

    const editorOptions = {
        fontFamily: "Cascadia Code",
        fontLigatures: true,
        minimap: {enabled: false},
        cursorBlinking: "smooth" as const,
        renderFinalNewline: "off" as const,
    }

    function handleMount($editor: any, $monaco: any) {
        editor.value = $editor
        monaco.value = $monaco
        $monaco.editor.defineTheme("vs-dark", theme)
        syntax.register($monaco)
    }

    return (
        <div className="flex h-full grow flex-col gap-2 p-2 pt-0">
            <Editor
                className={cn("overflow-hidden rounded-md border", !isText && "hidden")}
                options={editorOptions}
                path={isText ? `urn:${selectedFile.value}` : undefined}
                defaultValue={isText ? file : undefined}
                theme="vs-dark"
                onMount={handleMount}
            />
        </div>
    )
}
