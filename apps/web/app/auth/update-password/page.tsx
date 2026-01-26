/**
 * @file auth/update-password/page.tsx
 * @description Page for resetting password after clicking email link.
 * @module Apps/Web/Auth
 * @access Public
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Command, CheckCircle2, Lock } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { createClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/ui/aurora-background"

// Schema
const updatePasswordSchema = z.object({
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(72, "Password must not exceed 72 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type FormData = z.infer<typeof updatePasswordSchema>

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(updatePasswordSchema),
    })

    // Helper for error formatting (reusing the one we made)
    const formatSupabaseError = (error: any) => {
        const message = error?.message || ""
        if (message.includes("Password should be at least")) return "Password must be at least 6 characters long."
        if (message.includes("Password should contain")) return "Password needs to be stronger."
        return message
    }

    async function onSubmit(data: FormData) {
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            })

            if (error) {
                toast.error("Failed to update password", {
                    description: formatSupabaseError(error),
                })
                setIsLoading(false)
                return
            }

            setIsSuccess(true)
            toast.success("Password updated!", {
                description: "You can now log in with your new password.",
            })

            // Add a small delay before redirect
            setTimeout(() => {
                router.push("/auth")
            }, 3000)

        } catch {
            toast.error("Something went wrong", {
                description: "Please try again later.",
            })
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
                                &ldquo;Your security is our priority. Set a strong password to keep your learning progress safe and secure.&rdquo;
                            </p>
                            <footer className="text-sm font-medium text-white/60">
                                ConnectX Security Team
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right Side - Update Password Form */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-12 relative">
                <div className="w-full max-w-[350px] mx-auto">
                    {!isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col space-y-2 text-center mb-8">
                                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    Set new password
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Please enter your new password below.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">New Password</Label>
                                            <Input
                                                id="password"
                                                placeholder="••••••••"
                                                type="password"
                                                disabled={isLoading}
                                                className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                                {...register("password")}
                                            />
                                            {errors.password && (
                                                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                placeholder="••••••••"
                                                type="password"
                                                disabled={isLoading}
                                                className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                                {...register("confirmPassword")}
                                            />
                                            {errors.confirmPassword && (
                                                <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                                            )}
                                        </div>

                                        <Button
                                            disabled={isLoading}
                                            className="mt-2 w-full h-11 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                                        >
                                            {isLoading && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                                Password updated!
                            </h2>

                            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                                Your password has been successfully reset. Redirecting you to login...
                            </p>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={async () => {
                                    try {
                                        await supabase.auth.signOut()
                                    } finally {
                                        router.push("/auth")
                                    }
                                }}
                            >
                                Return to Login
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
