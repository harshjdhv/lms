/**
 * @file auth/page.tsx
 * @description Premium Authentication page with 3D visual effects and Supabase integration.
 * @module Apps/Web/Auth
 * @access Public
 */

"use client";

import { AuthForm } from "@/components/auth-form";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AuthPage() {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 overflow-hidden">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 relative z-10">
                <AuthForm />
            </div>

            {/* Right Side - 3D Visuals */}
            <div className="hidden lg:flex relative items-center justify-center bg-zinc-900 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black opacity-80" />

                {/* Animated Mesh Grid */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Floating 3D Elements */}
                <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
                    {/* Main Floating Card */}
                    <motion.div
                        initial={{ transform: "rotateX(0deg) rotateY(0deg) translateZ(0px)" }}
                        animate={{
                            rotateX: [10, -10, 10],
                            rotateY: [-10, 10, -10],
                            translateY: [-20, 20, -20]
                        }}
                        transition={{
                            duration: 10,
                            ease: "easeInOut",
                            repeat: Infinity,
                        }}
                        className="w-[300px] h-[400px] rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl relative z-20 flex flex-col items-center justify-center p-8 text-white group"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-3xl" />

                        <div className="relative z-10 text-center space-y-4 transform hover:scale-105 transition-transform duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/70">
                                Next Gen LMS
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Experience the future of learning management systems.
                            </p>
                        </div>

                        {/* Floating Elements around the card */}
                        <motion.div
                            animate={{ y: [-15, 15, -15], x: [-10, 10, -10] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-blue-500/30 blur-2xl"
                        />
                        <motion.div
                            animate={{ y: [15, -15, 15], x: [10, -10, 10] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-purple-500/30 blur-2xl"
                        />
                    </motion.div>

                    {/* Background Orb */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10"
                    />
                </div>
            </div>
        </div>
    );
}
