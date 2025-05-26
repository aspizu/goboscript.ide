import {Signal, useSignalEffect} from "@preact/signals-react"
import {useEffect, type RefObject} from "react"

export function useFullscreen(
    state: Signal<boolean>,
    ref: RefObject<HTMLElement | null>,
) {
    useSignalEffect(() => {
        if (state.value) {
            ref.current?.requestFullscreen().catch(() => {})
        } else {
            document.exitFullscreen().catch(() => {})
        }
    })
    useEffect(() => {
        function listener() {
            state.value = document.fullscreenElement === ref.current
        }
        document.addEventListener("fullscreenchange", listener)
        return () => {
            document.removeEventListener("fullscreenchange", listener)
        }
    }, [ref, state])
}
