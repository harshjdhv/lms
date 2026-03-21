"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
    Loader2,
    User as UserIcon,
    GraduationCap,
    Building2,
    Mail,
    Phone,
    BookOpen,
    Hash,
    BadgeInfo,
    Save,
    ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

import { updateUser } from "@/actions/update-user";
import { LearningMemorySettings } from "@/components/learning/learning-memory-settings";

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    bio: z.string().optional(),
    phone: z.string().optional(),
    expertise: z.string().optional(),
    title: z.string().optional(),
    studentId: z.string().optional(),
    grade: z.string().optional(),
    semester: z.string().optional(),
});

type UserData = {
    id: string;
    email: string;
    name: string | null;
    role: string | null;
    bio: string | null;
    avatar: string | null;
    phone: string | null;
    expertise: string | null;
    title: string | null;
    studentId: string | null;
    grade: string | null;
    semester: string | null;
};

interface AccountFormProps {
    user: UserData;
}

export function AccountForm({ user }: AccountFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name || "",
            bio: user.bio || "",
            phone: user.phone || "",
            expertise: user.expertise || "",
            title: user.title || "",
            studentId: user.studentId || "",
            grade: user.grade || "",
            semester: user.semester || "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                const result = await updateUser(values);
                if (result.success) {
                    toast.success("Profile updated successfully");
                    router.refresh();
                } else {
                    toast.error("Error", { description: result.error });
                }
            } catch {
                toast.error("Something went wrong");
            }
        });
    }

    const isTeacher = user.role === "TEACHER";
    const isStudent = user.role === "STUDENT";

    const roleLabel = user.role
        ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
        : "Member";

    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full min-w-0 flex-col">

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                    <div className="min-w-0 space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Account Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your profile and personal details.</p>
                    </div>
                    <Button type="submit" disabled={isPending} className="rounded-none gap-2 shrink-0">
                        {isPending ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                        ) : (
                            <><Save className="h-4 w-4" />Save Changes</>
                        )}
                    </Button>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-border">

                    {/* Left — Profile card */}
                    <div className="min-w-0 divide-y divide-border">
                        {/* Avatar block */}
                        <div className="flex flex-col items-center gap-4 px-6 py-8">
                            <div className="relative">
                                <Avatar className="h-20 w-20 border-2 border-border">
                                    <AvatarImage src={user.avatar || ""} alt={user.name || ""} />
                                    <AvatarFallback className="text-lg bg-muted text-foreground font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-semibold">{user.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                                <Badge variant="secondary" className="rounded-none capitalize mt-1">
                                    {roleLabel}
                                </Badge>
                            </div>
                        </div>

                        {/* Status row */}
                        <div className="flex items-center justify-between px-6 py-4">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className="flex items-center gap-1.5 text-sm font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                Active
                            </span>
                        </div>

                        {/* Email row */}
                        <div className="flex items-center justify-between gap-3 px-6 py-4">
                            <span className="text-sm text-muted-foreground shrink-0">Email</span>
                            <code className="text-xs bg-muted px-2 py-1 truncate max-w-40">{user.email}</code>
                        </div>

                        {/* Role row */}
                        <div className="flex items-center justify-between px-6 py-4">
                            <span className="text-sm text-muted-foreground">Role</span>
                            <span className="text-sm font-medium capitalize">{roleLabel}</span>
                        </div>

                        {/* Read-only notice */}
                        <div className="flex items-start gap-2.5 px-6 py-4 bg-muted/30">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Email and role are managed by your institution and cannot be changed here.
                            </p>
                        </div>
                    </div>

                    {/* Right — Form fields */}
                    <div className="min-w-0 xl:col-span-3 divide-y divide-border">

                        {/* General section */}
                        <div className="flex items-center gap-2 px-6 py-3 bg-muted/30">
                            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">General</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                            <div className="px-6 py-4 space-y-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your full name" className="rounded-none" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="px-6 py-4 space-y-2">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9 rounded-none" placeholder="+1 (555) 000-0000" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 space-y-2">
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write a short bio about yourself…"
                                                className="rounded-none resize-none min-h-24"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Brief description shown on your profile card.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Teacher section */}
                        {isTeacher && (
                            <>
                                <div className="flex items-center gap-2 px-6 py-3 bg-muted/30">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Professional Details</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                                    <div className="px-6 py-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Professional Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Senior Instructor" className="rounded-none" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="px-6 py-4">
                                        <FormField
                                            control={form.control}
                                            name="expertise"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Field of Expertise</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Computer Science" className="rounded-none" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Student section */}
                        {isStudent && (
                            <>
                                <div className="flex items-center gap-2 px-6 py-3 bg-muted/30">
                                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Academic Details</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
                                    <div className="px-6 py-4">
                                        <FormField
                                            control={form.control}
                                            name="studentId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Student ID</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input className="pl-9 rounded-none" placeholder="ID Number" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="px-6 py-4">
                                        <FormField
                                            control={form.control}
                                            name="grade"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Grade / Level</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <BadgeInfo className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input className="pl-9 rounded-none" placeholder="e.g. Year 4" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="px-6 py-4">
                                        <FormField
                                            control={form.control}
                                            name="semester"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Semester</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-none">
                                                                <div className="flex items-center gap-2">
                                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                                    <SelectValue placeholder="Select semester" />
                                                                </div>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {Array.from({ length: 8 }, (_, i) => (
                                                                <SelectItem key={i} value={`SEM-${i + 1}`}>
                                                                    Semester {i + 1}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Learning memory */}
                                <div className="flex items-center gap-2 px-6 py-3 bg-muted/30">
                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Learning Preferences</span>
                                </div>
                                <div className="px-6 py-4">
                                    <LearningMemorySettings />
                                </div>
                            </>
                        )}

                        {/* Footer save bar */}
                        <div className="flex items-center justify-between px-6 py-4 bg-muted/20">
                            <p className="text-xs text-muted-foreground">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                            <Button type="submit" disabled={isPending} className="rounded-none gap-2">
                                {isPending ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                                ) : (
                                    <><Save className="h-4 w-4" />Save Changes</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
