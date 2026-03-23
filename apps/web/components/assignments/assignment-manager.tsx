"use client";
import { useState, useMemo } from "react";

import { useAssignments, useUpdateAssignmentStatus } from "@/hooks/queries";
import { useMyCourses } from "@/hooks/queries/use-courses";
import { CreateAssignmentSection } from "./create-assignment-section";
import { Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { AssignmentTable } from "./teacher-dashboard";

interface Course {
    id: string;
    title: string;
}

interface AssignmentManagerProps {
    courses?: Course[];
}

const AssignmentManager = ({ courses }: AssignmentManagerProps) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [showCreate, setShowCreate] = useState(false)

    const { data: assignments = [], isLoading, refetch } = useAssignments();
    const { data: myCourses = [] } = useMyCourses();
    const updateStatusMutation = useUpdateAssignmentStatus();
    const teacherCourses = useMemo(
        () =>
            courses ??
            myCourses.map((course) => ({
                id: course.id,
                title: course.title,
            })),
        [courses, myCourses],
    );

    const filteredAssignments = useMemo(() => {
        return assignments.filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [assignments, searchQuery])

    const updateStatus = async (id: string, status: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id, status })
            toast.success(`Assignment marked as ${status.toLowerCase()}`)
            refetch()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleCreated = () => {
        refetch()
        setShowCreate(false)
        toast.success("Assignment created successfully")
    }

    return (
        <div className="flex w-full min-w-0 flex-col animate-in fade-in-50">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Assignments</h1>
                    <p className="text-sm text-muted-foreground">Manage existing assignments or create new ones for your students.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between px-6 py-4 border-b">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search assignments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-none h-9" />
                </div>
                <Button onClick={() => setShowCreate(!showCreate)} className="rounded-none shrink-0">
                    {showCreate ? "Cancel" : "Create new"}
                </Button>
            </div>

            {/* Creation Section (Toggleable) */}
            {showCreate && (
                <div className="border-b px-6 py-6">
                    <CreateAssignmentSection courses={teacherCourses} onCreated={handleCreated} />
                </div>
            )}

            {/* Hatched divider */}
            <div
                className="h-4 w-full border-b shrink-0"
                style={{
                    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
                    backgroundSize: "6px 6px",
                }}
            />

            {/* List Section */}
            <div className="overflow-hidden border-y">
                <AssignmentTable
                    assignments={filteredAssignments}
                    isLoading={isLoading}
                    onUpdateStatus={updateStatus}
                    onCreateAssignment={() => setShowCreate(true)}
                />
            </div>
        </div>
    )
}

export default AssignmentManager
