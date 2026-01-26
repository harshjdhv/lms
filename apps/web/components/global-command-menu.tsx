"use client"

import { CommandMenu } from "@workspace/ui/components/ui/command-menu"
import { FileText, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function GlobalCommandMenu() {
    const router = useRouter()

    const groups = [
        {
            title: "Pages",
            items: [
                {
                    id: "home",
                    title: "Home",
                    icon: <FileText className="h-4 w-4" />,
                    onSelect: () => router.push("/")
                },
                {
                    id: "about",
                    title: "About",
                    icon: <FileText className="h-4 w-4" />,
                    onSelect: () => router.push("/about")
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
                    onSelect: () => router.push("/profile")
                },
                {
                    id: "settings",
                    title: "Settings",
                    icon: <Settings className="h-4 w-4" />,
                    onSelect: () => router.push("/settings")
                },
            ],
        },
    ]

    return (
        <div className="fixed top-4 right-4 z-50">
            <CommandMenu
                groups={groups}
                placeholder="Search..."
                brandName="My App"
            />
        </div>
    )
}
