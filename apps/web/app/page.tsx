"use client"

import * as React from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame
} from "framer-motion"
import {
  ChevronRight,
  Play,
  Zap,
  Command,
  Activity,
  Globe,
  Server,
  Code,
  Shield,
  Lock,
  Sparkles
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"

// --- Sections ---

function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 sm:px-6"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div
        className={cn(
          "flex items-center justify-between w-full max-w-7xl px-4 py-3 rounded-full transition-all duration-500 ease-in-out",
          scrolled
            ? "bg-white/80 backdrop-blur-md border border-neutral-200/50 shadow-sm"
            : "bg-transparent border border-transparent"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="size-9 bg-black rounded-lg flex items-center justify-center text-white">
            <Command className="size-5" />
          </div>
          <span className="font-bold tracking-tight text-lg text-neutral-900">
            ConnectX
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {["Overview", "Features", "Pricing", "Stories"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black rounded-full hover:bg-neutral-100/50 transition-all"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth" className="text-sm font-medium hover:opacity-70 transition-opacity hidden sm:block">
            Log in
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

function Hero() {
  const { scrollY } = useScroll()
  // Relaxed the range so it doesn't disappear too quickly
  const y = useTransform(scrollY, [0, 1000], [0, 200])
  const opacity = useTransform(scrollY, [0, 800], [1, 0.5])
  const rotateX = useTransform(scrollY, [0, 1000], [20, 0])
  const scale = useTransform(scrollY, [0, 1000], [0.95, 1.05])

  return (
    <section className="relative min-h-[140vh] flex flex-col items-center pt-40 overflow-hidden bg-[#F5F5F7]">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center z-10 px-4 mb-20 relative"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 shadow-sm mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs font-semibold text-neutral-600 tracking-wide uppercase">Powered by ConnectX</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-black mb-6 leading-[0.9]">
          Knowledge,<br />
          <span className="bg-clip-text text-transparent bg-linear-to-b from-neutral-800 to-neutral-400">
            Beautifully Organized.
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-lg text-neutral-500 font-medium leading-relaxed mb-10">
          The learning management system that feels less like a tool
          and more like a superpower.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105">
            Start Free Trial
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 cursor-pointer hover:opacity-70 transition-opacity">
            <div className="size-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
              <Play className="size-4 ml-0.5 fill-black" />
            </div>
            Watch the film
          </div>
        </div>
      </motion.div>

      {/* 3D Mockup Container */}
      <div className="perspective-1000 w-full max-w-7xl px-4 relative z-20">
        <motion.div
          style={{ rotateX, y, opacity, scale }}
          initial={{ rotateX: 40, opacity: 0, y: 100 }}
          animate={{ rotateX: 20, opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto rounded-t-3xl border-[6px] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden aspect-video origin-bottom"
        >
          {/* Simulated Screen Content is rendered here as pure SVG/HTML to avoid images */}
          <div className="absolute inset-0 bg-white rounded-t-2xl overflow-hidden flex flex-col">
            {/* App Header */}
            <div className="h-12 border-b border-neutral-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex gap-4">
                <div className="w-4 h-4 rounded-full bg-neutral-100" />
                <div className="w-20 h-4 rounded-full bg-neutral-100" />
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">JS</span>
                </div>
              </div>
            </div>

            {/* App Body */}
            <div className="flex-1 flex bg-neutral-50/50">
              {/* Sidebar */}
              <div className="w-64 border-r border-neutral-100 bg-white p-4 hidden md:block">
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-full rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors flex items-center px-3 gap-3">
                      <div className="size-4 bg-neutral-200 rounded-sm" />
                      <div className="h-2 w-20 bg-neutral-200 rounded-full" />
                    </div>
                  ))}
                  <div className="h-px bg-neutral-100 my-4" />
                  <div className="h-10 w-full rounded-lg bg-blue-50/50 text-blue-600 flex items-center px-3 gap-3 border border-blue-100">
                    <Zap className="size-4" />
                    <span className="text-xs font-bold">Deep Focus Mode</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex-1 p-8 overflow-hidden">
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <div className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">My Progress</div>
                      <div className="text-neutral-500">Keep up the momentum, Harsh!</div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-600">This Week</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="size-10 bg-neutral-100 rounded-full mb-4 flex items-center justify-center">
                          <Activity className="size-5 text-neutral-400" />
                        </div>
                        <div className="text-2xl font-bold text-neutral-900 mb-1">94%</div>
                        <div className="text-sm text-neutral-500">Course Completion</div>
                      </div>
                    ))}
                  </div>

                  <div className="h-64 bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Command className="size-32" />
                    </div>
                    <div className="flex items-end h-full gap-4 pt-10">
                      {[30, 45, 60, 40, 70, 85, 95, 80, 60, 50, 65, 75].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-neutral-900 rounded-t-md opacity-20 hover:opacity-100 hover:bg-blue-600 transition-all cursor-pointer"
                          initial={{ height: "0%" }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.05, ease: "backOut" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glass Reflection Overlay */}
          <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-30" />
        </motion.div>
      </div>

      {/* Floor reflection (simulated) */}
      <div className="absolute bottom-0 w-full h-40 bg-linear-to-t from-[#F5F5F7] to-transparent z-30" />
    </section>
  )
}

// --- Velocity Scroll Component ---
function VelocityText() {
  const { scrollY } = useScroll();
  const baseVelocity = -15;
  const smoothVelocity = useSpring(scrollY, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useMotionValue(0);
  const directionFactor = React.useRef<number>(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    let newX = x.get() + moveBy;

    // Wrap the x value to create infinite loop
    // Adjust this value based on your content width
    const wrapAt = -2000; // negative because we're scrolling left
    if (newX < wrapAt) {
      newX = 0;
    } else if (newX > 0) {
      newX = wrapAt;
    }

    x.set(newX);
  });

  return (
    <div className="relative py-32 bg-linear-to-br from-neutral-50 via-white to-blue-50/30 border-y border-neutral-200/50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

      <div className="relative flex whitespace-nowrap">
        <motion.div
          style={{ x }}
          className="flex gap-24 items-center"
        >
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-5xl md:text-7xl lg:text-8xl font-black text-black tracking-tighter select-none">
                Structure your knowledge.
              </span>
              <div className="size-3 rounded-full bg-blue-500 shrink-0" />
              <span className="text-5xl md:text-7xl lg:text-8xl font-black text-blue-600 tracking-tighter select-none">
                Empower your students.
              </span>
              <div className="size-3 rounded-full bg-purple-500 shrink-0" />
              <span className="text-5xl md:text-7xl lg:text-8xl font-black text-black tracking-tighter select-none">
                Build with confidence.
              </span>
              <div className="size-3 rounded-full bg-neutral-400 shrink-0" />
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// --- Modern Features Section ---
function ModernFeatures() {
  return (
    <section className="bg-white py-32 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-black">
            Built for the future.
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Everything you need to create, manage, and scale your learning platform.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Feature 1 - Large Card */}
          <motion.div
            className="md:col-span-2 bg-neutral-50 border-2 border-neutral-200 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-neutral-300 transition-all hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center size-14 bg-blue-100 rounded-2xl mb-6">
                <Code className="size-7 text-blue-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-black mb-4 tracking-tight">
                Drag & Drop Course Builder
              </h3>
              <p className="text-lg text-neutral-600 mb-8 max-w-xl">
                Create complex learning paths with our intuitive visual editor. Add videos, quizzes, assignments, and live sessions with zero code.
              </p>

              {/* Visual Demo */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="bg-white border-2 border-neutral-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 transition-all"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div className="size-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                      {i}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-32 bg-neutral-200 rounded-full mb-2" />
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full" />
                    </div>
                    <ChevronRight className="size-5 text-neutral-400" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feature 2 - Tall Card */}
          <motion.div
            className="bg-neutral-50 border-2 border-neutral-200 rounded-3xl p-8 relative overflow-hidden group hover:border-neutral-300 transition-all hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative z-10 h-full flex flex-col">
              <div className="inline-flex items-center justify-center size-14 bg-purple-100 rounded-2xl mb-6">
                <Activity className="size-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">
                Real-time Analytics
              </h3>
              <p className="text-neutral-600 mb-8">
                Track every metric that matters. Student engagement, completion rates, and more.
              </p>

              {/* Chart Visual */}
              <div className="flex-1 flex items-end gap-2 mt-auto">
                {[40, 70, 50, 90, 60, 80, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-purple-500 rounded-t-lg"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.05, type: "spring" }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feature 3 - Wide Card */}
          <motion.div
            className="md:col-span-2 bg-neutral-50 border-2 border-neutral-200 rounded-3xl p-8 relative overflow-hidden group hover:border-neutral-300 transition-all hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center justify-center size-14 bg-green-100 rounded-2xl mb-6">
                  <Shield className="size-7 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-4 tracking-tight">
                  Enterprise Security
                </h3>
                <p className="text-lg text-neutral-600 mb-6">
                  SOC2 Type II certified. Your data encrypted at rest and in transit. GDPR compliant.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['SSO', 'RBAC', '2FA', 'Audit Logs'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium border-2 border-green-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lock Visual */}
              <div className="relative">
                <motion.div
                  className="size-32 border-4 border-green-200 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Lock className="size-16 text-green-300" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 border-4 border-dashed border-green-300 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Feature 4 - Square Card */}
          <motion.div
            className="bg-neutral-50 border-2 border-neutral-200 rounded-3xl p-8 relative overflow-hidden group hover:border-neutral-300 transition-all hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center size-14 bg-orange-100 rounded-2xl mb-6">
                <Sparkles className="size-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">
                AI-Powered
              </h3>
              <p className="text-neutral-600 mb-6">
                Smart recommendations, automated grading, and personalized learning paths.
              </p>

              {/* AI Chat Bubbles */}
              <div className="space-y-3">
                <motion.div
                  className="bg-white border-2 border-neutral-200 rounded-2xl rounded-tr-sm p-3 text-sm text-neutral-700 ml-auto w-fit max-w-[80%]"
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  Explain this concept
                </motion.div>
                <motion.div
                  className="bg-orange-500 rounded-2xl rounded-tl-sm p-3 text-sm text-white w-fit max-w-[80%]"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex gap-1 mb-2">
                    <motion.div className="size-1.5 bg-white rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                    <motion.div className="size-1.5 bg-white rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="size-1.5 bg-white rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-black text-white py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 max-w-3xl mx-auto">
            Ready to transform your <br />
            <span className="text-neutral-500">teaching experience?</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-2xl">
            Join thousands of educators who are already building the future of learning with ConnectX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-6 h-14 text-white placeholder:text-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <Button className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all hover:scale-105">
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-neutral-800 pt-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="size-8 bg-white rounded-lg flex items-center justify-center text-black">
                <Command className="size-5" />
              </div>
              <span className="font-bold tracking-tight text-lg">ConnectX</span>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Designing the future of education technology.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-neutral-200">Navigation</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li className="hover:text-white transition-colors">
                <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
              </li>
              <li className="hover:text-white transition-colors">
                <Link href="/auth" className="cursor-pointer">Authentication</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-neutral-200">Legal</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li className="hover:text-white transition-colors cursor-pointer">Terms</li>
              <li className="hover:text-white transition-colors cursor-pointer">Privacy</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-neutral-600 text-sm">
            <span>© 2024 ConnectX Inc. All rights reserved.</span>
            <span className="text-neutral-700">•</span>
            <a href="https://componentry.fun" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-300 transition-colors">
              UI components from <span className="font-semibold">componentry.fun</span>
            </a>
          </div>
          <div className="flex gap-6">
            {[Globe, Server, Code].map((Icon, i) => (
              <div key={i} className="size-10 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group">
                <Icon className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Massive Background Text */}
        <div className="absolute -bottom-40 -left-20 right-0 pointer-events-none select-none opacity-[0.02] overflow-hidden">
          <h1 className="text-[20rem] font-black tracking-tighter text-white leading-none whitespace-nowrap">
            CONNECTX
          </h1>
        </div>
      </div>
    </footer>
  )
}

export default function Page() {
  return (
    <main className="bg-[#F5F5F7] text-neutral-900 selection:bg-orange-500/30 font-sans">
      <Navbar />
      <Hero />
      <VelocityText />
      <ModernFeatures />
      <Footer />
    </main>
  )
}
