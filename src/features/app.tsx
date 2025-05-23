import {SidebarProvider} from "@/components/ui/sidebar"
import {AppEditor} from "@/features/app-editor"
import {AppHeader} from "@/features/app-header"
import {AppPlayer} from "@/features/app-player"
import {AppSidebar} from "@/features/app-sidebar"

export function App() {
    return (
        <SidebarProvider className="h-[100dvh]">
            <AppSidebar />
            <div className="flex grow flex-col overflow-hidden">
                <AppHeader />
                <div className="flex grow overflow-hidden">
                    <div className="flex grow flex-col overflow-hidden">
                        <AppEditor />
                    </div>
                    <AppPlayer />
                </div>
            </div>
        </SidebarProvider>
    )
}
