import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { MyCoursesView } from "@/components/courses/my-courses-view"
import { getCurrentUser } from "@/lib/get-current-user"
import { redirect } from "next/navigation"
import { courseKeys } from "@/hooks/queries/use-courses"
import { getMyCoursesForUser } from "@/lib/dashboard-data"

export default async function MyCoursesPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth")
    }

    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: courseKeys.my(),
        queryFn: () => getMyCoursesForUser(user),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MyCoursesView isTeacher={user.role === "TEACHER"} />
        </HydrationBoundary>
    )
}
