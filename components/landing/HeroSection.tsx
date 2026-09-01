"use client"
import { ArrowRight, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
    onOpenAuth: () => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
    return (
        <section className="relative bg-[#0a1f14] overflow-hidden">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Now with offline-first sync - v1.0
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
                    The field terminal{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                        your herd deserves.
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Industrial-grade livestock management that works in the most remote pastures.
                    Log vitals, track yields, and sync to the cloud with no signal required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Button
                        id="hero-register-btn"
                        size="lg"
                        onClick={onOpenAuth}
                        className="w-full sm:w-auto h-14 px-10 text-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-2xl shadow-emerald-500/30 transition-all duration-200"
                    >
                        Register New Farmer <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                        id="hero-login-btn"
                        size="lg"
                        variant="outline"
                        onClick={onOpenAuth}
                        className="w-full sm:w-auto h-14 px-10 text-lg border-white/20 text-white hover:bg-white/10 bg-transparent font-semibold"
                    >
                        <LogIn className="mr-2 w-5 h-5" />
                        Log In
                    </Button>
                </div>
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
                    <div>
                        <p className="text-3xl font-extrabold text-white">50K+</p>
                        <p className="text-sm text-gray-400 mt-1">Animals Tracked</p>
                    </div>
                    <div className="border-x border-white/10">
                        <p className="text-3xl font-extrabold text-white">98%</p>
                        <p className="text-sm text-gray-400 mt-1">Sync Reliability</p>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-white">0ms</p>
                        <p className="text-sm text-gray-400 mt-1">Offline Latency</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
