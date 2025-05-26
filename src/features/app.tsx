import {SidebarProvider} from "@/components/ui/sidebar"
import {AppEditor} from "@/features/app-editor"
import {AppHeader} from "@/features/app-header"
import {AppPlayer, isAppPlayerVisible} from "@/features/app-player"
import {AppSidebar} from "@/features/app-sidebar"
import {cn} from "@/lib/utils"

export function App() {
    return (
        <SidebarProvider className="h-[100dvh]">
            <AppSidebar />
            <div className="flex grow flex-col overflow-hidden">
                <AppHeader />
                <div
                    className={cn(
                        "grid grow overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out",
                        isAppPlayerVisible.value ?
                            "grid-cols-[auto_calc(480px+var(--spacing)*2)]"
                        :   "grid-cols-[auto_0px]",
                    )}
                >
                    <div className="flex grow flex-col overflow-hidden">
                        <AppEditor />
                    </div>
                    <AppPlayer />
                </div>
            </div>
        </SidebarProvider>
    )
}
