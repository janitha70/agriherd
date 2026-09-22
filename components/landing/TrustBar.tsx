import { ShieldCheck, Star, Users, Zap } from "lucide-react"

const TRUST_ITEMS = [
    { icon: ShieldCheck, label: "Bank-grade encryption",  color: "text-emerald-600 dark:text-emerald-400" },
    { icon: Star,        label: "Rated #1 offline farm app", color: "text-turmeric" },
    { icon: Users,       label: "Trusted by 1,200+ farms",   color: "text-blue-500 dark:text-blue-400" },
    { icon: Zap,         label: "No subscription required",   color: "text-purple-500 dark:text-purple-400" },
]

export function TrustBar() {
    return (
        <section className="border-y border-border/50 bg-gradient-to-r from-background via-muted/30 to-background py-5 overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
                    {TRUST_ITEMS.map(({ icon: Icon, label, color }, i) => (
                        <div
                            key={label}
                            style={{ animationDelay: `${i * 80}ms` }}
                            className="animate-fade-slide-up flex items-center gap-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-default group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                                <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                            </div>
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
