import { WifiOff, CloudUpload, Activity, BarChart3, Shield, Tractor } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeatureGrid() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Why AgriHerd</p>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Engineered for the field, not the office.</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Your farm does not stop when the cell towers go down, and neither should your software.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: WifiOff, color: "bg-blue-50 text-blue-600",
                            title: "100% Offline Capable",
                            desc: "Log vitals, register animals, and view analytics from the deepest pastures using on-device IndexedDB storage."
                        },
                        {
                            icon: CloudUpload, color: "bg-emerald-50 text-emerald-600",
                            title: "Self-Healing Cloud Sync",
                            desc: "The moment you walk back into range, our background queue engine securely pushes all pending records to the cloud."
                        },
                        {
                            icon: Activity, color: "bg-purple-50 text-purple-600",
                            title: "Instant Health Alerts",
                            desc: "Client-side logic flags dangerous temperature spikes or yield drops immediately. Zero server round-trips needed."
                        },
                        {
                            icon: BarChart3, color: "bg-orange-50 text-orange-600",
                            title: "Production Analytics",
                            desc: "Visualize yield trends, feed efficiency, and herd health trajectories across any time window."
                        },
                        {
                            icon: Shield, color: "bg-red-50 text-red-600",
                            title: "Enterprise Security",
                            desc: "All data encrypted in transit and at rest. Row-level security ensures your farm data stays private."
                        },
                        {
                            icon: Tractor, color: "bg-yellow-50 text-yellow-600",
                            title: "Multi-Species Support",
                            desc: "Built for dairy cattle, poultry, swine, and sheep. One terminal to manage your entire operation."
                        },
                    ].map(({ icon: Icon, color, title, desc }) => (
                        <Card key={title} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                            <CardContent className="pt-6 space-y-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
