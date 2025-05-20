import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react"

// @ts-expect-error <https://github.com/TurboWarp/scaffolding/issues/4>
import * as Scaffolding from "@turbowarp/scaffolding"

interface Scaffolding {
    width: number
    height: number
    resizeMode: "preserve-ratio" | "dynamic-resize" | "stretch"
    editableLists: boolean
    shouldConnectPeripherals: boolean
    usePackagedRuntime: boolean
    setup: () => void
    appendTo: (element: HTMLElement) => void
    loadProject: (project: ArrayBuffer) => Promise<void>
    greenFlag: () => void
    stopAll: () => void
}

interface ProjectPlayerProps {
    project: ArrayBuffer | null
}

export function ProjectPlayer(props: ProjectPlayerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [scaffolding, setScaffolding] = useState<Scaffolding | null>(null)

    async function loadScaffolding() {
        if (!ref.current) return
        const newScaffolding = new Scaffolding.Scaffolding() as Scaffolding
        newScaffolding.width = 480
        newScaffolding.height = 360
        newScaffolding.resizeMode = "preserve-ratio"
        newScaffolding.editableLists = false
        newScaffolding.shouldConnectPeripherals = false
        newScaffolding.usePackagedRuntime = false
        newScaffolding.setup()
        newScaffolding.appendTo(ref.current)
        setScaffolding(newScaffolding)
    }

    useLayoutEffect(() => {
        loadScaffolding()
    }, [])

    const loadProject = useCallback(async () => {
        if (!scaffolding || props.project === null) return
        console.log(`Loading project (${props.project.byteLength} bytes)`)
        await scaffolding.loadProject(props.project)
        console.log("Project loaded")
        scaffolding.greenFlag()
        return () => {
            scaffolding.stopAll()
        }
    }, [props.project, scaffolding])

    useEffect(() => {
        loadProject()
    }, [loadProject])

    return <div ref={ref} className="h-[360px] w-[480px] overflow-hidden rounded-md" />
}
