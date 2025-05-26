import {useEffect} from "react"

export function useShortcuts(shortcuts: Record<string, () => void>) {
    useEffect(() => {
        function listener(event: KeyboardEvent) {
            for (const [key, action] of Object.entries(shortcuts)) {
                if (
                    key
                        .split(/\s*\+\s*/)
                        .every(
                            (key) =>
                                (key === "ctrl" && event.ctrlKey) ||
                                (key === "win" && event.metaKey) ||
                                (key === "alt" && event.altKey) ||
                                (key === "shift" && event.shiftKey) ||
                                key === event.key.toLowerCase(),
                        )
                ) {
                    event.preventDefault()
                    event.stopPropagation()
                    event.stopImmediatePropagation()
                    action()
                }
            }
        }
        window.addEventListener("keydown", listener)
        return () => {
            window.removeEventListener("keydown", listener)
        }
    })
}
