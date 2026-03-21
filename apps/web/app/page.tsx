"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ScrollStack, { ScrollStackItem } from "@/components/ui/scroll-stack";

const WORDS = [
  "AI", "pair", "programming,", "real-time", "collaboration,", "3D",
  "visualizations,", "IoT", "simulations", "—", "the", "engineering",
  "education", "platform", "your", "students", "deserve.",
];

function lerpColor(t: number): string {
  const v = Math.round(0x38 + (0xf0 - 0x38) * Math.max(0, Math.min(1, t)));
  return `rgb(${v},${v},${v})`;
}

// ─── Features data ────────────────────────────────────────────────────────────
const features = [
  {
    tag: "AI Coding",
    title: "AI Pair Programming",
    desc: "Get instant suggestions, bug explanations, and refactoring help powered by Claude — right inside the classroom editor.",
    accent: "#7c3aed",
    tagBg: "#ede9fe",
    tagColor: "#6d28d9",
    cardBg: "#faf9ff",
  },
  {
    tag: "Live Sync",
    title: "Real-time Collaboration",
    desc: "Students and instructors edit the same file simultaneously. Cursors, selections, and comments — all live.",
    accent: "#2563eb",
    tagBg: "#dbeafe",
    tagColor: "#1d4ed8",
    cardBg: "#f8faff",
  },
  {
    tag: "3D Visuals",
    title: "Algorithm Visualizations",
    desc: "Sorting, trees, graphs, and pathfinding rendered in interactive 3D. Watch the algorithm step by step.",
    accent: "#059669",
    tagBg: "#d1fae5",
    tagColor: "#047857",
    cardBg: "#f6fffe",
  },
  {
    tag: "IoT Lab",
    title: "IoT Simulations",
    desc: "Simulate sensors, microcontrollers, and circuits in the browser. No hardware required for lab day one.",
    accent: "#d97706",
    tagBg: "#fef3c7",
    tagColor: "#b45309",
    cardBg: "#fffdf6",
  },
  {
    tag: "Auto-Grade",
    title: "Smart Grading",
    desc: "AI grades every submission instantly with detailed feedback on correctness, efficiency, and code quality.",
    accent: "#db2777",
    tagBg: "#fce7f3",
    tagColor: "#be185d",
    cardBg: "#fff8fc",
  },
];

