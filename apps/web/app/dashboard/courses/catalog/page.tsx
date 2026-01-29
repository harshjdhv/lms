import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";
import { redirect } from "next/navigation";
import { CatalogView } from "@/components/courses/catalog-view";
// Remove unused imports

export default async function CourseCatalogPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { enrollments: { select: { courseId: true } } },
    });

    if (!dbUser) redirect("/auth/login");

    // We fetch courses on the client now to avoid blocking navigation
    // const courses = ... (removed)

    return <CatalogView />;
}
