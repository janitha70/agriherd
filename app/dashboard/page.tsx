"use client"

import { useState, useEffect } from "react"
import { Activity, Droplets, Zap, AlertCircle, Loader2, Beef, Bird, PiggyBank, CloudOff, Cloud } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useLanguage } from "@/contexts/LanguageContext"
import { SyncStatus } from "@/components/agriherd/SyncStatus"
import { LedgerRow } from "@/components/agriherd/LedgerRow"
import { AlertFlag } from "@/components/agriherd/AlertFlag"
import { TagBadge } from "@/components/agriherd/TagBadge"

// Animated counter hook
function useCountUp(target: number, duration = 800) {
    const [value, setValue] = useState(0)
    useEffect(() => {
        if (target === 0) { setValue(0); return }
        const step = Math.ceil(target / (duration / 16))
        let current = 0
        const timer = setInterval(() => {
            current = Math.min(current + step, target)
            setValue(current)
            if (current >= target) clearInterval(timer)
        }, 16)
        return () => clearInterval(timer)
    }, [target, duration])
    return value
}

export default function DashboardOverview() {
    const { t } = useLanguage()
    const [isOnline, setIsOnline] = useState(true)
    const [now, setNow] = useState("")

    useEffect(() => {
        setIsOnline(navigator.onLine)
        const handleOnline  = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener("online",  handleOnline)
        window.addEventListener("offline", handleOffline)

        // Live clock
        const updateClock = () => {
            setNow(new Date().toLocaleString("en-GB", {
                weekday: "long", day: "numeric", month: "long",
                hour: "2-digit", minute: "2-digit"
            }))
        }
        updateClock()
        const clockTimer = setInterval(updateClock, 30_000)

        return () => {
            window.removeEventListener("online",  handleOnline)
            window.removeEventListener("offline", handleOffline)
            clearInterval(clockTimer)
        }
    }, [])

    const animals       = useLiveQuery(() => db.animals.toArray())
    const pendingCount  = useLiveQuery(() => db.animals.where('syncStatus').equals('pending').count(), [], undefined)
    const healthMetrics = useLiveQuery(() => db.healthMetrics.toArray())
    const vaccinations  = useLiveQuery(() => db.vaccinations.toArray())

    let cattleCount = 0, pigCount = 0, poultryCount = 0
    let cattleTag = '', pigTag = '', poultryTag = ''
    let totalAnimalCount = 0

    if (animals) {
        totalAnimalCount = animals.length
        animals.forEach(a => {
            if (a.species === "Bovine")   { cattleCount++;  cattleTag  = cattleTag  || a.tagId }
            else if (a.species === "Porcine")  { pigCount++;    pigTag     = pigTag     || a.tagId }
            else if (a.species === "Poultry")  { poultryCount += (a.flock_size || 1); poultryTag = poultryTag || a.tagId }
        })
    }

    const alerts: any[] = []
    if (healthMetrics) {
        healthMetrics.forEach((metric) => {
            const animal = animals?.find(a => a.tagId === metric.animalTagId)
            const species = animal?.species || 'Unknown'
            const highTempThreshold = species === "Poultry" ? 42.0 : 39.5
            if (metric.temperature > highTempThreshold) {
                alerts.push({ id: `hm-${metric.id}`, tagId: metric.animalTagId, title: "High Fever Detected", detail: `Temp: ${metric.temperature}°C` })
            }
        })
    }
    if (vaccinations) {
        vaccinations.forEach(v => {
            const isOverdue = v.status === 'overdue' || new Date(v.next_due_date) < new Date()
            if (isOverdue) {
                alerts.push({ id: `v-${v.id}`, tagId: v.animal_id, title: "Overdue Treatment", detail: `${v.name} (${v.type}) overdue` })
            }
        })
    }

    const today = new Date().toISOString().split("T")[0]
    const totalDailyYield = healthMetrics?.reduce((sum, metric) => {
        const metricDate = new Date(metric.recordedAt).toISOString().split("T")[0]
        return metricDate === today ? sum + (metric.yieldAmount || 0) : sum
    }, 0) || 0

    const animatedTotal   = useCountUp(totalAnimalCount)
    const animatedYield   = useCountUp(Math.round(totalDailyYield * 10))
    const animatedCattle  = useCountUp(cattleCount)
    const animatedPig     = useCountUp(pigCount)
    const animatedPoultry = useCountUp(poultryCount)

    const speciesCards = [
        {
            label: "Cattle",
            count: animatedCattle,
            rawCount: cattleCount,
            tag: cattleTag,
            icon: Beef,
            gradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
            iconColor: "text-orange-500 dark:text-orange-400",
            iconBg: "bg-orange-100 dark:bg-orange-900/30",
            border: "border-orange-100 dark:border-orange-800/30",
        },
        {
            label: "Pigs",
            count: animatedPig,
            rawCount: pigCount,
            tag: pigTag,
            icon: PiggyBank,
            gradient: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
            iconColor: "text-pink-500 dark:text-pink-400",
            iconBg: "bg-pink-100 dark:bg-pink-900/30",
            border: "border-pink-100 dark:border-pink-800/30",
        },
        {
            label: "Poultry",
            count: animatedPoultry,
            rawCount: poultryCount,
            tag: poultryTag,
            icon: Bird,
            gradient: "from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20",
            iconColor: "text-sky-500 dark:text-sky-400",
            iconBg: "bg-sky-100 dark:bg-sky-900/30",
            border: "border-sky-100 dark:border-sky-800/30",
        },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="animate-fade-slide-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-text-paddy dark:text-emerald-300">
                        {t("dashboardTitle")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{now}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Online/Offline badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        isOnline
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                    }`}>
                        {isOnline
                            ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><Cloud className="w-3 h-3" /> Online</>
                            : <><span className="w-1.5 h-1.5 rounded-full bg-red-500" /><CloudOff className="w-3 h-3" /> Offline</>
                        }
                    </div>
                    <SyncStatus state={isOnline && pendingCount === 0 ? "synced" : "queued"} />
                </div>
            </div>

            {/* ── Active Alerts ── */}
            {alerts.length > 0 && (
                <div className="space-y-2 animate-fade-slide-up delay-100">
                    {alerts.map(alert => (
                        <AlertFlag
                            key={alert.id}
                            title={alert.title}
                            detail={alert.detail}
                            tagId={alert.tagId}
                        />
                    ))}
                </div>
            )}

            {/* ── Hero Stats Row ── */}
            <div className="animate-fade-slide-up delay-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Herd */}
                <div className="hover-lift glass-card rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute inset-0 gradient-paddy-soft opacity-60" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Herd</span>
                            <div className="w-8 h-8 rounded-lg bg-paddy/10 dark:bg-emerald-400/10 flex items-center justify-center">
                                <Beef className="w-4 h-4 text-paddy dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-4xl font-extrabold font-mono tracking-tight text-paddy dark:text-emerald-300">
                            {animals === undefined ? <Loader2 className="w-8 h-8 animate-spin" /> : animatedTotal}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">animals registered</p>
                    </div>
                </div>

                {/* Today's Yield */}
                <div className="hover-lift glass-card rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-yellow-50/60 dark:from-amber-900/10 dark:to-yellow-900/10 opacity-60" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Today's Yield</span>
                            <div className="w-8 h-8 rounded-lg bg-turmeric/10 flex items-center justify-center">
                                <Droplets className="w-4 h-4 text-turmeric" />
                            </div>
                        </div>
                        <p className="text-4xl font-extrabold font-mono tracking-tight text-turmeric">
                            {(animatedYield / 10).toFixed(1)}
                            <span className="text-lg font-bold ml-1">L</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">daily milk / yield</p>
                    </div>
                </div>

                {/* Pending Sync */}
                <div className="hover-lift glass-card rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-60" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pending Sync</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className={`text-4xl font-extrabold font-mono tracking-tight ${
                            pendingCount && pendingCount > 0
                                ? "text-laterite dark:text-orange-400"
                                : "text-paddy dark:text-emerald-400"
                        }`}>
                            {pendingCount === undefined ? <Loader2 className="w-8 h-8 animate-spin" /> : pendingCount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">records awaiting cloud</p>
                    </div>
                </div>
            </div>

            {/* ── HUD Ledger Strip ── */}
            <div className="animate-fade-slide-up delay-300 glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-paddy dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Live Herd Ledger
                    </span>
                </div>
                <div className="px-5 py-2">
                    <LedgerRow
                        label={t("activeHerd") || "Active Herd"}
                        value={totalAnimalCount === 0 ? "0" : totalAnimalCount}
                    />
                    <LedgerRow
                        label={t("dailyYield") || "Today's Yield"}
                        value={`${totalDailyYield.toFixed(1)} L`}
                        valueClassName="text-turmeric"
                    />
                    <LedgerRow
                        label={t("pendingSync") || "Pending Sync"}
                        value={pendingCount === undefined ? "0" : pendingCount}
                        valueClassName={pendingCount && pendingCount > 0 ? "text-laterite dark:text-orange-400" : "text-paddy dark:text-emerald-400"}
                    />
                </div>
            </div>

            {/* ── Species Breakdown ── */}
            <div className="animate-fade-slide-up delay-400">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Species Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {speciesCards.map(({ label, count, rawCount, tag, icon: Icon, gradient, iconColor, iconBg, border }, i) => (
                        <div
                            key={label}
                            style={{ animationDelay: `${(i + 5) * 80}ms` }}
                            className={`animate-fade-slide-up hover-lift rounded-2xl p-5 border bg-gradient-to-br ${gradient} ${border} transition-all duration-200`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                                    <Icon className={`w-5 h-5 ${iconColor}`} />
                                </div>
                            </div>
                            {animals === undefined ? (
                                <div className="flex items-center text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <span className="text-4xl font-extrabold font-mono tracking-tight text-foreground">{count}</span>
                                    {tag && <TagBadge tagId={tag} />}
                                    {rawCount === 0 && (
                                        <span className="text-xs text-muted-foreground">No records yet</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}