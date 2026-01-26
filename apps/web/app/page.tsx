"use client"

import * as React from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
  useInView,
  AnimatePresence
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

// --- Utility Components ---

/**
 * A spotlight card effect that follows the mouse
 */
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative border border-neutral-200 bg-white overflow-hidden rounded-xl",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

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
          <div className="size-9 bg-black rounded-lg flex items-center justify-center text-white font-bold font-mono">
            L
          </div>
          <span className="font-bold tracking-tight text-lg text-neutral-900">
            LMS Pro
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
          <Link href="/login" className="text-sm font-medium hover:opacity-70 transition-opacity hidden sm:block">
            Log in
          </Link>
          <Button className="rounded-full bg-black text-white hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95">
            Get Pro
          </Button>
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
          <span className="text-xs font-semibold text-neutral-600 tracking-wide uppercase">Introducing Version 2.0</span>
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
  const baseVelocity = -2;
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
    x.set(x.get() + moveBy);
  });

  return (
    <div className="py-20 bg-white border-y border-neutral-100 overflow-hidden flex whitespace-nowrap">
      <motion.div style={{ x }} className="flex gap-20 text-6xl md:text-8xl font-black text-neutral-300 tracking-tighter uppercase select-none">
        <span>Structure your knowledge.</span>
        <span>Empower your students.</span>
        <span>Build with confidence.</span>
        <span>Structure your knowledge.</span>
      </motion.div>
    </div>
  );
}

