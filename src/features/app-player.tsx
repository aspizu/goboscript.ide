import {useFullscreen} from "@/hooks/use-fullscreen"
import {playerFullscreen, Project} from "@/state"
import {useEffect, useRef} from "react"

export function AppPlayer() {
    const ref = useRef<HTMLDivElement>(null)
    useFullscreen(playerFullscreen, ref)
    useEffect(() => {
        if (!ref.current) return
        Project.scaffolding.appendTo(ref.current)
    }, [])
    return (
        <div
            className="h-[360px] w-[480px] shrink-0 overflow-hidden rounded-md"
            ref={ref}
        />
    )
}
