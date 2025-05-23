import {Button} from "@/components/ui/button"
import {SidebarTrigger} from "@/components/ui/sidebar"
import {Spinner} from "@/components/ui/spinner"
import {AppMenubar} from "@/features/app-menubar"
import {isAppPlayerVisible, scaffolding} from "@/features/app-player"
import {Compiler, FS} from "@/lib/state"
import {useSignal} from "@preact/signals-react"
import {PanelRightCloseIcon, PanelRightOpenIcon, PlayIcon} from "lucide-react"

export function AppHeader() {
    const isProjectLoading = useSignal(false)
    async function runProject() {
        FS.pullModelState()
        await Compiler.compile()
        Compiler.updateDiagnostics()
        await Compiler.loadProject()
        scaffolding.greenFlag()
    }
    return (
        <div className="flex gap-2 p-2">
            <SidebarTrigger />
            <AppMenubar />
            <div className="grow" />
            <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => {
                    isAppPlayerVisible.value = !isAppPlayerVisible.value
                }}
            >
                {isAppPlayerVisible.value ?
                    <PanelRightCloseIcon />
                :   <PanelRightOpenIcon />}
            </Button>
            <Button
                size="icon"
                className="size-7"
                disabled={isProjectLoading.value}
                onClick={async () => {
                    isProjectLoading.value = true
                    await runProject()
                    await new Promise((resolve) => setTimeout(resolve, 500))
                    isProjectLoading.value = false
                }}
            >
                {isProjectLoading.value ?
                    <Spinner className="text-black" size="small" />
                :   <PlayIcon />}
            </Button>
        </div>
    )
}
