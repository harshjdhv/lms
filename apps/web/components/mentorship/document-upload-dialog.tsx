/**
 * @file components/mentorship/document-upload-dialog.tsx
 * @description Dialog for students to upload documents
 * @module Apps/Web/Components/Mentorship
 */

"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Progress } from "@workspace/ui/components/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { useSubmitDocument } from "@/hooks/queries/use-mentorship";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DocumentUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requirement: any;
}

export function DocumentUploadDialog({
    open,
    onOpenChange,
    requirement,
}: DocumentUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    const submitDocument = useSubmitDocument();

    const resetState = () => {
        setFile(null);
        setUploading(false);
        setUploadProgress(0);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            validateAndSetFile(droppedFile);
        }
    }, []);

    const validateAndSetFile = (selectedFile: File) => {
        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/gif",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error("Only PDF, DOC, DOCX, and image files are allowed");
            return;
        }

        setFile(selectedFile);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file || !requirement) return;

        setUploading(true);
        setUploadProgress(10);

        try {
            const supabase = createClient();

            // Generate unique file path
            const fileExt = file.name.split(".").pop();
            const timestamp = Date.now();
            const filePath = `documents/${requirement.id}/${timestamp}.${fileExt}`;

            setUploadProgress(30);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("mentorship-documents")
                .upload(filePath, file);

            if (uploadError) {
                throw new Error("Failed to upload file");
            }

            setUploadProgress(70);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("mentorship-documents")
                .getPublicUrl(filePath);

            setUploadProgress(90);

            // Submit document record
            await submitDocument.mutateAsync({
                requirementId: requirement.id,
                fileUrl: urlData.publicUrl,
                fileName: file.name,
                fileSize: file.size,
            });

            setUploadProgress(100);
            toast.success("Document submitted successfully!");
            resetState();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to submit document");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) resetState();
                onOpenChange(isOpen);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Upload Document
                    </DialogTitle>
                    <DialogDescription>
                        {requirement && (
                            <span>
                                Submit your document for:{" "}
                                <strong>{requirement.title}</strong>
                                {requirement.isRequired && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                        Required
                                    </Badge>
                                )}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Dropzone */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                            dragActive
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/30 hover:border-primary/50",
                            file && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="p-3 rounded-lg bg-emerald-500/10">
                                        <FileText className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto"
                                        onClick={() => setFile(null)}
                                        disabled={uploading}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm">Ready to submit</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 rounded-full bg-primary/10">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium">
                                        Drop your file here, or{" "}
                                        <label className="text-primary cursor-pointer hover:underline">
                                            browse
                                            <Input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        PDF, DOC, DOCX, or images up to 10MB
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Uploading...</span>
                                <span className="font-medium">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm">
                        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-muted-foreground">
                            <p>Your document will be reviewed by your mentor. You'll be notified once it's approved or if any changes are needed.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Submit Document
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
