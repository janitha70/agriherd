"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    LayoutDashboard,
    Beef,
    PlusCircle,
    ClipboardList,
    Activity,
    BarChart3,
    Settings,
    Zap,
    LogOut,
    User,
    Trash2,
    AlertTriangle,
    Phone,
    ShieldPlus,
    TrendingUp
} from "lucide-react"
import { processSyncQueue, hydrateLocalDatabase } from "@/lib/sync"
import { supabase } from "@/lib/supabase"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Livestock", href: "/dashboard/livestock", icon: Beef },
    { name: "Add Animal", href: "/dashboard/livestock/new", icon: PlusCircle },
    { name: "Records", href: "/dashboard/records", icon: ClipboardList },
    { name: "Log Vitals", href: "/dashboard/log-vitals", icon: Activity },
    { name: "Health Tracker", href: "/dashboard/health", icon: ShieldPlus },
    { name: "Production", href: "/dashboard/production", icon: TrendingUp },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { t, language, toggleLanguage } = useLanguage()
    const pathname = usePathname()
    const router = useRouter()

    const [farmerName, setFarmerName] = useState("Farmer")
    const [userEmail, setUserEmail] = useState("")
    const [userPhone, setUserPhone] = useState("")
    const [farmName, setFarmName] = useState("")
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    // Load farmer profile from Supabase & localStorage
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                const fullName = user.user_metadata?.full_name || user.user_metadata?.name
                if (fullName) setFarmerName(fullName)
                if (user.email) setUserEmail(user.email)
                if (user.phone) setUserPhone(user.phone)
            } else {
                const name = localStorage.getItem("agriherd_farmer_name")
                if (name) setFarmerName(name)
            }

            const phone = localStorage.getItem("agriherd_phone_number")
            if (phone) setUserPhone(phone)

            const farm = localStorage.getItem("agriherd_farm_name")
            if (farm) setFarmName(farm)
        }
        
        fetchUser()
    }, [])

    // --- Offline-First Background Sync Logic ---
    useEffect(() => {
        const initializeData = async () => {
            // Push any offline data up to Supabase
            await processSyncQueue()
            // Pull the latest cloud data down to Dexie
            await hydrateLocalDatabase()
        }

        // Run once when the dashboard loads
        initializeData()

        // Listen for the device reconnecting to the internet
        window.addEventListener('online', initializeData)

        // Cleanup listener when leaving the dashboard
        return () => {
            window.removeEventListener('online', initializeData)
        }
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await supabase.auth.signOut()
        } catch (_) {
            // Sign out locally even if Supabase call fails
        } finally {
            localStorage.removeItem("agriherd_session")
            localStorage.removeItem("agriherd_farmer_name")
            localStorage.removeItem("agriherd_farm_name")
            localStorage.removeItem("agriherd_phone_number")
            router.push("/")
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") return
        setIsDeleting(true)
        setDeleteError("")
        try {
            // 1. Get the active Supabase session to extract the access token
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.access_token) {
                throw new Error("No active session found. Please log in again.")
            }

            // 2. Call the server-side API route, passing the token in the Authorization header
            const res = await fetch("/api/delete-account", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
            })

            // 3. Handle the response
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.error || "Failed to delete account.")
            }

            // 4. Success — sign out locally and redirect to landing page
            await supabase.auth.signOut()
            localStorage.removeItem("agriherd_session")
            localStorage.removeItem("agriherd_farmer_name")
            localStorage.removeItem("agriherd_farm_name")
            localStorage.removeItem("agriherd_phone_number")
            router.push("/")
        } catch (err: any) {
            setDeleteError(err?.message || "Something went wrong. Please try again.")
            setIsDeleting(false)
        }
    }


    // Derive initials for the avatar
    const initials = farmerName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

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
                                    {t(item.name)}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom: Quick Action + User Profile */}
                <div className="space-y-3">
                    <Link
                        href="/dashboard/livestock/new"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-950 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-emerald-900 transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" />
                        {t("Register Animal")}
                    </Link>

                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors shadow-sm"
                    >
                        {language === 'en' ? 'EN / සිං' : 'සිං / EN'}
                    </button>

                    {/* User Profile Card */}
                    <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-3">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-white text-xs font-bold">
                                {initials || <User className="w-4 h-4" />}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{farmerName}</p>
                                {userPhone ? (
                                    <p className="text-xs text-emerald-700 font-medium truncate flex items-center gap-1.5 mt-0.5">
                                        <Phone className="w-3 h-3 shrink-0 text-emerald-600" />
                                        <span>{userPhone}</span>
                                    </p>
                                ) : userEmail ? (
                                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                                ) : farmName ? (
                                    <p className="text-xs text-gray-400 truncate">{farmName}</p>
                                ) : (
                                    <p className="text-xs text-gray-400">AgriHerd User</p>
                                )}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            id="logout-btn"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <LogOut className="h-4 w-4" />
                            {isLoggingOut ? "Signing out..." : "Log Out"}
                        </button>

                        {/* Delete Account Button */}
                        <button
                            id="delete-account-btn"
                            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setDeleteError("") }}
                            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content View */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>

            {/* ── Delete Account Confirmation Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        {/* Icon + Title */}
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="bg-red-100 p-3 rounded-full mb-3">
                                <AlertTriangle className="w-7 h-7 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Delete Account</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                This will permanently delete your account and all associated data.
                                <strong className="text-gray-700"> This cannot be undone.</strong>
                            </p>
                        </div>

                        {/* Confirmation input */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600">DELETE</span> to confirm
                            </label>
                            <input
                                id="delete-confirm-input"
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE here"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-mono"
                                autoComplete="off"
                            />
                            {deleteError && (
                                <p className="text-xs text-red-500 mt-1.5">{deleteError}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                id="delete-cancel-btn"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                id="delete-confirm-btn"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}