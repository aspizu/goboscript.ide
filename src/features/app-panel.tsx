import {AppConsole} from "@/features/app-console"
import {AppPlayer} from "@/features/app-player"

export function AppPanel() {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 flex flex-col gap-2 pr-2 pb-2">
                <AppPlayer />
                <AppConsole />
            </div>
        </div>
    )
}
