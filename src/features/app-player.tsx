import {AppConsole} from "@/features/app-console"
import * as $debugger from "@/lib/debugger"
import {signal} from "@preact/signals-react"
import {Scaffolding} from "@turbowarp/scaffolding"
import {useEffect, useRef} from "react"

export const isAppPlayerVisible = signal(true)

export const scaffolding = new Scaffolding()
scaffolding.width = 480
scaffolding.height = 360
scaffolding.resizeMode = "preserve-ratio"
scaffolding.editableLists = false
scaffolding.shouldConnectPeripherals = true
scaffolding.usePackagedRuntime = false
scaffolding.setup()
$debugger.init(scaffolding.vm)

export function AppPlayer() {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!ref.current) return
        scaffolding.appendTo(ref.current)
    }, [])
    return (
        <div className="flex flex-col pr-2 pb-2">
            <div
                ref={ref}
                className="h-[360px] w-[480px] shrink-0 overflow-hidden rounded-md"
            />
            <AppConsole />
        </div>
    )
}
