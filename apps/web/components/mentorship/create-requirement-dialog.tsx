/**
 * @file components/mentorship/create-requirement-dialog.tsx
 * @description Dialog for teachers to create document requirements
 * @module Apps/Web/Components/Mentorship
 */

"use client";

import { useState } from "react";
import { FileText, Loader2, Calendar } from "lucide-react";
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
import { useCreateRequirement } from "@/hooks/queries/use-mentorship";
import { toast } from "sonner";

interface CreateRequirementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
}: CreateRequirementDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [category, setCategory] = useState("");
    const [isRequired, setIsRequired] = useState(true);

    const createRequirement = useCreateRequirement();

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDueDate("");
        setCategory("");
        setIsRequired(true);
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
