"use client"

import { ChevronRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CTABannerProps {
    onOpenAuth: () => void;
}

export function CTABanner({ onOpenAuth }: CTABannerProps) {
    return (
        <section className="relative overflow-hidden py-24 px-6">
            {/* Farm background photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/farm-dashboard-bg.jpg"
                alt="Farm twilight background"
                className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                aria-hidden="true"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-paddy/70 to-black/85" />
            {/* Subtle grid texture */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative max-w-3xl mx-auto text-center">
                {/* Icon badge */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                    <Zap className="w-7 h-7 text-turmeric fill-turmeric" />
                </div>

                <h2 className="animate-fade-slide-up text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                    Ready to modernize your farm?
                </h2>
                <p className="animate-fade-slide-up delay-100 text-emerald-200/90 text-lg mb-10 leading-relaxed">
                    Set up your operation in under 2 minutes.{" "}
                    <span className="font-semibold text-white">No credit card. No commitment.</span>
                </p>
                <Button
                    id="cta-bottom-btn"
                    size="lg"
                    onClick={onOpenAuth}
                    className="animate-fade-slide-up delay-200 btn-shimmer h-14 px-12 text-lg bg-white text-paddy font-bold hover:bg-turmeric hover:text-white rounded-2xl shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-1"
                >
                    Start for Free
                    <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="animate-fade-slide-up delay-300 text-emerald-300/60 text-xs mt-4 tracking-wide">
                    Join 1,200+ farms already using AgriHerd
                </p>
            </div>
        </section>
    )
}
