/**
 * @file app-sidebar.tsx
 * @description Main sidebar component for the dashboard.
 * @module Apps/Web/Components/Sidebar
 * @access Public
 */

"use client"

import * as React from "react"
import {
  BookOpen,
  Calendar,
  Command,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Send,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"

import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

type User = {
  id: string
  email: string
  name: string | null
  role: string | null
  hasCompletedOnboarding: boolean
  bio: string | null
  avatar: string | null
  phone: string | null
  expertise: string | null
  title: string | null
  studentId: string | null
  grade: string | null
  createdAt: Date
  updatedAt: Date
}

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    items: [
      {
        title: "My Courses",
        url: "/courses/my",
      },
      {
        title: "Catalog",
        url: "/courses/catalog",
      },
    ],
  },
  {
    title: "Assignments",
    url: "/assignments",
    icon: FileText,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "Grades",
    url: "/grades",
    icon: GraduationCap,
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
  },
]

const navSecondary = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "#",
    icon: Send,
  },
]

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const getRoleBadge = () => {
    if (!user.role) return null

    const roleColors = {
      STUDENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      TEACHER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    }

    const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase()
    const colorClass = roleColors[user.role as keyof typeof roleColors] || roleColors.STUDENT

    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${colorClass}`}>
        {roleLabel}
      </span>
    )
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ConnectX</span>
                  <div className="flex items-center gap-1">
                    {getRoleBadge()}
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user.name || 'User',
          email: user.email,
          avatar: user.avatar || '/avatars/default.jpg'
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
