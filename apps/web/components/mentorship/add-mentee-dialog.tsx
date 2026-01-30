/**
 * @file components/mentorship/add-mentee-dialog.tsx
 * @description Dialog for teachers to add students as mentees
 * @module Apps/Web/Components/Mentorship
 */

"use client";

import { useState } from "react";
import { Search, UserPlus, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useAvailableStudents, useAddMentee } from "@/hooks/queries/use-mentorship";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddMenteeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddMenteeDialog({ open, onOpenChange }: AddMenteeDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: students, isLoading } = useAvailableStudents();
    const addMentee = useAddMentee();

    const filteredStudents = students?.filter(
        (student) =>
            student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddMentee = async (studentId: string) => {
        try {
            await addMentee.mutateAsync(studentId);
            toast.success("Mentee added successfully!");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to add mentee");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Add Mentee
                    </DialogTitle>
                    <DialogDescription>
                        Search and select students to add as your mentees.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or student ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Student List */}
                    <ScrollArea className="h-[300px] pr-4">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                        <Skeleton className="h-9 w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredStudents?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                <GraduationCap className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">
                                    {searchQuery
                                        ? "No students found matching your search"
                                        : "No available students to add"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredStudents?.map((student) => (
                                    <StudentRow
                                        key={student.id}
                                        student={student}
                                        onAdd={() => handleAddMentee(student.id)}
                                        isAdding={addMentee.isPending}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StudentRow({
    student,
    onAdd,
    isAdding,
}: {
    student: any;
    onAdd: () => void;
    isAdding: boolean;
}) {
    const initials = student.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "?";

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <Avatar className="h-10 w-10">
                <AvatarImage src={student.avatar || undefined} alt={student.name || "Student"} />
                <AvatarFallback className="bg-primary/10 text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{student.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                <div className="flex gap-1.5 mt-1">
                    {student.studentId && (
                        <Badge variant="outline" className="text-xs">
                            {student.studentId}
                        </Badge>
                    )}
                    {student.semester && (
                        <Badge variant="secondary" className="text-xs">
                            {student.semester}
                        </Badge>
                    )}
                </div>
            </div>
            <Button
                size="sm"
                onClick={onAdd}
                disabled={isAdding}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                    </>
                )}
            </Button>
        </div>
    );
}
