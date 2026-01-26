"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import { createClient } from "@/lib/supabase/client"

const userAuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof userAuthSchema>

export function AuthForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [activeTab, setActiveTab] = React.useState<"login" | "register">("login")

    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(userAuthSchema),
    })

    async function onSubmit(data: FormData) {
        setIsLoading(true)

        try {
            if (activeTab === "login") {
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
            // generic error
            toast.error("Something went wrong", {
                description: "Please try again later."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[400px]">
            <Tabs
                defaultValue="login"
                onValueChange={(val) => {
                    setActiveTab(val as "login" | "register")
                    reset()
                }}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-100 dark:bg-zinc-800 p-1 h-auto rounded-full border border-zinc-200 dark:border-zinc-700">
                    <TabsTrigger
                        value="login"
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm py-2.5 transition-all duration-300"
                    >
                        Login
                    </TabsTrigger>
                    <TabsTrigger
                        value="register"
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm py-2.5 transition-all duration-300"
                    >
                        Register
                    </TabsTrigger>
                </TabsList>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <Card className="border-0 shadow-none bg-transparent">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight">
                                {activeTab === "login" ? "Welcome back" : "Create an account"}
                            </CardTitle>
                            <CardDescription>
                                {activeTab === "login"
                                    ? "Enter your credentials to access your account"
                                    : "Enter your email below to create your account"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                            className="h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 focus-visible:ring-offset-0 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 transition-all duration-200"
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-500">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            placeholder="••••••••"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="current-password"
                                            disabled={isLoading}
                                            className="h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 focus-visible:ring-offset-0 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 transition-all duration-200"
                                            {...register("password")}
                                        />
                                        {errors.password && (
                                            <p className="text-xs text-red-500">{errors.password.message}</p>
                                        )}
                                    </div>
                                    <Button disabled={isLoading} className="mt-2 w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors h-11 text-base font-medium">
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {activeTab === "login" ? "Sign In" : "Sign Up"}
                                    </Button>
                                </div>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoading}
                                className="w-full h-11 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300 font-medium"
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
                                        // OAuth redirect happens automatically
                                    } catch {
                                        toast.error("Google sign in failed");
                                        setIsLoading(false);
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )}
                                Google
                            </Button>
                        </CardContent>
                        <CardFooter>
                            <p className="px-8 text-center text-sm text-muted-foreground w-full">
                                By clicking continue, you agree to our{" "}
                                <a
                                    href="/terms"
                                    className="underline underline-offset-4 hover:text-primary transition-colors"
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="/privacy"
                                    className="underline underline-offset-4 hover:text-primary transition-colors"
                                >
                                    Privacy Policy
                                </a>
                                .
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </Tabs>
        </div>
    )
}
