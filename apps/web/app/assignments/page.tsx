/**
 * @file assignments/page.tsx
 * @description Assignments page with sidebar layout.
 * @module Apps/Web/Assignments
 * @access Private
 */

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@workspace/database"
import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { StudentAssignmentsView } from "@/components/assignments/student-assignments-view"
import { Separator } from "@workspace/ui/components/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

export default async function AssignmentsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth")
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
    })

    // Redirect to onboarding if not completed
    if (!dbUser || !dbUser.hasCompletedOnboarding) {
        redirect("/onboarding")
    }

    return (
        <SidebarProvider>
            <AppSidebar user={dbUser} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Assignments</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <StudentAssignmentsView />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
