/**
 * @file app-sidebar.tsx
 * @description Main sidebar component for the dashboard.
 * @module Apps/Web/Components/Sidebar
 * @access Public
 */

"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { getDashboardNavItems } from "@/lib/dashboard-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

function ConnectXMark({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="430 310 345 275"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="
          M 430 505
          Q 430 585 450 585
          L 515 585
          Q 530 585 540 570
          L 615 475
          Q 622 465 632 470
          Q 642 475 645 490
          L 660 560
          Q 665 585 690 585
          L 755 585
          Q 775 585 775 565
          L 775 455
          Q 775 435 755 435
          L 690 435
          Q 665 435 662 410
          L 650 330
          Q 648 310 630 310
          L 585 310
          Q 565 310 552 330
          L 445 480
          Q 430 495 430 505
          Z
        "
        fill="currentColor"
      />
    </svg>
  );
}

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  hasCompletedOnboarding: boolean;
  bio: string | null;
  avatar: string | null;
  phone: string | null;
  expertise: string | null;
  title: string | null;
  studentId: string | null;
  grade: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const pathname = usePathname();
  const navMain = getDashboardNavItems({
    role: user.role as "STUDENT" | "TEACHER" | null,
    pathname,
  });

  const getRoleBadge = () => {
    if (!user.role) return null;

    const roleColors = {
      STUDENT:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      TEACHER:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      ADMIN:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };

    const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();
    const colorClass =
      roleColors[user.role as keyof typeof roleColors] || roleColors.STUDENT;

    return (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-md ${colorClass}`}
      >
        {roleLabel}
      </span>
    );
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <ConnectXMark size={22} className="text-sidebar-foreground shrink-0" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black tracking-tight">ConnectX</span>
                  <div className="flex items-center gap-1">
                    {getRoleBadge()}
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name || "User",
            email: user.email,
            avatar: user.avatar || "/avatars/default.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
