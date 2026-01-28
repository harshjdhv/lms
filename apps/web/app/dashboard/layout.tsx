
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { UserStoreProvider } from "@/providers/user-store-provider"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { getCurrentUser } from "@/lib/get-current-user"
import { DashboardCommandMenu } from "@/components/dashboard-command-menu"


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const dbUser = await getCurrentUser()

    if (!dbUser) {
        redirect("/auth")
    }

    if (!dbUser.hasCompletedOnboarding) {
        redirect("/onboarding")
    }

    // Map to store state
    const userState = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as "STUDENT" | "TEACHER",
        image: dbUser.avatar,
    }

    return (
        <UserStoreProvider user={userState}>
            <SidebarProvider>
                <AppSidebar user={dbUser} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background z-10">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <DashboardCommandMenu />
                        </div>
                    </header>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </UserStoreProvider>
    )
}
