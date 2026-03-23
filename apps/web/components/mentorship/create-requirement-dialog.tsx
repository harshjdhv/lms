/**
 * @file components/mentorship/create-requirement-dialog.tsx
 * @description Dialog for teachers to create document requirements with folder assignment
 * @module Apps/Web/Components/Mentorship
 */

"use client";

import { useState } from "react";
import { FileText, Loader2, Calendar, FolderOpen } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { useCreateRequirement, DocumentFolder } from "@/hooks/queries/use-mentorship";
import { toast } from "sonner";

interface CreateRequirementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    folders?: DocumentFolder[];
    defaultFolderId?: string | null;
}

const CATEGORIES = [
    "Academic",
    "Administrative",
    "Project",
    "Certification",
    "Personal",
    "Other",
];

export function CreateRequirementDialog({
    open,
    onOpenChange,
    folders = [],
    defaultFolderId = null,
}: CreateRequirementDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [category, setCategory] = useState("");
    const [isRequired, setIsRequired] = useState(true);
    const [folderId, setFolderId] = useState<string>(defaultFolderId || "__none__");

    const createRequirement = useCreateRequirement();

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDueDate("");
        setCategory("");
        setIsRequired(true);
        setFolderId(defaultFolderId || "__none__");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        try {
            await createRequirement.mutateAsync({
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate || undefined,
                category: category || undefined,
                isRequired,
                folderId: folderId === "__none__" ? undefined : folderId,
            });
            toast.success("Document requirement created!");
            resetForm();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to create requirement");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) resetForm();
            onOpenChange(isOpen);
        }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Create Document Requirement
                    </DialogTitle>
                    <DialogDescription>
                        Define a document that your mentees need to submit.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Resume, Academic Transcript, Project Report"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Provide any specific instructions or requirements..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Folder Selection */}
                        {folders.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="folder" className="flex items-center gap-1.5">
                                    <FolderOpen className="h-3.5 w-3.5" />
                                    Folder
                                </Label>
                                <Select value={folderId} onValueChange={setFolderId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a folder" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">
                                            <span className="text-muted-foreground">No folder (Uncategorized)</span>
                                        </SelectItem>
                                        {folders.map((folder) => (
                                            <SelectItem key={folder.id} value={folder.id}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: folder.color || "#64748B" }}
                                                    />
                                                    {folder.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Category and Due Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="pl-9"
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Required Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="required" className="text-base cursor-pointer">
                                    Required Document
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Mentees must submit this document
                                </p>
                            </div>
                            <Switch
                                id="required"
                                checked={isRequired}
                                onCheckedChange={setIsRequired}
                            />
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
                        <Button type="submit" disabled={createRequirement.isPending}>
                            {createRequirement.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Requirement"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
