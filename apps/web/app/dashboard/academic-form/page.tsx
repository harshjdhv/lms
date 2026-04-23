import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/get-current-user"
import { AcademicFormsPage } from "@/components/mentorship/academic-forms-page"

export default async function DashboardAcademicFormPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  if (user.role !== "STUDENT" && user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  return <AcademicFormsPage role={user.role} userName={user.name || (user.role === "TEACHER" ? "Teacher" : "Student")} />
}
