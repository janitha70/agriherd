"use client"

import { ArrowRight, LogIn, Play, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface HeroSectionProps {
    onOpenAuth: () => void;
}

const STATS = [
    { value: "50K+",  label: "Animals Tracked" },
    { value: "98%",   label: "Sync Reliability" },
    { value: "0ms",   label: "Offline Latency" },
]

// Floating particle (pure CSS, no library)
function Particle({ style }: { style: React.CSSProperties }) {
    return (
        <div
            className="absolute rounded-full bg-emerald-400/20 dark:bg-emerald-400/10 pointer-events-none"
            style={style}
        />
    )
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const particles = [
        { width: 80,  height: 80,  top: "15%", left: "8%",  animationDuration: "7s",  animationDelay: "0s"   },
        { width: 48,  height: 48,  top: "60%", left: "5%",  animationDuration: "9s",  animationDelay: "1s"   },
        { width: 120, height: 120, top: "20%", right: "6%", animationDuration: "11s", animationDelay: "0.5s" },
        { width: 64,  height: 64,  top: "70%", right: "10%",animationDuration: "8s",  animationDelay: "2s"   },
        { width: 32,  height: 32,  top: "40%", left: "20%", animationDuration: "6s",  animationDelay: "0.8s" },
        { width: 56,  height: 56,  top: "35%", right: "22%",animationDuration: "10s", animationDelay: "1.5s" },
    ]

    return (
        <section className="relative overflow-hidden">

            {/* Farm background photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/farm-hero-bg.jpg"
                alt="Farm background"
                className="absolute inset-0 w-full h-full object-cover object-center"
                aria-hidden="true"
            />

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

            {/* Green tint overlay to match brand */}
            <div className="absolute inset-0 bg-gradient-to-br from-paddy/40 via-transparent to-black/30" />

            {/* Floating particles */}
            {mounted && particles.map((p, i) => (
                <Particle
                    key={i}
                    style={{
                        width: p.width,
                        height: p.height,
                        top: p.top,
                        left: (p as any).left,
                        right: (p as any).right,
                        animation: `float ${p.animationDuration} ease-in-out ${p.animationDelay} infinite`,
                    }}
                />
            ))}

            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: "linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">

                {/* Badge */}
                <div className="animate-fade-slide-up inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/20 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Wifi className="w-3.5 h-3.5" />
                    Now with Offline-First Sync — v1.0
                </div>

                {/* Headline */}
                <h1 className="animate-fade-slide-up delay-100 text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.08]">
                    The field terminal{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300">
                        your herd deserves.
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="animate-fade-slide-up delay-200 text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Industrial-grade livestock management that works in the most remote pastures.
                    Log vitals, track yields, and sync to the cloud with <span className="text-emerald-400 font-semibold">no signal required.</span>
                </p>

                {/* CTAs */}
                <div className="animate-fade-slide-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Button
                        id="hero-register-btn"
                        size="lg"
                        onClick={onOpenAuth}
                        className="btn-shimmer group w-full sm:w-auto h-14 px-10 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-2xl shadow-emerald-500/30 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                    >
                        Start for Free
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        id="hero-login-btn"
                        size="lg"
                        variant="outline"
                        onClick={onOpenAuth}
                        className="w-full sm:w-auto h-14 px-10 text-lg border-white/20 text-white hover:bg-white/10 hover:border-white/40 bg-transparent font-semibold rounded-2xl transition-all duration-200 backdrop-blur-sm"
                    >
                        <LogIn className="mr-2 w-5 h-5" />
                        Log In
                    </Button>
                </div>

                {/* Stats Bar */}
                <div className="animate-fade-slide-up delay-400 grid grid-cols-3 gap-0 max-w-2xl mx-auto border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md shadow-2xl">
                    {STATS.map(({ value, label }, i) => (
                        <div
                            key={label}
                            className={`py-6 px-4 text-center ${i < STATS.length - 1 ? "border-r border-white/10" : ""} hover:bg-white/5 transition-colors duration-200`}
                        >
                            <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
                            <p className="text-sm text-gray-400 mt-1 font-medium">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Scroll hint */}
                <div className="animate-fade-slide-up delay-500 mt-12 flex flex-col items-center gap-2 opacity-50">
                    <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
                        <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
                </div>
            </div>
        </section>
    )
}
