import { WifiOff, CloudUpload, Activity, BarChart3, Shield, Tractor } from "lucide-react"

const FEATURES = [
    {
        icon: WifiOff,
        color: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        gradientFrom: "from-blue-50 dark:from-blue-900/10",
        title: "100% Offline Capable",
        desc: "Log vitals, register animals, and view analytics from the deepest pastures using on-device IndexedDB storage.",
    },
    {
        icon: CloudUpload,
        color: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        gradientFrom: "from-emerald-50 dark:from-emerald-900/10",
        title: "Self-Healing Cloud Sync",
        desc: "The moment you walk back into range, our background queue engine securely pushes all pending records to the cloud.",
    },
    {
        icon: Activity,
        color: "text-purple-600 dark:text-purple-400",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        gradientFrom: "from-purple-50 dark:from-purple-900/10",
        title: "Instant Health Alerts",
        desc: "Client-side logic flags dangerous temperature spikes or yield drops immediately. Zero server round-trips needed.",
    },
    {
        icon: BarChart3,
        color: "text-orange-600 dark:text-orange-400",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        gradientFrom: "from-orange-50 dark:from-orange-900/10",
        title: "Production Analytics",
        desc: "Visualize yield trends, feed efficiency, and herd health trajectories across any time window.",
    },
    {
        icon: Shield,
        color: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30",
        gradientFrom: "from-red-50 dark:from-red-900/10",
        title: "Enterprise Security",
        desc: "All data encrypted in transit and at rest. Row-level security ensures your farm data stays private.",
    },
    {
        icon: Tractor,
        color: "text-yellow-600 dark:text-yellow-400",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        gradientFrom: "from-yellow-50 dark:from-yellow-900/10",
        title: "Multi-Species Support",
        desc: "Built for dairy cattle, poultry, swine, and sheep. One terminal to manage your entire operation.",
    },
]

export function FeatureGrid() {
    return (
        <section className="py-28 px-6 bg-background">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-paddy/10 dark:bg-emerald-900/20 border border-paddy/20 dark:border-emerald-800/40">
                        <span className="text-xs font-bold uppercase tracking-widest text-paddy dark:text-emerald-400">
                            Why AgriHerd
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                        Engineered for the field,{" "}
                        <span className="gradient-text-paddy">not the office.</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                        Your farm does not stop when the cell towers go down, and neither should your software.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {FEATURES.map(({ icon: Icon, color, iconBg, gradientFrom, title, desc }, i) => (
                        <div
                            key={title}
                            style={{ animationDelay: `${i * 80}ms` }}
                            className={`
                                animate-fade-slide-up hover-lift
                                group relative rounded-2xl p-6 border border-border
                                bg-gradient-to-br ${gradientFrom} to-background
                                shadow-sm hover:shadow-lg transition-all duration-300
                                overflow-hidden
                            `}
                        >
                            {/* Hover glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-white/5 dark:to-white/3" />

                            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <h3 className="relative text-lg font-bold text-foreground mb-2">{title}</h3>
                            <p className="relative text-muted-foreground text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
