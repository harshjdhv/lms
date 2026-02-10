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
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@workspace/ui/components/card";
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
import { Separator } from "@workspace/ui/components/separator";

import { updateUser } from "@/actions/update-user";
import { LearningMemorySettings } from "@/components/learning/learning-memory-settings";

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    bio: z.string().optional(),
    phone: z.string().optional(),
    // Teacher
    expertise: z.string().optional(),
    title: z.string().optional(),
    // Student
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
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    return (
        <div className="grid gap-6 md:grid-cols-12 lg:gap-10">
            {/* Sidebar / Profile Summary */}
            <div className="md:col-span-4 lg:col-span-3">
                <Card className="overflow-hidden md:sticky md:top-6">
                    <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b" />
                    <CardContent className="relative pt-0 pb-8 text-center">
                        <div className="relative -mt-12 mb-4 flex justify-center">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={user.avatar || ""} alt={user.name || ""} />
                                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[200px]">{user.email}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <Badge variant="secondary" className="px-3 py-1 capitalize">
                                {roleLabel}
                            </Badge>
                        </div>

                        <Separator className="my-6" />

                        <div className="text-left space-y-3 px-2">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Overview
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Active
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Member Since</span>
                                <span>{new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Form Area */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your personal details and public profile information.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                {/* General Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" /> General
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Your full name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input className="pl-9" placeholder="+1 (555) 000-0000" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Write a short bio about yourself..."
                                                        className="resize-none min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Brief description for your profile card.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                {/* Role Specific Section */}
                                {isTeacher && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Building2 className="h-4 w-4" /> Professional Details
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Professional Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Senior Instructor" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="expertise"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Field of Expertise</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Computer Science" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isStudent && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4" /> Academic Details
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="studentId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Student ID</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input className="pl-9" placeholder="ID Number" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="grade"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Grade/Level</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <BadgeInfo className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input className="pl-9" placeholder="e.g. Year 4" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="semester"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Semester</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
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
                                )}

                                <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between border">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <p className="text-xs text-muted-foreground">Your primary email used for login.</p>
                                    </div>
                                    <code className="bg-background px-2 py-1 rounded border text-sm">{user.email}</code>
                                </div>

                            </CardContent>
                            <CardFooter className="bg-muted/20 border-t px-6 py-4">
                                <div className="flex w-full items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Last updated: {new Date().toLocaleDateString()}
                                    </p>
                                    <Button type="submit" disabled={isPending} className="min-w-[120px]">
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
                {isStudent && <LearningMemorySettings />}
            </div>
        </div>
    );
}
