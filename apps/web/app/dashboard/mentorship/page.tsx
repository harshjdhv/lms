/**
 * @file dashboard/mentorship/page.tsx
 * @description Mentorship page - shows mentee section for teachers, mentor section for students
 * @module Apps/Web/Dashboard/Mentorship
 */

import { redirect } from "next/navigation";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { mentorshipKeys } from "@/hooks/queries/use-mentorship";
import { TeacherMentorshipView } from "@/components/mentorship/teacher-mentorship-view";
import { StudentMentorshipView } from "@/components/mentorship/student-mentorship-view";

export default async function MentorshipPage() {
    const authUser = await getCurrentUser();

    if (!authUser) {
        redirect("/auth");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: authUser.id },
    });

    if (!dbUser) {
        redirect("/auth");
    }

    if (!dbUser.hasCompletedOnboarding) {
        redirect("/onboarding");
    }

    const queryClient = new QueryClient();

    // Prefetch mentorship data
    await queryClient.prefetchQuery({
        queryKey: mentorshipKeys.data(),
        queryFn: async () => {
            const serialize = (data: any) => JSON.parse(JSON.stringify(data));

            if (dbUser.role === "TEACHER") {
                const mentees = await prisma.mentorship.findMany({
                    where: { mentorId: dbUser.id },
                    include: {
                        mentee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                studentId: true,
                                grade: true,
                                semester: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                });

                const requirements = await prisma.documentRequirement.findMany({
                    where: { mentorId: dbUser.id },
                    include: {
                        _count: { select: { submissions: true } },
                    },
                    orderBy: { createdAt: "desc" },
                });

                const submissions = await prisma.documentSubmission.findMany({
                    where: {
                        requirement: { mentorId: dbUser.id },
                    },
                    include: {
                        requirement: {
                            select: { id: true, title: true, category: true },
                        },
                        student: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                    orderBy: { submittedAt: "desc" },
                });

                const activeMentees = mentees.filter((m) => m.status === "ACTIVE").length;
                const pendingDocuments = submissions.filter((s) => s.status === "PENDING").length;
                const completedDocuments = submissions.filter((s) => s.status === "APPROVED").length;

                return serialize({
                    mentor: null,
                    mentees,
                    requirements,
                    submissions,
                    stats: {
                        totalMentees: mentees.length,
                        activeMentees,
                        pendingDocuments,
                        completedDocuments,
                    },
                });
            } else {
                const mentorship = await prisma.mentorship.findFirst({
                    where: { menteeId: dbUser.id, status: "ACTIVE" },
                    include: {
                        mentor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                expertise: true,
                                title: true,
                            },
                        },
                    },
                });

                const requirements = mentorship
                    ? await prisma.documentRequirement.findMany({
                        where: { mentorId: mentorship.mentorId },
                        orderBy: [{ isRequired: "desc" }, { dueDate: "asc" }],
                    })
                    : [];

                const submissions = await prisma.documentSubmission.findMany({
                    where: { studentId: dbUser.id },
                    include: {
                        requirement: {
                            select: { id: true, title: true, category: true, dueDate: true },
                        },
                    },
                    orderBy: { submittedAt: "desc" },
                });

                const pendingDocuments = submissions.filter((s) => s.status === "PENDING").length;
                const completedDocuments = submissions.filter((s) => s.status === "APPROVED").length;

                return serialize({
                    mentor: mentorship?.mentor || null,
                    mentees: [],
                    requirements,
                    submissions,
                    stats: {
                        totalMentees: 0,
                        activeMentees: 0,
                        pendingDocuments,
                        completedDocuments,
                    },
                });
            }
        },
    });

    const isTeacher = dbUser.role === "TEACHER";

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex flex-1 flex-col gap-6 p-4 pt-4 overflow-y-auto w-full animate-in fade-in-50 duration-500">
                {isTeacher ? (
                    <TeacherMentorshipView userName={dbUser.name || "Teacher"} />
                ) : (
                    <StudentMentorshipView userName={dbUser.name || "Student"} />
                )}
            </div>
        </HydrationBoundary>
    );
}
