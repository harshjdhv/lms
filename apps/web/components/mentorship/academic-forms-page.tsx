"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { Plus, Save, Trash2, FileText } from "lucide-react"

import {
  useAcademicForms,
  useMentorshipData,
  useSubmitAcademicForm,
  type MenteeUser,
  type SemesterAcademicForm,
} from "@/hooks/queries/use-mentorship"
import { cn } from "@/lib/utils"

type DashboardRole = "STUDENT" | "TEACHER"

type SubjectDraft = {
  subjectName: string
  totalMarks: string
  ia1Marks: string
  ia2Marks: string
  finalMarks: string
}

type SemesterDraft = {
  subjects: SubjectDraft[]
  courseCertificatesText: string
}

const DEFAULT_SEMESTERS = Array.from({ length: 8 }, (_, index) => `SEM-${index + 1}`)
const MARK_FIELDS: Array<"totalMarks" | "ia1Marks" | "ia2Marks" | "finalMarks"> = [
  "totalMarks",
  "ia1Marks",
  "ia2Marks",
  "finalMarks",
]

function emptySubject(): SubjectDraft {
  return {
    subjectName: "",
    totalMarks: "",
    ia1Marks: "",
    ia2Marks: "",
    finalMarks: "",
  }
}

function toDraft(form?: SemesterAcademicForm): SemesterDraft {
  if (!form) {
    return {
      subjects: [emptySubject()],
      courseCertificatesText: "",
    }
  }

  const subjects = form.subjects.length
    ? form.subjects.map((subject) => ({
        subjectName: subject.subjectName,
        totalMarks: subject.totalMarks?.toString() ?? "",
        ia1Marks: subject.ia1Marks?.toString() ?? "",
        ia2Marks: subject.ia2Marks?.toString() ?? "",
        finalMarks: subject.finalMarks?.toString() ?? "",
      }))
    : [emptySubject()]

  return {
    subjects,
    courseCertificatesText: form.courseCertificates.join("\n"),
  }
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function certificatesFromText(text: string): string[] {
  return text
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
}

interface AcademicFormsPageProps {
  role: DashboardRole
  userName: string
}

export function AcademicFormsPage({ role, userName }: AcademicFormsPageProps) {
  if (role === "TEACHER") {
    return <TeacherAcademicFormsView userName={userName} />
  }

  return <StudentAcademicFormsView userName={userName} />
}

function StudentAcademicFormsView({ userName }: { userName: string }) {
  const { data: forms = [], isLoading } = useAcademicForms()
  const submitForm = useSubmitAcademicForm()

  const [drafts, setDrafts] = useState<Record<string, SemesterDraft>>({})
  const [bootstrapped, setBootstrapped] = useState(false)

  const formMap = useMemo(() => {
    const map = new Map<string, SemesterAcademicForm>()
    for (const form of forms) {
      map.set(form.semester, form)
    }
    return map
  }, [forms])

  useEffect(() => {
    if (bootstrapped) {
      return
    }

    const nextDrafts: Record<string, SemesterDraft> = {}
    for (const semester of DEFAULT_SEMESTERS) {
      nextDrafts[semester] = toDraft(formMap.get(semester))
    }

    setDrafts(nextDrafts)
    setBootstrapped(true)
  }, [bootstrapped, formMap])

  const updateSemesterDraft = (semester: string, updater: (current: SemesterDraft) => SemesterDraft) => {
    setDrafts((prev) => {
      const current = prev[semester] ?? toDraft(formMap.get(semester))
      return {
        ...prev,
        [semester]: updater(current),
      }
    })
  }

  const handleSaveSemester = async (semester: string) => {
    const draft = drafts[semester]
    if (!draft) {
      return
    }

    const subjects = draft.subjects
      .map((subject) => ({
        subjectName: subject.subjectName.trim(),
        totalMarks: parseNumber(subject.totalMarks),
        ia1Marks: parseNumber(subject.ia1Marks),
        ia2Marks: parseNumber(subject.ia2Marks),
        finalMarks: parseNumber(subject.finalMarks),
      }))
      .filter((subject) => subject.subjectName.length > 0)

    if (subjects.length === 0) {
      toast.error(`Add at least one subject for ${semester}`)
      return
    }

    try {
      await submitForm.mutateAsync({
        semester,
        subjects,
        courseCertificates: certificatesFromText(draft.courseCertificatesText),
      })
      toast.success(`${semester} details saved`)
    } catch (error: any) {
      toast.error(error.message || "Failed to save semester")
    }
  }

  if (isLoading || !bootstrapped) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full rounded-none" />
        <Skeleton className="h-44 w-full rounded-none" />
        <Skeleton className="h-44 w-full rounded-none" />
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="border-b bg-background px-6 py-5">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Semester Academic Form</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill your marks and list courses/certificates for each semester. Teacher can review this directly.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Student: {userName}</p>
      </div>

      <div className="space-y-6 p-6">
        {DEFAULT_SEMESTERS.map((semester) => {
          const draft = drafts[semester]
          const hasSaved = Boolean(formMap.get(semester)?.submittedAt)

          if (!draft) {
            return null
          }

          return (
            <section key={semester} className="border border-border bg-background">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wide">{semester}</h2>
                  {hasSaved && (
                    <Badge variant="secondary" className="rounded-none text-[11px]">
                      Saved
                    </Badge>
                  )}
                </div>
                <Button
                  className="rounded-none gap-2"
                  size="sm"
                  onClick={() => handleSaveSemester(semester)}
                  disabled={submitForm.isPending}
                >
                  <Save className="h-3.5 w-3.5" />
                  Save {semester}
                </Button>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-border text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="border-b border-r px-3 py-2 text-left font-medium">Subject</th>
                        <th className="border-b border-r px-3 py-2 text-left font-medium">Total Marks</th>
                        <th className="border-b border-r px-3 py-2 text-left font-medium">IA1</th>
                        <th className="border-b border-r px-3 py-2 text-left font-medium">IA2</th>
                        <th className="border-b border-r px-3 py-2 text-left font-medium">Final Exam</th>
                        <th className="border-b px-3 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.subjects.map((subject, index) => (
                        <tr key={`${semester}-subject-${index}`}>
                          <td className="border-r border-t px-2 py-2 align-top">
                            <Input
                              value={subject.subjectName}
                              onChange={(event) => {
                                const value = event.target.value
                                updateSemesterDraft(semester, (current) => {
                                  const nextSubjects = [...current.subjects]
                                  const existing = nextSubjects[index] ?? emptySubject()
                                  nextSubjects[index] = { ...existing, subjectName: value }
                                  return { ...current, subjects: nextSubjects }
                                })
                              }}
                              placeholder="Subject name"
                              className="h-8 rounded-none"
                            />
                          </td>
                          {MARK_FIELDS.map((field) => (
                            <td key={field} className="border-r border-t px-2 py-2 align-top">
                              <Input
                                value={subject[field]}
                                onChange={(event) => {
                                  const value = event.target.value
                                  updateSemesterDraft(semester, (current) => {
                                    const nextSubjects = [...current.subjects]
                                    const existing = nextSubjects[index] ?? emptySubject()
                                    nextSubjects[index] = {
                                      ...existing,
                                      [field]: value,
                                    }
                                    return { ...current, subjects: nextSubjects }
                                  })
                                }}
                                placeholder="0"
                                inputMode="decimal"
                                className="h-8 rounded-none"
                              />
                            </td>
                          ))}
                          <td className="border-t px-2 py-2 align-top">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => {
                                updateSemesterDraft(semester, (current) => {
                                  if (current.subjects.length === 1) {
                                    return {
                                      ...current,
                                      subjects: [emptySubject()],
                                    }
                                  }

                                  return {
                                    ...current,
                                    subjects: current.subjects.filter((_, subjectIndex) => subjectIndex !== index),
                                  }
                                })
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  variant="outline"
                  className="rounded-none gap-2"
                  size="sm"
                  onClick={() => {
                    updateSemesterDraft(semester, (current) => ({
                      ...current,
                      subjects: [...current.subjects, emptySubject()],
                    }))
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Subject
                </Button>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Courses / Certificates (one per line)
                  </p>
                  <Textarea
                    value={draft.courseCertificatesText}
                    onChange={(event) => {
                      const value = event.target.value
                      updateSemesterDraft(semester, (current) => ({
                        ...current,
                        courseCertificatesText: value,
                      }))
                    }}
                    placeholder={"NPTEL - Data Structures\nAWS Cloud Practitioner\nCoursera - Python"}
                    className="min-h-24 rounded-none"
                  />
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function TeacherAcademicFormsView({ userName }: { userName: string }) {
  const { data: mentorshipData, isLoading: mentorshipLoading } = useMentorshipData()
  const mentees = mentorshipData?.mentees.map((entry) => entry.mentee) ?? []

  const [selectedMenteeId, setSelectedMenteeId] = useState<string>("")

  useEffect(() => {
    const firstMentee = mentees[0]
    if (!selectedMenteeId && firstMentee) {
      setSelectedMenteeId(firstMentee.id)
    }
  }, [mentees, selectedMenteeId])

  const { data: forms = [], isLoading: formsLoading } = useAcademicForms(selectedMenteeId || undefined)

  const selectedMentee = useMemo<MenteeUser | null>(
    () => mentees.find((mentee) => mentee.id === selectedMenteeId) ?? null,
    [mentees, selectedMenteeId],
  )

  const groupedBySemester = useMemo(() => {
    const map = new Map(forms.map((form) => [form.semester, form]))
    return DEFAULT_SEMESTERS.map((semester) => ({
      semester,
      form: map.get(semester),
    }))
  }, [forms])

  if (mentorshipLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="border-b bg-background px-6 py-5">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Mentee Academic Forms</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review semester-wise marks and certifications submitted by your mentees.</p>
        <p className="mt-2 text-xs text-muted-foreground">Mentor: {userName}</p>
      </div>

      {mentees.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No mentees assigned yet</p>
          <p className="text-xs text-muted-foreground">Add mentees in mentorship first to review academic forms.</p>
        </div>
      ) : (
        <div className="space-y-5 p-6">
          <div className="max-w-sm space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Select Mentee</p>
            <Select value={selectedMenteeId} onValueChange={setSelectedMenteeId}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Choose a mentee" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {mentees.map((mentee) => (
                  <SelectItem key={mentee.id} value={mentee.id}>
                    {mentee.name || mentee.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formsLoading ? (
            <Skeleton className="h-64 w-full rounded-none" />
          ) : (
            <div className="space-y-4">
              {groupedBySemester.map(({ semester, form }) => (
                <section key={semester} className="border border-border bg-background">
                  <div className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold tracking-wide">{semester}</h2>
                    <Badge
                      variant={form ? "secondary" : "outline"}
                      className={cn("rounded-none text-[11px]", !form && "text-muted-foreground")}
                    >
                      {form ? "Submitted" : "Not submitted"}
                    </Badge>
                  </div>

                  {!form ? (
                    <p className="px-4 py-4 text-sm text-muted-foreground sm:px-5">
                      {selectedMentee?.name || "Student"} has not submitted this semester yet.
                    </p>
                  ) : (
                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-border text-sm">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="border-b border-r px-3 py-2 text-left font-medium">Subject</th>
                              <th className="border-b border-r px-3 py-2 text-left font-medium">Total Marks</th>
                              <th className="border-b border-r px-3 py-2 text-left font-medium">IA1</th>
                              <th className="border-b border-r px-3 py-2 text-left font-medium">IA2</th>
                              <th className="border-b px-3 py-2 text-left font-medium">Final Exam</th>
                            </tr>
                          </thead>
                          <tbody>
                            {form.subjects.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-3 py-3 text-sm text-muted-foreground">
                                  No subjects added for this semester.
                                </td>
                              </tr>
                            ) : (
                              form.subjects.map((subject) => (
                                <tr key={subject.id}>
                                  <td className="border-r border-t px-3 py-2">{subject.subjectName}</td>
                                  <td className="border-r border-t px-3 py-2">{subject.totalMarks ?? "-"}</td>
                                  <td className="border-r border-t px-3 py-2">{subject.ia1Marks ?? "-"}</td>
                                  <td className="border-r border-t px-3 py-2">{subject.ia2Marks ?? "-"}</td>
                                  <td className="border-t px-3 py-2">{subject.finalMarks ?? "-"}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Courses / Certificates</p>
                        {form.courseCertificates.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No courses/certificates listed.</p>
                        ) : (
                          <ul className="list-disc space-y-1 pl-5 text-sm">
                            {form.courseCertificates.map((item, index) => (
                              <li key={`${form.id}-cert-${index}`}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
