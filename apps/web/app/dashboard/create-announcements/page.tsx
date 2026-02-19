import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";
import { prisma } from "@workspace/database";
import { AnnouncementManager } from "@/components/announcements/announcement-manager";

const CreateAnnouncementsPage = async () => {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
        redirect("/dashboard");
    }

    const courses = await prisma.course.findMany({
        where: {
            teacherId: user.id,
        },
        select: {
            id: true,
            title: true,
        }
    });

    return (
        <div className="p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight pb-1.5">Announcements</h1>
                <p className="text-muted-foreground pb-1.5">Broadcast updates and news to your students.</p>
            </div>

            <AnnouncementManager courses={courses} />
        </div>
    );
};

export default CreateAnnouncementsPage;