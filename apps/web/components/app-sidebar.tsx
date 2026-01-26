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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
  ],
  navSecondary: [
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
