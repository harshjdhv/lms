/**
 * @file components/mentorship/create-folder-dialog.tsx
 * @description Dialog for teachers to create document folders (e.g., Sem 1, Sem 2)
 * @module Apps/Web/Components/Mentorship
 */

"use client";

import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { useCreateFolder } from "@/hooks/queries/use-mentorship";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Emerald", value: "#10B981" },
    { name: "Amber", value: "#F59E0B" },
    { name: "Rose", value: "#F43F5E" },
    { name: "Cyan", value: "#06B6D4" },
    { name: "Orange", value: "#F97316" },
    { name: "Indigo", value: "#6366F1" },
];

const FOLDER_PRESETS = [
    { name: "Semester 1", color: "#3B82F6" },
    { name: "Semester 2", color: "#8B5CF6" },
    { name: "Semester 3", color: "#10B981" },
    { name: "Semester 4", color: "#F59E0B" },
    { name: "Semester 5", color: "#F43F5E" },
    { name: "Semester 6", color: "#06B6D4" },
    { name: "Semester 7", color: "#F97316" },
    { name: "Semester 8", color: "#6366F1" },
    { name: "Projects", color: "#10B981" },
    { name: "Certifications", color: "#F59E0B" },
    { name: "Administrative", color: "#64748B" },
    { name: "Personal", color: "#F43F5E" },
];

export function CreateFolderDialog({
    open,
    onOpenChange,
}: CreateFolderDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#3B82F6");

    const createFolder = useCreateFolder();

    const resetForm = () => {
        setName("");
        setDescription("");
        setColor("#3B82F6");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Folder name is required");
            return;
        }

        try {
            await createFolder.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                color,
            });
            toast.success(`Folder "${name.trim()}" created!`);
            resetForm();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to create folder");
        }
    };

    const handlePreset = (preset: typeof FOLDER_PRESETS[number]) => {
        setName(preset.name);
        setColor(preset.color);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) resetForm();
            onOpenChange(isOpen);
        }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5 text-primary" />
                        Create Document Folder
                    </DialogTitle>
                    <DialogDescription>
                        Organize your document requirements into folders like semesters or categories.
                    </DialogDescription>
                </DialogHeader>

                {/* Quick Presets */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick presets</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {FOLDER_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => handlePreset(preset)}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border transition-colors hover:bg-muted/50",
                                    name === preset.name
                                        ? "border-foreground bg-muted/50 font-medium"
                                        : "border-border text-muted-foreground"
                                )}
                            >
                                <div
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: preset.color }}
                                />
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="folderName">Folder Name *</Label>
                        <Input
                            id="folderName"
                            placeholder="e.g., Semester 1, Projects, Certifications"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="folderDescription">Description</Label>
                        <Textarea
                            id="folderDescription"
                            placeholder="Brief description of what documents go in this folder..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex items-center gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={cn(
                                        "h-7 w-7 rounded-full border-2 transition-all",
                                        color === c.value
                                            ? "border-foreground scale-110"
                                            : "border-transparent hover:border-muted-foreground/30"
                                    )}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createFolder.isPending}>
                            {createFolder.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Folder"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