// ─── Features section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section className="w-full" style={{ backgroundColor: "#FBFBFB" }}>
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="max-w-xl md:pl-10 lg:pl-16 lg:sticky lg:top-24">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-4 block">
              Platform Features
            </span>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-semibold leading-[1.1] tracking-tight text-black mb-5">
              Everything engineering education needs
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              From AI-assisted coding to hardware simulations — ConnectX brings the full
              engineering stack into the classroom.
            </p>

            <Link
              href="/auth"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-black underline underline-offset-4 hover:text-neutral-600 transition-colors w-fit"
            >
              Explore all features
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div className="mt-10 space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: f.tagBg }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.accent }} />
                  </div>
                  <span className="text-sm text-neutral-500">{f.title}</span>
                </div>
              ))}
            </div>
          </div>

          <ScrollStack
            useWindowScroll
            itemDistance={60}
            itemScale={0.03}
            itemStackDistance={20}
            stackPosition="20%"
            baseScale={0.88}
          >
            {features.map((feature) => (
              <ScrollStackItem
                key={feature.title}
                itemClassName="border border-neutral-200"
                style={{
                  backgroundColor: feature.cardBg,
                  height: "auto",
                  padding: "1.5rem",
                  borderRadius: "1rem",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                }}
              >
                <span
                  className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: feature.tagBg, color: feature.tagColor }}
                >
                  {feature.tag}
                </span>
                <h3 className="mt-3 text-base font-semibold tracking-tight text-neutral-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                  {feature.desc}
                </p>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh - rect.top) / (rect.height + vh);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip font-sans" style={{ backgroundColor: "#FBFBFB" }}>

      {/* Top section — vertical bars */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-[max(0px,calc(50%-40rem))] w-px bg-neutral-300 z-0" />
        <div className="pointer-events-none absolute inset-y-0 right-[max(0px,calc(50%-40rem))] w-px bg-neutral-300 z-0" />

        {/* Navbar */}
        <header className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="font-semibold text-[15px] text-black tracking-tight">ConnectX</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-neutral-600">
            <Link href="#" className="hover:text-black transition-colors">Features</Link>
            <Link href="#" className="hover:text-black transition-colors">Courses</Link>
            <Link href="#" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-black transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-neutral-600 hover:text-black transition-colors font-medium">
              Log in
            </Link>
            <Link
              href="/auth"
              className="text-sm bg-black text-white px-4 py-2 rounded-full font-medium hover:bg-neutral-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </header>

        {/* Horizontal rule with plus markers */}
        <div className="relative z-10 w-full h-px bg-neutral-300">
          <div className="absolute left-[max(0px,calc(50%-40rem))] top-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5" />
              <line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute right-[max(0px,calc(50%-40rem))] top-0 translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5" />
              <line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Hero */}
        <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32">
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-4 py-1.5 text-xs text-neutral-600 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Now with AI-powered learning paths
          </div>

          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.1] tracking-tight text-black max-w-2xl">
            The LMS Built for Engineering Education
          </h1>

          <p className="mt-4 text-sm text-neutral-500 max-w-md leading-relaxed">
            AI pair programming, IoT simulations, real-time collaboration, and
            3D algorithm visualizations — all in one platform.
          </p>

          <div className="mt-10 flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Start for free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-6 py-3 rounded-full border border-neutral-200 hover:border-neutral-400 transition-colors shadow-sm"
            >
              Watch demo
            </Link>
          </div>

          <p className="mt-5 text-xs text-neutral-400">
            No credit card required · Free 14-day trial · Cancel anytime
          </p>

          {/* App preview */}
          <div className="mt-20 relative w-full max-w-5xl">
            <style>{`
              @keyframes lms-float  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
              @keyframes lms-float2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)}  }
              @keyframes lms-float3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)}  }
              @keyframes lms-pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
              @keyframes lms-prog1  { from{width:0} to{width:100%} }
              @keyframes lms-prog2  { from{width:0} to{width:72%}  }
              @keyframes lms-prog3  { from{width:0} to{width:38%}  }
              @keyframes lms-in     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="absolute inset-x-1/4 top-10 h-48 bg-violet-100/50 blur-3xl rounded-full pointer-events-none" />

            <div className="relative flex items-start justify-center gap-5 pb-20">
              {/* Left card — Submissions */}
              <div
                className="mt-16 w-60 bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden shrink-0"
                style={{ animation: "lms-float 6s ease-in-out infinite" }}
              >
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-[11px] font-semibold text-neutral-700">Submissions · Week 4</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">Binary Search Trees</p>
                </div>
                <div className="divide-y divide-neutral-50">
                  {[
                    { name: "Sarah J.",  score: 92,   status: "Graded",  dot: "bg-green-400" },
                    { name: "Mike T.",   score: 88,   status: "Graded",  dot: "bg-green-400" },
                    { name: "Emma R.",   score: null, status: "Pending", dot: "bg-amber-400" },
                    { name: "Liam K.",   score: 95,   status: "Graded",  dot: "bg-green-400" },
                    { name: "Priya S.", score: null, status: "Pending", dot: "bg-amber-400" },
                    { name: "Alex M.",   score: 79,   status: "Graded",  dot: "bg-green-400" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                          <span className="text-[8px] font-semibold text-neutral-500">{s.name[0]}</span>
                        </div>
                        <span className="text-[10px] text-neutral-600">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className="text-[10px] font-semibold text-neutral-700 w-5 text-right">{s.score ?? "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center card — BST course */}
              <div
                className="w-72 bg-white rounded-2xl border-2 border-violet-400/80 shadow-2xl overflow-hidden shrink-0 relative z-10"
                style={{ animation: "lms-float2 5s ease-in-out infinite 0.4s" }}
              >
                <div className="bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-center" style={{ height: "170px" }}>
                  <svg width="210" height="130" viewBox="0 0 210 130" fill="none">
                    <line x1="105" y1="26" x2="58" y2="76" stroke="#e5e7eb" strokeWidth="1.5" />
                    <line x1="105" y1="26" x2="152" y2="76" stroke="#e5e7eb" strokeWidth="1.5" />
                    <line x1="58" y1="76" x2="32" y2="114" stroke="#e5e7eb" strokeWidth="1.5" />
                    <line x1="58" y1="76" x2="82" y2="114" stroke="#e5e7eb" strokeWidth="1.5" />
                    <line x1="152" y1="76" x2="128" y2="114" stroke="#e5e7eb" strokeWidth="1.5" />
                    <line x1="152" y1="76" x2="176" y2="114" stroke="#e5e7eb" strokeWidth="1.5" />
                    <circle cx="105" cy="22" r="18" fill="#7c3aed" />
                    <text x="105" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">50</text>
                    <circle cx="58" cy="72" r="15" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
                    <text x="58" y="76" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">25</text>
                    <circle cx="152" cy="72" r="15" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
                    <text x="152" y="76" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">75</text>
                    <circle cx="32" cy="110" r="12" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                    <text x="32" y="114" textAnchor="middle" fill="#9ca3af" fontSize="8">12</text>
                    <circle cx="82" cy="110" r="12" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                    <text x="82" y="114" textAnchor="middle" fill="#9ca3af" fontSize="8">37</text>
                    <circle cx="128" cy="110" r="12" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                    <text x="128" y="114" textAnchor="middle" fill="#9ca3af" fontSize="8">63</text>
                    <circle cx="176" cy="110" r="12" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="1.5" />
                    <text x="176" y="114" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="600">88</text>
                  </svg>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[9px] bg-violet-100 text-violet-600 font-semibold px-2 py-0.5 rounded-full">Week 4</span>
                    <span className="text-[9px] bg-neutral-100 text-neutral-500 font-medium px-2 py-0.5 rounded-full">Algorithms</span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-800">Binary Search Trees</h3>
                  <p className="text-[10px] text-neutral-500 mt-1.5 leading-relaxed">
                    Understand insertion, deletion &amp; traversal. Complexity analysis with interactive 3D visualizations.
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                    Complete the coding challenge to unlock your next AI-personalized module.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" style={{ animation: "lms-pulse 1.4s ease-in-out infinite" }} />
                    <span className="text-[9px] text-violet-500 font-medium">AI grading submissions...</span>
                  </div>
                </div>
              </div>

              {/* Right card — AI Feedback */}
              <div
                className="mt-24 w-60 bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden shrink-0"
                style={{ animation: "lms-float3 5.5s ease-in-out infinite 1s" }}
              >
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-700">AI Feedback</p>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Sarah Johnson · 92/100</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-green-600">A</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: "Correctness",     score: "95%", anim: "lms-prog1", c: "bg-green-400" },
                    { label: "Time Complexity", score: "88%", anim: "lms-prog2", c: "bg-violet-400" },
                    { label: "Code Quality",    score: "90%", anim: "lms-prog3", c: "bg-blue-400" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-neutral-500">{m.label}</span>
                        <span className="text-[9px] font-semibold text-neutral-700">{m.score}</span>
                      </div>
                      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className={`h-full ${m.c} rounded-full`} style={{ width: m.score, animation: `${m.anim} 1.4s ease-out both` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 space-y-1.5">
                    <div className="h-2 bg-neutral-100 rounded-full w-full" />
                    <div className="h-2 bg-neutral-100 rounded-full w-4/5" />
                    <div className="h-2 bg-neutral-100 rounded-full w-3/4" />
                    <div className="h-2 bg-neutral-100 rounded-full w-2/3" />
                    <div className="h-2 bg-neutral-100 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom status pill */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ animation: "lms-in 0.5s ease-out 0.8s both" }}>
              <div className="flex items-center gap-2 bg-neutral-900 text-white text-[11px] font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{ animation: "lms-pulse 1.2s ease-in-out infinite" }} />
                Grading 3 submissions with AI
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
                  <rect x="5.5" y="1" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.9" />
                  <rect x="10" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
                  <rect x="1" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.9" />
                  <rect x="5.5" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
                  <rect x="10" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.9" />
                  <rect x="1" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
                  <rect x="5.5" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.9" />
                  <rect x="10" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>
        </main>

        <div className="w-full h-px bg-neutral-300" />
      </div>

      {/* Dark statement section */}
      <section className="relative w-full px-6 py-10">
        <div
          ref={sectionRef}
          className="relative rounded-2xl py-28 px-8 overflow-hidden"
          style={{ backgroundColor: "#1A1A1C" }}
        >
          <p className="max-w-4xl mx-auto text-center text-[clamp(1.9rem,4vw,3.2rem)] font-semibold leading-tight tracking-tight">
            {WORDS.map((word, i) => {
              const n = WORDS.length;
              const t = progress * (n + 4) - i;
              return (
                <span
                  key={i}
                  className="inline-block mr-[0.28em]"
                  style={{ color: lerpColor(t) }}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </section>

      {/* Grid section: Features + Footer */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-[max(0px,calc(50%-40rem))] w-px bg-neutral-300 z-0" />
        <div className="pointer-events-none absolute inset-y-0 right-[max(0px,calc(50%-40rem))] w-px bg-neutral-300 z-0" />

        {/* Top rule with + markers */}
        <div className="relative z-10 w-full h-px bg-neutral-300">
          <div className="absolute left-[max(0px,calc(50%-40rem))] top-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5"/><line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5"/></svg>
          </div>
          <div className="absolute right-[max(0px,calc(50%-40rem))] top-0 translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5"/><line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5"/></svg>
          </div>
        </div>

        {/* Features section */}
        <FeaturesSection />

        {/* Mid rule with + markers */}
        <div className="relative z-10 w-full h-px bg-neutral-300">
          <div className="absolute left-[max(0px,calc(50%-40rem))] top-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5"/><line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5"/></svg>
          </div>
          <div className="absolute right-[max(0px,calc(50%-40rem))] top-0 translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5"/><line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5"/></svg>
          </div>
        </div>

      {/* Footer */}
      <footer className="w-full" style={{ backgroundColor: "#FBFBFB" }}>
        <div className="max-w-7xl mx-auto px-8 pt-20 pb-10">

          {/* Big wordmark */}
          <p
            className="font-semibold leading-none tracking-tighter text-black select-none"
            style={{ fontSize: "clamp(4rem, 13vw, 11rem)" }}
          >
            ConnectX
          </p>

          {/* Tagline + CTA row */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
              The LMS built for engineering education. AI, IoT, 3D — all in one.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors shrink-0"
            >
              Start for free
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Bottom strip */}
          <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-400">© {new Date().getFullYear()} ConnectX. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {["Features", "Pricing", "Privacy", "Terms"].map((item) => (
                <Link key={item} href="#" className="text-xs text-neutral-400 hover:text-black transition-colors">
                  {item}
                </Link>
              ))}
              <div className="flex items-center gap-4 ml-2">
                <Link href="#" className="text-neutral-400 hover:text-black transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link href="#" className="text-neutral-400 hover:text-black transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </footer>

        {/* Bottom rule with + markers */}
        <div className="relative z-10 w-full h-px bg-neutral-300">
          <div className="absolute left-[max(0px,calc(50%-40rem))] top-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5"/><line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5"/></svg>
          </div>
          <div className="absolute right-[max(0px,calc(50%-40rem))] top-0 translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10" y1="4" x2="10" y2="16" stroke="#a3a3a3" strokeWidth="1.5"/><line x1="4" y1="10" x2="16" y2="10" stroke="#a3a3a3" strokeWidth="1.5"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
