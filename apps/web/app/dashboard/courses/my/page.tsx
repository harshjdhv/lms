import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";
import { redirect } from "next/navigation";
import { MyCoursesView } from "@/components/courses/my-courses-view";
// Unused imports removed

export default async function MyCoursesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!dbUser) {
        return <div>User not found</div>;
    }

    const isTeacher = dbUser.role === "TEACHER";

    // Client-side fetching for instant navigation

    return <MyCoursesView isTeacher={isTeacher} />;
}
