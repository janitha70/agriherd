import { Shield, Star, Users, CheckCircle } from "lucide-react"

export function TrustBar() {
    return (
        <section className="bg-gray-50 border-y border-gray-100 py-6">
            <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12">
                {[
                    { icon: Shield, label: "Bank-grade encryption" },
                    { icon: Star, label: "Rated #1 offline farm app" },
                    { icon: Users, label: "Trusted by 1,200+ farms" },
                    { icon: CheckCircle, label: "No subscription required" },
                ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                        <Icon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {label}
                    </div>
                ))}
            </div>
        </section>
    )
}
