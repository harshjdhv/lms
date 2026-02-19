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
    <>
      <div className="p-6  ">
        <div>
          <h1 className="text-3xl font-bold tracking-tight pb-1.5">Assignments</h1>
          <p className="text-muted-foreground pb-1.5">Manage existing assignments or create new ones for your students.</p>
        </div>

        {/* Pass the courses we fetched */}
        <AssignmentManager courses={courses} />
      </div>

    </>
  )
}

export default CreateAssignmentsPage