// --- Sticky Scroll Feature ---
const features = [
  {
    title: "Curriculum Design",
    description: "Build complex courses with a simple drag-and-drop interface. Support for video, code, quizzes, and projects.",
    color: "bg-blue-500",
    visual: (
      <div className="w-full h-full bg-blue-50 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 flex items-center gap-4 z-10"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
          >
            <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{i}</div>
            <div className="flex-1">
              <div className="h-2 w-24 bg-blue-100 rounded-full mb-2" />
              <div className="h-1.5 w-full bg-neutral-100 rounded-full" />
            </div>
            <div className="text-neutral-300"><ChevronRight size={16} /></div>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    title: "Real-time Analytics",
    description: "Track student progress across all courses. Identify drop-off points and improve your content based on data.",
    color: "bg-purple-500",
    visual: (
      <div className="w-full h-full bg-purple-50 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-purple-100 to-transparent" />
        <div className="flex items-end gap-3 h-48 w-full max-w-sm z-10">
          {[40, 70, 50, 90, 60, 80].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-purple-500 rounded-t-lg shadow-lg shadow-purple-500/20"
              initial={{ height: "10%" }}
              animate={{ height: `${h}%` }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 + (i * 0.05) }}
            />
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Community First",
    description: "Built-in discussion forums and live chat events. Turn your course into a thriving community.",
    color: "bg-orange-500",
    visual: (
      <div className="w-full h-full bg-orange-50 rounded-2xl p-6 relative overflow-hidden">
        <div className="space-y-4 pt-10">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className={`flex gap-4 ${i === 2 ? 'flex-row-reverse' : ''}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 * i }}
            >
              <div className="size-10 rounded-full bg-orange-200 shrink-0" />
              <div className={`p-4 rounded-2xl max-w-[80%] ${i === 2 ? 'bg-orange-500 text-white' : 'bg-white text-neutral-600 shadow-sm'}`}>
                <div className="h-2 w-32 bg-current opacity-20 rounded-full mb-2" />
                <div className="h-2 w-48 bg-current opacity-20 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }
]

function ScrollFeatureText({ feature, index, setActiveCard }: { feature: typeof features[0], index: number, setActiveCard: (i: number) => void }) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" })

  React.useEffect(() => {
    if (isInView) setActiveCard(index)
  }, [isInView, index, setActiveCard])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 py-20",
        isInView ? "opacity-100 scale-100" : "opacity-30 scale-95 blur-sm"
      )}
    >
      <h3 className="text-4xl font-bold mb-4 tracking-tight">{feature.title}</h3>
      <p className="text-xl text-neutral-500 leading-relaxed max-w-md">{feature.description}</p>
    </div>
  )
}

function StickyScroll() {
  const [activeCard, setActiveCard] = React.useState(0);

  return (
    <section className="bg-[#F5F5F7] py-32 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">

        <div className="lg:w-1/2 space-y-20 lg:py-20">
          {features.map((feature, index) => (
            <ScrollFeatureText key={index} feature={feature} index={index} setActiveCard={setActiveCard} />
          ))}
        </div>

        <div className="lg:w-1/2 h-[60vh] sticky top-32">
          <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard}
                className="absolute inset-0 p-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-50">
                  {features[activeCard]?.visual}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  )
}

function GridFeatures() {
  return (
    <section className="bg-white py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Designed for speed.</h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">Every interaction has been obsessively tuned to feel instant.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-8 grid-rows-[300px_300px_300px] md:grid-rows-[300px_300px]">

          {/* Card 1: Global Network (Large 4 cols) */}
          <SpotlightCard className="col-span-1 md:col-span-4 lg:col-span-4 p-8 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-[800px] h-[800px] border border-neutral-950/20 rounded-full flex items-center justify-center">
                <div className="w-[600px] h-[600px] border border-neutral-950/20 rounded-full flex items-center justify-center">
                  <div className="w-[400px] h-[400px] border border-neutral-950/20 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute size-2 bg-blue-500 rounded-full"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`
                  }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.path
                  d="M 100 150 Q 250 50 400 150 T 700 150"
                  fill="none"
                  stroke="url(#gradient-line)"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="opacity-20"
                />
                <defs>
                  <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                <Globe className="size-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Global Edge Network</h3>
              <p className="text-neutral-500 max-w-sm">Content delivered from 200+ regions. 50ms latency worldwide.</p>
            </div>
          </SpotlightCard>

          {/* Card 2: Realtime Sync (Small 2 cols) */}
          <SpotlightCard className="col-span-1 md:col-span-2 lg:col-span-2 p-8 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
              <motion.div
                className="size-48 border-4 border-dashed border-neutral-950 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 size-48 border-4 border-dashed border-neutral-950 rounded-full max-w-[150px] max-h-[150px] m-auto"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div>
              <div className="size-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-6">
                <Zap className="size-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Sync</h3>
              <p className="text-neutral-500 text-sm">State propagates to all clients in milliseconds.</p>
            </div>
          </SpotlightCard>

          {/* Card 3: AI Assistant (Small 2 cols) */}
          <SpotlightCard className="col-span-1 md:col-span-2 lg:col-span-2 p-8 flex flex-col justify-between group">
            <div className="absolute top-8 right-8 space-y-2 w-32 pointer-events-none">
              <motion.div
                className="bg-neutral-100 rounded-2xl p-3 rounded-tr-none text-xs text-neutral-500 ml-auto w-fit"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Summarize this
              </motion.div>
              <motion.div
                className="bg-neutral-900 rounded-2xl p-3 rounded-tl-none text-xs text-white shadow-lg w-full"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex gap-1">
                  <motion.div className="size-1 bg-white rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                  <motion.div className="size-1 bg-white rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="size-1 bg-white rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            </div>

            <div>
              <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Sparkles className="size-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Tutoring</h3>
              <p className="text-neutral-500 text-sm">Personalized help for every student, 24/7.</p>
            </div>
          </SpotlightCard>

          {/* Card 4: Keyboard (Small 2 cols) */}
          <SpotlightCard className="col-span-1 md:col-span-2 lg:col-span-2 p-8 flex flex-col justify-between group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
              {['C', 'M', 'D'].map((key, i) => (
                <motion.div
                  key={key}
                  className="size-10 bg-white border-b-4 border-neutral-200 rounded-lg flex items-center justify-center font-bold text-neutral-400 shadow-xs group-hover:border-b-0 group-hover:translate-y-1 transition-all duration-100"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {key}
                </motion.div>
              ))}
            </div>
            <div>
              <div className="size-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-6">
                <Command className="size-6 text-neutral-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Keyboard First</h3>
              <p className="text-neutral-500 text-sm">Power user shortcuts for everything.</p>
            </div>
          </SpotlightCard>

          {/* Card 5: Security (Small 2 cols) */}
          <SpotlightCard className="col-span-1 md:col-span-2 lg:col-span-2 p-8 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Shield className="size-48 text-green-500" />
            </div>
            <motion.div
              className="absolute top-0 bottom-0 left-0 w-8 bg-linear-to-r from-transparent via-green-500/10 to-transparent skew-x-12"
              animate={{ left: ["0%", "150%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div>
              <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Lock className="size-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
              <p className="text-neutral-500 text-sm">SOC2 Type II certified. Encryption at rest.</p>
            </div>
          </SpotlightCard>

        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-neutral-950 text-white py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-32">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 max-w-4xl mx-auto">
            Ready to transform your <br />
            <span className="text-neutral-500">teaching experience?</span>
          </h2>
          <p className="text-neutral-400 text-xl mb-12 max-w-2xl">
            Join thousands of educators who are already building the future of learning with LMS Pro.
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 border-t border-neutral-900 pt-20">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="size-8 bg-white rounded-lg flex items-center justify-center text-black font-bold font-mono">
                L
              </div>
              <span className="font-bold tracking-tight text-lg">LMS Pro</span>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              Designing the future of education technology. Built for performance, scalability, and beauty.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-neutral-200">Product</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              {["Features", "Integrations", "Pricing", "Changelog", "Docs"].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-neutral-200">Company</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              {["About", "Careers", "Blog", "Legal", "Brand"].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-neutral-200">Resources</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              {["Community", "Contact", "DPA", "Terms", "Privacy"].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-neutral-200">Social</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              {["Twitter", "GitHub", "Discord", "YouTube"].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-900 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-neutral-600 text-sm">
            © 2024 LMS Pro Inc. All rights reserved.
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
            LMS PRO
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
      <StickyScroll />
      <GridFeatures />
      <Footer />
    </main>
  )
}
