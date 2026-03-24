"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { getDashboardNavItems } from "@/lib/dashboard-nav"
import { useUserStore } from "@/providers/user-store-provider"
import { CommandMenu } from "@workspace/ui/components/ui/command-menu"

export function DashboardCommandMenu() {
    const router = useRouter()
    const pathname = usePathname()
    const role = useUserStore((state) => state.role)
    const [open, setOpen] = React.useState(false)

    const navItems = React.useMemo(
        () => getDashboardNavItems({ role, pathname }),
        [role, pathname]
    )

    const groups = [
        {
            title: "Platform",
            items: navItems.map((item) => ({
                id: item.url,
                title: item.title,
                icon: <item.icon weight="duotone" size={18} />,
                onSelect: () => router.push(item.url),
            })),
        }
    ]

    return (
        <CommandMenu
            groups={groups}
            placeholder="Type a command or search..."
            brandName="LMS Platform"
            triggerClassName="hidden md:flex md:w-56"
            shortcutKey="K"
            open={open}
            onOpenChange={setOpen}
        />
    )
}
