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
        <div className="flex flex-col animate-in fade-in-50">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between px-6 py-4 border-b">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search announcements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-none h-9"
                    />
                </div>
                <Button onClick={() => setShowCreate(!showCreate)} className="rounded-none shrink-0">
                    {showCreate ? "Cancel" : "Create new"}
                </Button>
            </div>

            {/* Creation Section */}
            {showCreate && (
                <div className="border-b px-6 py-6">
                    <CreateAnnouncementSection courses={courses} onCreated={handleCreated} />
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
                <TeacherAnnouncementList announcements={filteredAnnouncements} isLoading={isLoading} />
            </div>
        </div>
    );
};
