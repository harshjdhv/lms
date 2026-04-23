import { NextResponse } from "next/server"
import { prisma } from "@workspace/database"
import { getCurrentUser } from "@/lib/get-current-user"

type SubjectPayload = {
  subjectName?: unknown
  totalMarks?: unknown
  ia1Marks?: unknown
  ia2Marks?: unknown
  finalMarks?: unknown
}

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data))

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeSubjects(input: unknown): Array<{
  subjectName: string
  totalMarks: number | null
  ia1Marks: number | null
  ia2Marks: number | null
  finalMarks: number | null
  position: number
}> {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((subject, index) => {
      const raw = (subject ?? {}) as SubjectPayload
      const subjectName = typeof raw.subjectName === "string" ? raw.subjectName.trim() : ""

      return {
        subjectName,
        totalMarks: toOptionalNumber(raw.totalMarks),
        ia1Marks: toOptionalNumber(raw.ia1Marks),
        ia2Marks: toOptionalNumber(raw.ia2Marks),
        finalMarks: toOptionalNumber(raw.finalMarks),
        position: index,
      }
    })
    .filter((subject) => subject.subjectName.length > 0)
}

function normalizeCertificates(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
}

function normalizeSemester(value: unknown): string {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim().toUpperCase()
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (user.role === "TEACHER") {
      const mentees = await prisma.mentorship.findMany({
        where: {
          mentorId: user.id,
          status: "ACTIVE",
        },
        select: {
          menteeId: true,
        },
      })

      const menteeIds = mentees.map((entry) => entry.menteeId)
      if (menteeIds.length === 0) {
        return NextResponse.json(serialize([]))
      }

      const url = new URL(request.url)
      const studentId = url.searchParams.get("studentId")?.trim()

      if (studentId && !menteeIds.includes(studentId)) {
        return NextResponse.json(
          { message: "You can only view forms for your mentees" },
          { status: 403 },
        )
      }

      const forms = await prisma.studentSemesterForm.findMany({
        where: {
          studentId: studentId || { in: menteeIds },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              semester: true,
              studentId: true,
            },
          },
          subjects: {
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: [{ student: { name: "asc" } }, { semester: "asc" }],
      })

      return NextResponse.json(serialize(forms))
    }

    const forms = await prisma.studentSemesterForm.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        subjects: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        semester: "asc",
      },
    })

    return NextResponse.json(serialize(forms))
  } catch (error) {
    console.error("[MENTORSHIP_ACADEMIC_FORMS_GET]", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Only students can submit academic forms" },
        { status: 403 },
      )
    }

    const body = await request.json()

    const semester = normalizeSemester(body?.semester)
    const subjects = normalizeSubjects(body?.subjects)
    const courseCertificates = normalizeCertificates(body?.courseCertificates)

    if (!semester) {
      return NextResponse.json(
        { message: "Semester is required" },
        { status: 400 },
      )
    }

    const mentorship = await prisma.mentorship.findFirst({
      where: {
        menteeId: user.id,
        status: "ACTIVE",
      },
      select: {
        mentorId: true,
      },
    })

    const updatedForm = await prisma.studentSemesterForm.upsert({
      where: {
        studentId_semester: {
          studentId: user.id,
          semester,
        },
      },
      create: {
        studentId: user.id,
        mentorId: mentorship?.mentorId || null,
        semester,
        courseCertificates,
        submittedAt: new Date(),
        ...(subjects.length > 0 ? { subjects: { create: subjects } } : {}),
      },
      update: {
        mentorId: mentorship?.mentorId || null,
        courseCertificates,
        submittedAt: new Date(),
        subjects: {
          deleteMany: {},
          ...(subjects.length > 0 ? { create: subjects } : {}),
        },
      },
      include: {
        subjects: {
          orderBy: {
            position: "asc",
          },
        },
      },
    })

    return NextResponse.json(serialize(updatedForm))
  } catch (error) {
    console.error("[MENTORSHIP_ACADEMIC_FORMS_POST]", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    )
  }
}
