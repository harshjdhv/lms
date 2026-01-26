"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { createClient } from "@/lib/supabase/client"

const userAuthSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(72, "Password must not exceed 72 characters"),
})

type FormData = z.infer<typeof userAuthSchema>

export function AuthForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [mode, setMode] = React.useState<"login" | "register">("login")
    const [emailSent, setEmailSent] = React.useState<boolean>(false)
    const [userEmail, setUserEmail] = React.useState<string>("")

    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors,
    } = useForm<FormData>({
        resolver: zodResolver(userAuthSchema),
    })

    const toggleMode = () => {
        setMode(prev => prev === "login" ? "register" : "login")
        setEmailSent(false)
        setUserEmail("")
        reset()
        clearErrors()
    }

    // Debug effect to track emailSent state
    React.useEffect(() => {
        console.log("emailSent state changed:", emailSent)
        console.log("userEmail state:", userEmail)
    }, [emailSent, userEmail])

    // Helper function to format Supabase error messages
    const formatSupabaseError = (error: any): { title: string; description: string } => {
        const message = error?.message || ""

        // Password validation errors
        if (message.includes("Password should be at least")) {
            return {
                title: "Password too short",
                description: "Your password must be at least 6 characters long."
            }
        }

        if (message.includes("Password should contain")) {
            return {
                title: "Weak password",
                description: "Password should contain uppercase, lowercase, numbers, and special characters for better security."
            }
        }

        if (message.includes("Password must contain")) {
            return {
                title: "Password requirements not met",
                description: message
            }
        }

        // Email errors
        if (message.includes("Invalid email")) {
            return {
                title: "Invalid email",
                description: "Please enter a valid email address."
            }
        }

        if (message.includes("User already registered")) {
            return {
                title: "Account already exists",
                description: "An account with this email already exists. Try logging in instead."
            }
        }

        if (message.includes("Email not confirmed")) {
            return {
                title: "Email not verified",
                description: "Please check your email and click the verification link."
            }
        }

        // Login errors
        if (message.includes("Invalid login credentials")) {
            return {
                title: "Login failed",
                description: "Invalid email or password. Please check your credentials and try again."
            }
        }

        if (message.includes("Email not found")) {
            return {
                title: "Account not found",
                description: "No account exists with this email. Try signing up instead."
            }
        }

        // Rate limit
        if (message.includes("rate limit")) {
            return {
                title: "Too many attempts",
                description: "Please wait a moment before trying again."
            }
        }

        // Default error
        return {
            title: "Authentication error",
            description: message || "Something went wrong. Please try again."
        }
    }

    async function onSubmit(data: FormData) {
        setIsLoading(true)

        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                })

                if (error) {
                    const formattedError = formatSupabaseError(error)
                    toast.error(formattedError.title, {
                        description: formattedError.description,
                    })
                    setIsLoading(false)
                    return
                }

                // Check onboarding status
                const response = await fetch("/api/user/profile")
                const { user: dbUser } = await response.json()

                toast.success("Welcome back!", {
                    description: "You have successfully logged in.",
                })

                // Redirect based on onboarding status
                const redirectPath = dbUser?.hasCompletedOnboarding ? "/dashboard" : "/onboarding"
                router.push(redirectPath)
                router.refresh()
            } else {
                console.log("Starting signup process...")
                const { error, data: signUpData } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })

                console.log("Signup response:", { error, signUpData })

                if (error) {
                    console.error("Signup error:", error)
                    const formattedError = formatSupabaseError(error)
                    toast.error(formattedError.title, {
                        description: formattedError.description,
                        duration: 5000, // Show for 5 seconds for signup errors
                    })
                    setIsLoading(false)
                    return
                }

                // Check if user is auto-confirmed (email confirmation disabled)
                if (signUpData?.session) {
                    console.log("User auto-confirmed, redirecting to onboarding...")
                    toast.success("Account created!", {
                        description: "Let's set up your profile.",
                    })
                    router.push("/onboarding")
                    router.refresh()
                } else {
                    // Email confirmation required - show verification screen
                    console.log("Setting email sent state for:", data.email)
                    setUserEmail(data.email)
                    setEmailSent(true)
                    setIsLoading(false)
                    console.log("State updated - should show verification screen now")
                }
            }
        } catch (error) {
            console.error("Caught error in onSubmit:", error)
            const formattedError = formatSupabaseError(error)
            toast.error(formattedError.title, {
                description: formattedError.description,
            })
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[350px] mx-auto">
            <AnimatePresence mode="wait">
                {emailSent ? (
                    <motion.div
                        key="email-sent"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg"
                                >
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <motion.path
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </motion.div>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md"
                                >
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </motion.div>
                            </div>
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3"
                        >
                            Check your email
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-3 mb-8"
                        >
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                We&apos;ve sent a verification link to
                            </p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-lg">
                                {userEmail}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Click the link in the email to verify your account and complete your signup.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                                <p className="text-xs text-blue-900 dark:text-blue-200">
                                    <strong>Next steps:</strong> After verifying your email, you&apos;ll be redirected to complete your profile setup where you can choose your role (Student or Teacher) and provide additional information.
                                </p>
                            </div>

                            <button
                                onClick={toggleMode}
                                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                ← Back to sign in
                            </button>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xs text-zinc-500 dark:text-zinc-500 mt-8"
                        >
                            Didn&apos;t receive the email? Check your spam folder or{" "}
                            <button
                                onClick={() => {
                                    setEmailSent(false)
                                    reset()
                                }}
                                className="underline hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
                            >
                                try again
                            </button>
                        </motion.p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="auth-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col space-y-2 text-center mb-8">
                            <motion.h1
                                key={mode + "-title"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
                            >
                                {mode === "login" ? "Welcome back" : "Create an account"}
                            </motion.h1>
                            <motion.p
                                key={mode + "-desc"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-sm text-zinc-500 dark:text-zinc-400"
                            >
                                {mode === "login"
                                    ? "Enter your credentials to access your account"
                                    : "Enter your email below to create your account"}
                            </motion.p>
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
                                            className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 transition-all"
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            {mode === "login" && (
                                                <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            placeholder="••••••••"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="current-password"
                                            disabled={isLoading}
                                            className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 transition-all"
                                            {...register("password")}
                                        />
                                        {errors.password && (
                                            <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                                        )}
                                    </div>
                                    <Button
                                        disabled={isLoading}
                                        className="mt-2 w-full h-11 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm hover:shadow-md font-medium"
                                    >
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {mode === "login" ? "Sign In" : "Create account"}
                                    </Button>
                                </div>
                            </form>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoading}
                                className="w-full h-11 bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 dark:text-zinc-200 font-medium transition-all"
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        const { error } = await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback`,
                                            },
                                        });
                                        if (error) {
                                            const formattedError = formatSupabaseError(error)
                                            toast.error(formattedError.title, {
                                                description: formattedError.description,
                                            })
                                            setIsLoading(false)
                                        }
                                    } catch (error) {
                                        const formattedError = formatSupabaseError(error)
                                        toast.error(formattedError.title, {
                                            description: formattedError.description,
                                        })
                                        setIsLoading(false);
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                )}
                                Google
                            </Button>
                        </div>

                        <div className="text-center text-sm mt-8">
                            <span className="text-zinc-500 dark:text-zinc-400">
                                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            </span>
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-medium text-zinc-900 dark:text-zinc-100 underline-offset-4 hover:underline transition-all"
                            >
                                {mode === "login" ? "Sign up" : "Sign in"}
                            </button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground w-full mt-6">
                            By clicking continue, you agree to our{" "}
                            <a
                                href="/terms"
                                className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Terms
                            </a>{" "}
                            and{" "}
                            <a
                                href="/privacy"
                                className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
