"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
    password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof userAuthSchema>

export function AuthForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [mode, setMode] = React.useState<"login" | "register">("login")

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
        reset()
        clearErrors()
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
                    toast.error("Login failed", {
                        description: error.message,
                    })
                    return
                }

                toast.success("Welcome back!", {
                    description: "You have successfully logged in.",
                })
                router.push("/dashboard")
                router.refresh()
            } else {
                const { error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })

                if (error) {
                    toast.error("Registration failed", {
                        description: error.message,
                    })
                    return
                }

                toast.success("Account created", {
                    description: "Please check your email to verify your account.",
                })
            }
        } catch {
            toast.error("Something went wrong", {
                description: "Please try again later."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[350px] mx-auto">
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
                                    <a href="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                                        Forgot password?
                                    </a>
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

                <div className="relative my-2"> {/* Added my-2 for vertical rhythm */}
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
                            if (error) throw error;
                        } catch {
                            toast.error("Google sign in failed");
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

            <div className="text-center text-sm mt-8"> {/* Added mt-8 to separate from Google Main Button */}
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

            <p className="text-center text-xs text-muted-foreground w-full mt-6"> {/* Added mt-6 to separate from Sign Up link */}
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
        </div>
    )
}
