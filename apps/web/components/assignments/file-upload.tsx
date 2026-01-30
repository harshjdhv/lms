"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Upload, X, Loader2 } from "lucide-react"

export function FileUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
    const [uploading, setUploading] = useState(false)
    const [fileUrl, setFileUrl] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `assignments/${fileName}`

        try {
            const { error } = await supabase.storage
                .from('LMS')
                .upload(filePath, file)

            if (error) {
                // If the error is related to bucket not found or permissions, we might need to handle it better. 
                // However, based on user input, the bucket exists.
                // If it fails, we fall back to user instructions about keys, but client-side upload via supabase-js
                // usually requires RLS policies on the bucket, not raw keys.
                // Assuming RLS is set up for authenticated users.
                throw error
            }

            const { data: { publicUrl } } = supabase.storage
                .from('LMS')
                .getPublicUrl(filePath)

            setFileUrl(publicUrl)
            onUploadComplete(publicUrl)
            toast.success("File uploaded successfully")

        } catch (error: any) {
            console.error("Upload failed", error)
            toast.error(error.message || "Upload failed. Check console.")
        } finally {
            setUploading(false)
        }
    }

    if (fileUrl) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                <span className="truncate max-w-[200px]">{fileUrl.split('/').pop()}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFileUrl(null); onUploadComplete(""); }}>
                    <X className="h-3 w-3" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Document"}
            </Button>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleUpload}
            />
        </div>
    )
}
