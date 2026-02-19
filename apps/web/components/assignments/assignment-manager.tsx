"use client";
import { useState, useMemo } from "react";

import { useAssignments, useUpdateAssignmentStatus } from "@/hooks/queries";
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
    courses: Course[];
}

const AssignmentManager = ({ courses }: AssignmentManagerProps) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [showCreate, setShowCreate] = useState(false)

    const { data: assignments = [], isLoading, refetch } = useAssignments();
    const updateStatusMutation = useUpdateAssignmentStatus();

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
        <div>
            <div className="space-y-6 animate-in fade-in-50">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search assignments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Button onClick={() => setShowCreate(!showCreate)}>
                        {showCreate ? "Cancel" : "Create new"}
                    </Button>
                </div>
                {/* Creation Section (Toggleable) */}
                {showCreate && (
                    <div className="border-b pb-6">
                        <CreateAssignmentSection courses={courses} onCreated={handleCreated} />
                    </div>
                )}

                {/* List Section */}
                <AssignmentTable
                    assignments={filteredAssignments}
                    isLoading={isLoading}
                    onUpdateStatus={updateStatus}
                />
            </div>
        </div>
    )
}

export default AssignmentManager