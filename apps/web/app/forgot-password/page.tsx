/**
 * @file forgot-password/page.tsx
 * @description Page for users to request a password reset email.
 * @module Apps/Web/Auth
 * @access Public
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Command, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { createClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/ui/aurora-background"

// Schema
const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

type FormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isEmailSent, setIsEmailSent] = React.useState(false)
    const [sentEmail, setSentEmail] = React.useState("")
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    async function onSubmit(data: FormData) {
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            })

            if (error) {
                // Handle common errors
                if (error.message.includes("rate limit")) {
                    toast.error("Too many attempts", {
                        description: "Please wait a while before requesting another email.",
                    })
                } else {
                    toast.error("Failed to send reset email", {
                        description: error.message,
                    })
                }
                setIsLoading(false)
                return
            }

            setSentEmail(data.email)
            setIsEmailSent(true)
            toast.success("Reset email sent", {
                description: "Check your inbox for the password reset link.",
            })
        } catch {
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
                                &ldquo;Security is our priority. Don't worry, we'll help you get back to your learning journey in no time.&rdquo;
                            </p>
                            <footer className="text-sm font-medium text-white/60">
                                ConnectX Security Team
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right Side - Forgot Password Form */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-12 relative">
                <div className="w-full max-w-[350px] mx-auto">
                    <Link
                        href="/auth"
                        className="absolute top-8 left-8 lg:left-12 flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>

                    <AnimatePresence mode="wait">
                        {!isEmailSent ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex flex-col space-y-2 text-center mb-8">
                                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                        Forgot password?
                                    </h1>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                <div className="grid gap-6">
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    placeholder="name@example.com"
                                                    type="email"
                                                    autoCapitalize="none"
                                                    autoComplete="email"
                                                    autoCorrect="off"
                                                    disabled={isLoading}
                                                    className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                                                    {...register("email")}
                                                />
                                                {errors.email && (
                                                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                                                )}
                                            </div>
                                            <Button
                                                disabled={isLoading}
                                                className="mt-2 w-full h-11 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm hover:shadow-md font-medium"
                                            >
                                                {isLoading && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Send Reset Link
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center"
                            >
                                <div className="mb-6 flex justify-center">
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                                    Check your email
                                </h2>

                                <div className="space-y-4 mb-8">
                                    <p className="text-zinc-500 dark:text-zinc-400">
                                        We've sent a password reset link to:
                                    </p>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 py-2 px-4 rounded-lg inline-block">
                                        {sentEmail}
                                    </p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Click the link in the email to set a new password.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 border-zinc-200 dark:border-zinc-800"
                                        onClick={() => setIsEmailSent(false)}
                                    >
                                        Try another email
                                    </Button>

                                    <div>
                                        <Link
                                            href="/auth"
                                            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                                        >
                                            Back to login
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
                        <p className="text-xs text-muted-foreground">
                            If you don't receive an email, check your spam folder.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
