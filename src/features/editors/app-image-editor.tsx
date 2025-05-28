import {Badge} from "@/components/ui/badge"
import {cn} from "@/lib/utils"
import {Editor, FS} from "@/state"
import {useSignal} from "@preact/signals-react"
import * as pathlib from "path"
import {useEffect, useLayoutEffect, useRef} from "react"

const EDITABLE: (string | undefined)[] = [".png", ".jpg", ".jpeg", ".bmp"]

export function AppImageEditor() {
    const path = Editor.getOpenFile()
    const file = FS.getDefaultFile(path)
    const isEditable =
        path && typeof file != "string" && EDITABLE.includes(pathlib.extname(path))
    const ref = useRef<HTMLImageElement>(null)
    const objectURL = useSignal<string>()
    const dimensions = useSignal<{x: number; y: number}>()
    useEffect(() => {
        objectURL.value = file && isEditable ? URL.createObjectURL(file) : undefined
        return () => {
            if (objectURL.value) URL.revokeObjectURL(objectURL.value)
        }
    }, [file, isEditable, objectURL])
    useLayoutEffect(() => {
        if (!ref.current) return
        const el = ref.current
        el.onload = () => (dimensions.value = {x: el.naturalWidth, y: el.naturalHeight})
        return () => {
            el.onload = null
        }
    }, [objectURL.value, dimensions])
    return (
        <div
            className={cn(
                "relative flex grow flex-col overflow-hidden p-4",
                !isEditable && "hidden"
            )}
        >
            {dimensions.value && (
                <Badge className="absolute right-0 bottom-0 z-1 opacity-50">
                    {dimensions.value.x}x{dimensions.value.y}
                </Badge>
            )}
            {objectURL.value && (
                <img
                    ref={ref}
                    className={cn(
                        "pixelated h-full w-full object-contain drop-shadow-lg"
                    )}
                    src={objectURL.value}
                />
            )}
        </div>
    )
}
