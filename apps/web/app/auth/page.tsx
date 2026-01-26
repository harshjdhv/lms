"use client";

import { AuthForm } from "@/components/auth-form";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Command } from "lucide-react";

export default function AuthPage() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-zinc-950">
            {/* Left Side - Aurora & Branding (Floating Panel) */}
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
                                &ldquo;Design is not just what it looks like and feels like. Design is how it works. We&apos;ve built ConnectX to work seamlessly for you.&rdquo;
                            </p>
                            <footer className="text-sm font-medium text-white/60">
                                Harsh Jadhav &mdash; Lead Engineer
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-12 relative">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[400px]">

                    <AuthForm />
                </div>

                {/* Footer */}
                <div className="mt-8 pt-8 text-center text-xs text-muted-foreground w-full max-w-[400px]">
                    <p>
                        UI tailored by componentry.fun
                    </p>
                </div>
            </div>
        </div>
    );
}
