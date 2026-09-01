"use client"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CTABannerProps {
    onOpenAuth: () => void;
}

export function CTABanner({ onOpenAuth }: CTABannerProps) {
    return (
        <section className="bg-gradient-to-r from-emerald-900 to-teal-800 py-20 px-6">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Ready to modernize your farm?
                </h2>
                <p className="text-emerald-200 text-lg mb-8">
                    Set up your operation in under 2 minutes. No credit card. No commitment.
                </p>
                <Button
                    id="cta-bottom-btn"
                    size="lg"
                    onClick={onOpenAuth}
                    className="h-14 px-12 text-lg bg-white text-emerald-900 font-bold hover:bg-emerald-50 shadow-xl"
                >
                    Start for Free <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </section>
    )
}
