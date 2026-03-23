"use client";

import { AuthForm } from "@/components/auth-form";
import { AuroraBackground } from "@/components/ui/aurora-background";

function ConnectXMark({ size = 30, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="430 310 345 275"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="
          M 430 505
          Q 430 585 450 585
          L 515 585
          Q 530 585 540 570
          L 615 475
          Q 622 465 632 470
          Q 642 475 645 490
          L 660 560
          Q 665 585 690 585
          L 755 585
          Q 775 585 775 565
          L 775 455
          Q 775 435 755 435
          L 690 435
          Q 665 435 662 410
          L 650 330
          Q 648 310 630 310
          L 585 310
          Q 565 310 552 330
          L 445 480
          Q 430 495 430 505
          Z
        "
                fill="currentColor"
            />
        </svg>
    );
}

export default function AuthPage() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-zinc-950">
            {/* Left Side - Aurora & Branding (Floating Panel) */}
            <div className="hidden lg:block p-3 h-screen sticky top-0">
                <div className="relative h-full w-full flex-col justify-between overflow-hidden rounded-4xl bg-zinc-900 flex">
                    {/* Background Layer */}
                    <div className="absolute inset-0 z-0">
                        <AuroraBackground className="h-full w-full bg-zinc-900!" showRadial={true} />
                    </div>

                    {/* Branding Top Left */}
                    <div className="relative z-20 flex items-center gap-1 p-10">
                        <ConnectXMark size={28} className="text-white" />
                        <span className="font-black text-lg text-white tracking-tight leading-none">ConnectX</span>
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
