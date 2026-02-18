"use client";

import React from "react";

const Button = ({
    children,
    className,
    variant = "grey",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "grey" | "blue" }) => {

    // Stats from image:
    // Fill: #E3E3E3 (80%) -> rgba(227, 227, 227, 0.8)
    // Shadow 1: Color #000 (10%), X:0 Y:2 Blur:4 Spread:0
    // Shadow 2: Color #000 (16%), X:0 Y:0 Blur:0 Spread:1

    // CSS box-shadow equivalent:
    // 0px 2px 4px 0px rgba(0, 0, 0, 0.1), 
    // 0px 0px 0px 1px rgba(0, 0, 0, 0.16)

    // Gradient Stroke approximation (top to bottom fade):
    // We can approximate the stroke with an inner shadow or border-image, 
    // but for a clean button, standard gradient borders often look best as a subtle ring 
    // or we stick to the shadows provided which define the shape well.
    // The "Stroke" 0% #FDFDFD -> 100% #F1F1F1(0%) implies a white top-border fading out.
    // We'll mimic this with an inset top shadow or a gradient border overlay.

    const baseStyles = "relative px-6 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm";

    // Grey Variant
    // Fill: rgba(227, 227, 227, 0.8)
    const greyStyles = {
        backgroundColor: "rgba(227, 227, 227, 0.8)",
        color: "#1a1a1a",
        boxShadow: `
          0px 2px 4px 0px rgba(0, 0, 0, 0.05), 
          0px 0px 0px 1px rgba(0, 0, 0, 0.1), 
          0px 0px 12px 0px rgba(0, 0, 0, 0.05), 
          inset 0px 1px 0px 0px rgba(255, 255, 255, 0.6)
        `
    };

    // Blue Variant (Sky Blue)
    // We'll map the "sky blue" to something like #38BDF8 (Sky 400) or #0EA5E9 (Sky 500)
    // Detailed to match the "stats" structure but with blue fill.
    const blueStyles = {
        backgroundColor: "rgba(56, 189, 248, 0.9)", // Sky blue
        color: "#ffffff",
        boxShadow: `
          0px 2px 4px 0px rgba(0, 0, 0, 0.05), 
          0px 0px 0px 1px rgba(56, 189, 248, 0.5), 
          0px 0px 12px 0px rgba(56, 189, 248, 0.35), 
          inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4)
        `
    };

    return (
        <button
            className={`${baseStyles} ${className}`}
            style={variant === "grey" ? greyStyles : blueStyles}
            {...props}
        >
            {/* Simulating the Gradient Stroke #FDFDFD to Transparent using a pseudo-element overlay if needed, 
            but the inset shadow above handles the 'top light' effect well. 
            For exact 'gradient border', we'd need a mask or SVG. 
            Given simplicity, the box-shadow combination is the most 'exact' replica of the visual stats card blocks.
        */}
            {children}
        </button>
    );
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center gap-12 p-8 font-sans">

            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-bold text-neutral-800">Button Design Replication</h1>
                <p className="text-neutral-500">Based on provided Figma stats</p>
            </div>

            <div className="flex items-center gap-8 p-12 rounded-3xl bg-white shadow-sm border border-neutral-100">

                {/* Grey Button (Reject style) */}
                <div className="flex flex-col gap-4 items-center">
                    <span className="text-xs font-mono text-neutral-400">Variant: Grey</span>
                    <Button variant="grey">
                        Cancel Operation
                    </Button>
                </div>

                {/* Sky Blue Button */}
                <div className="flex flex-col gap-4 items-center">
                    <span className="text-xs font-mono text-neutral-400">Variant: Sky Blue</span>
                    <Button variant="blue">
                        Confirm Action
                    </Button>
                </div>

            </div>

            <div className="grid grid-cols-2 gap-8 text-xs font-mono text-neutral-400 max-w-lg">
                <div className="space-y-2">
                    <p className="font-bold text-neutral-600">Stats Applied:</p>
                    <p>Fill: 80% Opacity</p>
                    <p>Shadow A: 0 2px 4px (10%)</p>
                    <p>Shadow B: 0 0 0 1px (16%)</p>
                </div>
            </div>

        </div>
    );
}