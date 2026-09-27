"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { useTheme } from "@/contexts/ThemeContext"
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
    TrendingUp,
    Wallet,
    Sun,
    Moon,
    Menu,
    X,
} from "lucide-react"
import { processSyncQueue, hydrateLocalDatabase } from "@/lib/sync"
import { supabase } from "@/lib/supabase"

const navigation = [
    { name: "Dashboard",     href: "/dashboard",                icon: LayoutDashboard },
    { name: "Livestock",     href: "/dashboard/livestock",      icon: Beef },
    { name: "Records",       href: "/dashboard/records",        icon: ClipboardList },
    { name: "Health Tracker",href: "/dashboard/health",         icon: ShieldPlus },
    { name: "Production",    href: "/dashboard/production",     icon: TrendingUp },
    { name: "Expenses",      href: "/dashboard/expenses",       icon: Wallet },
    { name: "Analytics",     href: "/dashboard/analytics",      icon: BarChart3 },
    { name: "Settings",      href: "/dashboard/settings",       icon: Settings },
]

function isNavActive(pathname: string, href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(href + "/")
}

// Bottom tab bar uses the 5 most-used routes on mobile
const bottomNav = [
    { name: "Home",      href: "/dashboard",                icon: LayoutDashboard },
    { name: "Livestock", href: "/dashboard/livestock",      icon: Beef },
    { name: "Add",       href: "/dashboard/livestock/new",  icon: PlusCircle },
    { name: "Health",    href: "/dashboard/health",         icon: ShieldPlus },
    { name: "Analytics", href: "/dashboard/analytics",      icon: BarChart3 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { t, language, toggleLanguage } = useLanguage()
    const { isDark, toggleTheme } = useTheme()
    const pathname = usePathname()
    const router = useRouter()

    const [farmerName, setFarmerName]   = useState("Farmer")
    const [userEmail, setUserEmail]     = useState("")
    const [userPhone, setUserPhone]     = useState("")
    const [farmName, setFarmName]       = useState("")
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [isDeleting, setIsDeleting]   = useState(false)
    const [deleteError, setDeleteError] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)

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
            await processSyncQueue()
            await hydrateLocalDatabase()
        }

        initializeData()

        window.addEventListener('online', initializeData)
        return () => { window.removeEventListener('online', initializeData) }
    }, [])

    // Close sidebar on route change (mobile)
    useEffect(() => { setSidebarOpen(false) }, [pathname])

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
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.access_token) throw new Error("No active session found. Please log in again.")

            const res = await fetch("/api/delete-account", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.error || "Failed to delete account.")
            }

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

    const initials = farmerName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    // Reusable sidebar content — defined as JSX (not a component) to avoid remount on every render
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* ── Logo / Brand ── */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
                <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-paddy to-paddy-light flex items-center justify-center shadow-lg animate-pulse-glow">
                        <Zap className="h-5 w-5 text-turmeric fill-turmeric" />
                    </div>
                </div>
                <div className="min-w-0">
                    <h2 className="font-extrabold text-sm leading-tight gradient-text-paddy dark:text-emerald-300">
                        AgriHerd
                    </h2>
                    <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
                        Field Terminal v1.0
                    </span>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
                {navigation.map((item, i) => {
                    const isActive = isNavActive(pathname, item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={{ animationDelay: `${i * 40}ms` }}
                            className={`
                                animate-slide-in-left
                                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                transition-all duration-200 group relative
                                ${isActive
                                    ? "bg-paddy text-white shadow-md shadow-paddy/20"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }
                            `}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-turmeric rounded-r-full" />
                            )}
                            <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-turmeric" : ""}`} />
                            <span>{t(item.name)}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* ── Bottom Actions ── */}
            <div className="px-3 pb-4 space-y-2 border-t border-border/50 pt-3">
                {/* Quick register CTA */}
                <Link
                    href="/dashboard/livestock/new"
                    className="btn-shimmer w-full flex items-center justify-center gap-2 bg-gradient-to-r from-paddy to-paddy-light text-white font-semibold py-2.5 rounded-xl text-sm shadow-lg shadow-paddy/20 hover:shadow-paddy/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                    <PlusCircle className="h-4 w-4" />
                    {t("Register Animal")}
                </Link>

                {/* Language + Dark mode row */}
                <div className="flex gap-2">
                    <button
                        onClick={toggleLanguage}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-muted-foreground font-semibold py-2 rounded-xl text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        {language === 'en' ? 'EN / SI' : 'SI / EN'}
                    </button>
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        className="w-10 shrink-0 flex items-center justify-center bg-muted text-muted-foreground rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        {isDark
                            ? <Sun className="w-4 h-4 text-turmeric" />
                            : <Moon className="w-4 h-4" />
                        }
                    </button>
                </div>

                {/* User Profile Card */}
                <div className="glass-card rounded-2xl p-3 space-y-2.5">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-paddy to-paddy-light flex items-center justify-center text-white text-xs font-bold ring-2 ring-turmeric/30">
                                {initials || <User className="w-4 h-4" />}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-card rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{farmerName}</p>
                            {userPhone ? (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span>{userPhone}</span>
                                </p>
                            ) : userEmail ? (
                                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                            ) : farmName ? (
                                <p className="text-xs text-muted-foreground truncate">{farmName}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground">AgriHerd User</p>
                            )}
                        </div>
                    </div>

                    <button
                        id="logout-btn"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Signing out..." : "Log Out"}
                    </button>

                    <button
                        id="delete-account-btn"
                        onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setDeleteError("") }}
                        className="w-full flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-1.5 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="h-screen flex overflow-hidden bg-background">

            {/* ── DESKTOP SIDEBAR (hidden below md) ── */}
            <aside className="hidden md:flex shrink-0 w-64 h-screen flex-col glass-sidebar border-r border-border/60 shadow-sm">
                {sidebarContent}
            </aside>

            {/* ── TABLET HAMBURGER SIDEBAR (md–lg overlay) ── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* Panel */}
                    <aside className="relative z-50 w-72 shrink-0 glass-sidebar border-r border-border/60 shadow-2xl animate-slide-in-left flex flex-col">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Farm background — subtle, fixed */}
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        backgroundImage: "url('/farm-hero-bg.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundAttachment: "fixed",
                        opacity: 0.06,
                    }}
                />
                {/* Gradient wash over the photo so it stays subtle */}
                <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90" />
                {/* Mobile top bar */}
                <header className="relative z-10 md:hidden flex items-center justify-between px-4 py-3 glass-sidebar border-b border-border/60 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-paddy to-paddy-light flex items-center justify-center">
                            <Zap className="h-4 w-4 text-turmeric fill-turmeric" />
                        </div>
                        <span className="font-extrabold text-sm gradient-text-paddy dark:text-emerald-300">AgriHerd</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                        {isDark ? <Sun className="w-4 h-4 text-turmeric" /> : <Moon className="w-4 h-4" />}
                    </button>
                </header>

                <main className="relative z-10 flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 h-full">
                    {children}
                </main>

                {/* ── MOBILE BOTTOM TAB BAR ── */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-sidebar border-t border-border/60 px-2 pb-safe">
                    <div className="flex items-center justify-around py-2">
                        {bottomNav.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            const isCenter = item.name === "Add"
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                                        isCenter
                                            ? "relative -top-4 w-14 h-14 bg-gradient-to-br from-paddy to-paddy-light text-white rounded-2xl shadow-lg shadow-paddy/30 flex items-center justify-center"
                                            : isActive
                                                ? "text-paddy dark:text-emerald-400"
                                                : "text-muted-foreground"
                                    }`}
                                >
                                    <Icon className={isCenter ? "w-6 h-6" : "w-5 h-5"} />
                                    {!isCenter && (
                                        <span className="text-[10px] font-medium">{item.name}</span>
                                    )}
                                    {isActive && !isCenter && (
                                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-paddy dark:bg-emerald-400" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>

            {/* ── Delete Account Confirmation Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="glass-card rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-3">
                                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">Delete Account</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                This will permanently delete your account and all associated data.
                                <strong className="text-foreground"> This cannot be undone.</strong>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-red-600 dark:text-red-400">DELETE</span> to confirm
                            </label>
                            <input
                                id="delete-confirm-input"
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE here"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-mono"
                                autoComplete="off"
                            />
                            {deleteError && (
                                <p className="text-xs text-red-500 mt-1.5">{deleteError}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                id="delete-cancel-btn"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors"
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