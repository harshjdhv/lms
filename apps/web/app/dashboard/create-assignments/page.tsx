import { getCurrentUser } from "@/lib/get-current-user"
import { redirect } from "next/navigation";
import AssignmentManager from "@/components/assignments/assignment-manager";
import { prisma } from "@workspace/database";

const CreateAssignmentsPage = async () => {
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
  })

  return (
    <div className="flex flex-1 w-full min-w-0 flex-col">
      <div className="flex items-center justify-between gap-4 border-b bg-background px-6 py-5 shrink-0">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Assignments</h1>
          <p className="text-sm text-muted-foreground">Manage existing assignments or create new ones for your students.</p>
        </div>
      </div>
      <AssignmentManager courses={courses} />
    </div>
  )
}

export default CreateAssignmentsPage