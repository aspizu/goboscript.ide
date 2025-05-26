import {Button} from "@/components/ui/button"
import {$console, editor, fs, selectedFile, type ConsoleMessage} from "@/lib/state"
import {cn} from "@/lib/utils"
import {AlertTriangleIcon, InfoIcon, ListXIcon, XCircleIcon} from "lucide-react"

function ConsoleMessage({severity, message, path, lineNo}: ConsoleMessage) {
    function activate() {
        if (path in fs.value) {
            selectedFile.value = path
            setTimeout(() => {
                editor.value.focus()
                editor.value.setPosition({lineNumber: lineNo, column: 1})
            }, 0)
        }
    }
    return (
        <div
            className={cn(
                "hover:bg-accent/30 flex items-center gap-1 rounded-lg px-3 py-2 transition-colors duration-200",
                severity === "warn" && "bg-amber-500/10 hover:bg-amber-500/20",
                severity === "error" && "bg-destructive/10 hover:bg-destructive/20",
            )}
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    {severity === "log" && (
                        <InfoIcon className="text-muted-foreground/60 size-3" />
                    )}
                    {severity === "warn" && (
                        <AlertTriangleIcon className="size-3 text-amber-400" />
                    )}
                    {severity === "error" && (
                        <XCircleIcon className="text-destructive size-3" />
                    )}
                    <button
                        className="text-muted-foreground/60 hover:text-muted-foreground cursor-pointer truncate font-mono text-[0.65rem]"
                        onClick={activate}
                    >
                        {path}:{lineNo}
                    </button>
                </div>
                <span
                    className={cn(
                        "mt-0.5 pl-5 font-mono text-xs",
                        severity === "log" && "text-muted-foreground",
                        severity === "warn" && "text-amber-300",
                        severity === "error" && "text-destructive",
                    )}
                >
                    {message}
                </span>
            </div>
        </div>
    )
}

export function AppConsole() {
    return (
        <div className="flex w-[480px] flex-col overflow-y-auto">
            <div className="bg-background/80 border-border/50 sticky top-0 z-10 flex h-10 items-center gap-2 border-b py-1 pl-2 text-xs font-medium backdrop-blur-sm">
                Console
                <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto size-7"
                    onClick={() => ($console.value = [])}
                >
                    <ListXIcon />
                </Button>
            </div>
            <div className="flex flex-col gap-1 pt-2">
                {$console.value.map((message, i) => (
                    <ConsoleMessage key={i} {...message} />
                ))}
            </div>
        </div>
    )
}
