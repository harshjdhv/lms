"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, GraduationCap, BookOpen, Command, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { createClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/ui/aurora-background"
import {
    LearningPreferencesFields,
    type LearningPreferencesValue,
} from "@/components/learning/learning-preferences-fields"

const teacherSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    title: z.string().min(2, "Title is required"),
    expertise: z.string().min(10, "Please describe your expertise (at least 10 characters)"),
    phone: z.string().optional(),
    bio: z.string().optional(),
})

const studentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    studentId: z.string().min(3, "Student ID is required"),
    grade: z.string().min(1, "Grade is required"),
    semester: z.string().min(1, "Semester is required"),
    phone: z.string().optional(),
    bio: z.string().optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>
type StudentFormData = z.infer<typeof studentSchema>

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedRole, setSelectedRole] = React.useState<"TEACHER" | "STUDENT" | null>(null)
    const [learningPreferences, setLearningPreferences] = React.useState<LearningPreferencesValue>({
        learningPace: "STEADY",
        preferredLearningStyle: "MIXED",
        preferredExplanationStyle: "STEP_BY_STEP",
        confidenceLevel: "BEGINNER",
        goals: ["DEEP_UNDERSTANDING"],
    })
    const supabase = createClient()

    const teacherForm = useForm<TeacherFormData>({
        resolver: zodResolver(teacherSchema),
    })

    const studentForm = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
    })

    const currentForm: any = selectedRole === "TEACHER" ? teacherForm : studentForm

    async function onSubmit(data: TeacherFormData | StudentFormData) {
        setIsLoading(true)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Not authenticated")
                router.push("/auth")
                return
            }

            // Update user profile
            const response = await fetch("/api/user/complete-onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    role: selectedRole,
                    ...data,
                    ...(selectedRole === "STUDENT"
                        ? {
                            learningPreferences,
                            onboardingAnswers: learningPreferences,
                        }
                        : {}),
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to complete onboarding")
            }

            toast.success("Profile setup complete!", {
                description: "Welcome to your learning platform",
            })

            // Show loading state
            await new Promise(resolve => setTimeout(resolve, 1500))

            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong", {
                description: "Please try again later.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-zinc-950">
            {/* Left Side - Aurora & Branding */}
            <div className="hidden lg:block p-3 h-screen sticky top-0">
                <div className="relative h-full w-full flex-col justify-between overflow-hidden rounded-[2rem] bg-zinc-900 flex">
                    {/* Background Layer */}
                    <div className="absolute inset-0 z-0">
                        <AuroraBackground className="h-full w-full bg-zinc-900!" showRadial={true} />
                    </div>

                    {/* Branding Top Left */}
                    <div className="relative z-20 flex items-center text-lg font-medium tracking-tight text-white p-10">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-zinc-950 mr-2">
                            <Command className="h-5 w-5" />
                        </div>
                        ConnectX Inc
                    </div>

                    {/* Quote Bottom Left */}
                    <div className="relative z-20 mt-auto max-w-lg p-10">
                        <blockquote className="space-y-2">
                            <p className="text-xl font-medium leading-relaxed font-serif italic text-white/90">
                                &ldquo;Your learning journey begins here. Choose your path and unlock your potential with personalized education tailored just for you.&rdquo;
                            </p>
                            <footer className="text-sm font-medium text-white/60">
                                ConnectX Team &mdash; Building the Future of Learning
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right Side - Onboarding Content */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-12 relative">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[550px]">
                    <AnimatePresence mode="wait">
                        {!selectedRole ? (
                            <motion.div
                                key="role-selection"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="text-center mb-12">
                                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                                        Welcome! Let&apos;s get you set up
                                    </h1>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                                        Tell us a bit about yourself to personalize your experience
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => setSelectedRole("STUDENT")}
                                        className="group relative flex items-center w-full overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-500/50"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative flex items-center w-full gap-5 text-left">
                                            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                                <GraduationCap className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                                    I&apos;m a Student
                                                </h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                    Access courses, track your progress, and learn at your own pace
                                                </p>
                                            </div>
                                            <div className="hidden sm:flex text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-colors">
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setSelectedRole("TEACHER")}
                                        className="group relative flex items-center w-full overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all duration-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative flex items-center w-full gap-5 text-left">
                                            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                                <BookOpen className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                                    I&apos;m a Teacher
                                                </h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                    Create courses, manage students, and share your knowledge
                                                </p>
                                            </div>
                                            <div className="hidden sm:flex text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 transition-colors">
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${selectedRole === "STUDENT"
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                            }`}>
                                            {selectedRole === "STUDENT" ? (
                                                <GraduationCap className="w-6 h-6" />
                                            ) : (
                                                <BookOpen className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                                                {selectedRole === "STUDENT" ? "Student" : "Teacher"} Profile
                                            </h2>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                Complete your profile to continue
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedRole(null)
                                            currentForm.reset()
                                        }}
                                        disabled={isLoading}
                                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    >
                                        Change
                                    </Button>
                                </div>

                                <form onSubmit={currentForm.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                disabled={isLoading}
                                                className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                                {...currentForm.register("name")}
                                            />
                                            {currentForm.formState.errors.name && (
                                                <p className="text-xs text-red-500 font-medium">
                                                    {currentForm.formState.errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        {selectedRole === "TEACHER" ? (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="title">Title *</Label>
                                                    <Input
                                                        id="title"
                                                        placeholder="e.g., Professor, Instructor, Teaching Assistant"
                                                        disabled={isLoading}
                                                        className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                                        {...teacherForm.register("title")}
                                                    />
                                                    {teacherForm.formState.errors.title && (
                                                        <p className="text-xs text-red-500 font-medium">
                                                            {teacherForm.formState.errors.title.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="expertise">Area of Expertise *</Label>
                                                    <Textarea
                                                        id="expertise"
                                                        placeholder="Describe your areas of expertise and teaching experience..."
                                                        disabled={isLoading}
                                                        className="min-h-24 bg-zinc-50 dark:bg-zinc-900/50 resize-none"
                                                        {...teacherForm.register("expertise")}
                                                    />
                                                    {teacherForm.formState.errors.expertise && (
                                                        <p className="text-xs text-red-500 font-medium">
                                                            {teacherForm.formState.errors.expertise.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="studentId">Student ID *</Label>
                                                    <Input
                                                        id="studentId"
                                                        placeholder="e.g., STU12345"
                                                        disabled={isLoading}
                                                        className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                                        {...studentForm.register("studentId")}
                                                    />
                                                    {studentForm.formState.errors.studentId && (
                                                        <p className="text-xs text-red-500 font-medium">
                                                            {studentForm.formState.errors.studentId.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="grade">Grade/Year *</Label>
                                                    <Input
                                                        id="grade"
                                                        placeholder="e.g., Grade 10, Year 1, Senior"
                                                        disabled={isLoading}
                                                        className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                                        {...studentForm.register("grade")}
                                                    />
                                                    {studentForm.formState.errors.grade && (
                                                        <p className="text-xs text-red-500 font-medium">
                                                            {studentForm.formState.errors.grade.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="semester">Current Semester *</Label>
                                                    <select
                                                        id="semester"
                                                        disabled={isLoading}
                                                        className="h-11 w-full rounded-md border border-input bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...studentForm.register("semester")}
                                                    >
                                                        <option value="">Select Semester</option>
                                                        <option value="SEM-7">Semester 7</option>
                                                        <option value="SEM-8">Semester 8</option>
                                                    </select>
                                                    {studentForm.formState.errors.semester && (
                                                        <p className="text-xs text-red-500 font-medium">
                                                            {studentForm.formState.errors.semester.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="rounded-xl border bg-zinc-50/80 dark:bg-zinc-900/40 p-4 space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                            Learning setup
                                                        </h3>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                            These MCQ choices initialize your adaptive AI learning memory.
                                                        </p>
                                                    </div>
                                                    <LearningPreferencesFields
                                                        value={learningPreferences}
                                                        onChange={setLearningPreferences}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                disabled={isLoading}
                                                className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                                {...currentForm.register("phone")}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="bio">Bio (Optional)</Label>
                                            <Textarea
                                                id="bio"
                                                placeholder="Tell us a bit about yourself..."
                                                disabled={isLoading}
                                                className="min-h-20 bg-zinc-50 dark:bg-zinc-900/50 resize-none"
                                                {...currentForm.register("bio")}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium text-base"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Setting up your profile...
                                            </>
                                        ) : (
                                            "Complete Setup"
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-8 text-center text-xs text-muted-foreground w-full max-w-[550px]">
                    <p>
                        UI tailored by componentry.fun
                    </p>
                </div>
            </div>
        </div>
    )
}
