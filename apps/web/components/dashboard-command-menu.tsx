"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    BookOpen,
    Calendar,
    FileText,
    GraduationCap,
    LayoutDashboard,
    LifeBuoy,
    Send,
    Settings,
    User,
    Users,
} from "lucide-react"

import { CommandMenu } from "@workspace/ui/components/ui/command-menu"

export function DashboardCommandMenu() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)

    const groups = [
        {
            title: "Pages",
            items: [
                {
                    id: "dashboard",
                    title: "Dashboard",
                    icon: <LayoutDashboard className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard"),
                },
                {
                    id: "courses",
                    title: "Courses",
                    icon: <BookOpen className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard/courses/my"),
                },
                {
                    id: "assignments",
                    title: "Assignments",
                    icon: <FileText className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard/assignments"),
                },
                {
                    id: "schedule",
                    title: "Schedule",
                    icon: <Calendar className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard/schedule"),
                },
                {
                    id: "grades",
                    title: "Grades",
                    icon: <GraduationCap className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard/grades"),
                },
                {
                    id: "community",
                    title: "Community",
                    icon: <Users className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard/community"),
                },
            ],
        },
        {
            title: "Settings",
            items: [
                {
                    id: "profile",
                    title: "Profile",
                    icon: <User className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard/profile"),
                },
                {
                    id: "settings",
                    title: "Settings",
                    icon: <Settings className="h-4 w-4" />,
                    onSelect: () => router.push("/dashboard/settings"),
                },
            ],
        },
        {
            title: "Help",
            items: [
                {
                    id: "support",
                    title: "Support",
                    icon: <LifeBuoy className="h-4 w-4" />,
                    onSelect: () => router.push("/support"),
                },
                {
                    id: "feedback",
                    title: "Feedback",
                    icon: <Send className="h-4 w-4" />,
                    onSelect: () => router.push("/feedback"),
                },
            ],
        },
    ]

    return (
        <CommandMenu
            groups={groups}
            placeholder="Type a command or search..."
            brandName="LMS Platform"
            triggerClassName="hidden md:flex w-56"
            shortcutKey="K"
            open={open}
            onOpenChange={setOpen}
        />
    )
}
