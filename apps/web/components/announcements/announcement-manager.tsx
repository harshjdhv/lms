"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

import { useAnnouncements } from "@/hooks/queries/use-announcements";
import { CreateAnnouncementSection } from "./create-announcement-section";
import { TeacherAnnouncementList } from "./teacher-announcement-list";

interface Course {
    id: string;
    title: string;
}

interface AnnouncementManagerProps {
    courses: Course[];
}

export const AnnouncementManager = ({ courses }: AnnouncementManagerProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const { data: announcements = [], isLoading, refetch } = useAnnouncements();

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((a) =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [announcements, searchQuery]);

    const handleCreated = () => {
        refetch();
        setShowCreate(false);
        toast.success("Announcement created successfully");
    };

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search announcements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => setShowCreate(!showCreate)}>
                    {showCreate ? "Cancel" : "Create new"}
                </Button>
            </div>

            {/* Creation Section */}
            {showCreate && (
                <div className="border-b pb-6">
                    <CreateAnnouncementSection courses={courses} onCreated={handleCreated} />
                </div>
            )}

            {/* List Section */}
            <TeacherAnnouncementList announcements={filteredAnnouncements} isLoading={isLoading} />
        </div>
    );
};
