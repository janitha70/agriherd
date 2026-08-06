"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Beef,
    PlusCircle,
    ClipboardList,
    BarChart3,
    Settings,
    Zap
} from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Livestock", href: "/dashboard/livestock", icon: Beef },
    { name: "Add Animal", href: "/dashboard/livestock/new", icon: PlusCircle },
    { name: "Records", href: "/dashboard/records", icon: ClipboardList },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar - Field Terminal */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4">
                <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <div className="bg-emerald-900 text-white p-2 rounded-md">
                            <Zap className="h-5 w-5 text-emerald-400 fill-emerald-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">Field Terminal</h2>
                            <span className="text-xs text-gray-400">Industrial Node v1.0</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-emerald-900 text-white"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer Quick Action */}
                <div className="border-t pt-4">
                    <Link
                        href="/dashboard/livestock/new"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-950 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-emerald-900 transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Register Animal
                    </Link>
                </div>
            </aside>

            {/* Main Content View */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}