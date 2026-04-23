import {
  BookOpen,
  ClipboardText,
  ChatCircleDots,
  HandHeart,
  Megaphone,
  SquaresFour,
  UserGear,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"

export type DashboardRole = "STUDENT" | "TEACHER" | null | undefined

type DashboardNavIconKey =
  | "dashboard"
  | "courses"
  | "assignments"
  | "academic"
  | "community"
  | "announcements"
  | "mentorship"
  | "account"

type DashboardNavConfigItem = {
  title: string
  url: string
  icon: DashboardNavIconKey
  match: "exact" | "prefix"
  roles?: Array<Exclude<DashboardRole, null | undefined>>
  titleByRole?: Partial<Record<Exclude<DashboardRole, null | undefined>, string>>
}

export type DashboardNavItem = {
  title: string
  url: string
  icon: PhosphorIcon
  isActive: boolean
}

const dashboardNavIcons: Record<DashboardNavIconKey, PhosphorIcon> = {
  dashboard: SquaresFour,
  courses: BookOpen,
  assignments: ClipboardText,
  academic: ClipboardText,
  community: ChatCircleDots,
  announcements: Megaphone,
  mentorship: HandHeart,
  account: UserGear,
}

export const dashboardNavConfig: DashboardNavConfigItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: "dashboard", match: "exact" },
  { title: "My Courses", url: "/dashboard/courses/my", icon: "courses", match: "exact" },
  { title: "Assignments", url: "/dashboard/assignments", icon: "assignments", match: "prefix" },
  {
    title: "Academic Form",
    url: "/dashboard/academic-form",
    icon: "academic",
    match: "prefix",
    titleByRole: { TEACHER: "Mentee Forms" },
  },
  { title: "Community", url: "/dashboard/community", icon: "community", match: "prefix" },
  {
    title: "Announcements",
    url: "/dashboard/announcements",
    icon: "announcements",
    match: "prefix",
    roles: ["STUDENT"],
  },
  {
    title: "My Mentor",
    url: "/dashboard/mentorship",
    icon: "mentorship",
    match: "prefix",
    titleByRole: { TEACHER: "Mentees" },
  },
  { title: "Account", url: "/dashboard/account", icon: "account", match: "prefix" },
  {
    title: "Create Assignments",
    url: "/dashboard/create-assignments",
    icon: "assignments",
    match: "prefix",
    roles: ["TEACHER"],
  },
  {
    title: "Create Announcements",
    url: "/dashboard/create-announcements",
    icon: "announcements",
    match: "prefix",
    roles: ["TEACHER"],
  },
]

export function getDashboardNavItems({
  role,
  pathname,
}: {
  role: DashboardRole
  pathname: string
}): DashboardNavItem[] {
  return dashboardNavConfig
    .filter((item) => !item.roles || (role != null && item.roles.includes(role)))
    .map((item) => ({
      title: role && item.titleByRole?.[role] ? item.titleByRole[role]! : item.title,
      url: item.url,
      icon: dashboardNavIcons[item.icon],
      isActive: item.match === "exact" ? pathname === item.url : pathname.startsWith(item.url),
    }))
}
