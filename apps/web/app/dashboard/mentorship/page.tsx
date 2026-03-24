import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { TeacherMentorshipView } from "@/components/mentorship/teacher-mentorship-view"
import { StudentMentorshipView } from "@/components/mentorship/student-mentorship-view"
import { getCurrentUser } from "@/lib/get-current-user"
import { redirect } from "next/navigation"
import { mentorshipKeys } from "@/hooks/queries/use-mentorship"
import { getMentorshipDataForUser } from "@/lib/dashboard-data"

export default async function MentorshipPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth")
    }

    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: mentorshipKeys.data(),
        queryFn: () => getMentorshipDataForUser(user),
    })

    const name = user.name || (user.role === "TEACHER" ? "Teacher" : "Student")

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex w-full min-w-0 flex-col animate-in fade-in-50 duration-500">
                {user.role === "TEACHER" ? (
                    <TeacherMentorshipView userName={name} />
                ) : (
                    <StudentMentorshipView userName={name} />
                )}
            </div>
        </HydrationBoundary>
    )
}
