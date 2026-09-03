"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Droplets, Zap, AlertCircle, Loader2 } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useLanguage } from "@/contexts/LanguageContext"

export default function DashboardOverview() {
    const { t } = useLanguage()

    // Network status tracking for offline-first architecture
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // Only run on client
        setIsOnline(navigator.onLine)
        
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        
        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)
        
        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    // Fetch live data directly from the local Dexie database
    const animalCount = useLiveQuery(() => db.animals.count(), [], undefined)
    const pendingCount = useLiveQuery(() => db.animals.where('syncStatus').equals('pending').count(), [], undefined)
    const healthMetrics = useLiveQuery(() => db.healthMetrics.toArray())

    // Dynamic Calculations
    const today = new Date().toISOString().split("T")[0] // e.g., "2026-09-02"
    
    const totalDailyYield = healthMetrics?.reduce((sum, metric) => {
        // Check if the recordedAt date matches today
        const metricDate = new Date(metric.recordedAt).toISOString().split("T")[0]
        if (metricDate === today) {
            return sum + (metric.yieldAmount || 0)
        }
        return sum
    }, 0) || 0

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("dashboardTitle")}</h1>
                    <p className="text-gray-500 mt-1">{t("dashboardSubtitle")}</p>
                </div>
                {/* Network Status Indicator Badge */}
                <div className="flex items-center">
                    {isOnline ? (
                        <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                            <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                            Online - Synced
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
                            <div className="h-2 w-2 rounded-full bg-amber-600" />
                            Offline - Queuing Data
                        </span>
                    )}
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Dynamic Active Herd Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{t("activeHerd")}</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        {animalCount === undefined ? (
                            <div className="flex items-center text-gray-400 mt-1">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold text-gray-900">{animalCount}</div>
                                <p className="text-xs text-gray-500 mt-1">{t("totalRegistered")}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Dynamic Daily Yield Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{t("dailyYield")}</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        {healthMetrics === undefined ? (
                            <div className="flex items-center text-gray-400 mt-1">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold text-gray-900">{totalDailyYield.toFixed(1)}</div>
                                <p className="text-xs text-emerald-600 font-medium mt-1">{t("liveCalc")}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* System Health Card (Dynamic Pending Sync Status) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{t("systemHealth")}</CardTitle>
                        <Zap className={`h-4 w-4 ${isOnline ? "text-emerald-500" : "text-amber-500"}`} />
                    </CardHeader>
                    <CardContent>
                        {pendingCount === undefined ? (
                            <div className="flex items-center text-gray-400 mt-1">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <div className={`text-3xl font-bold ${pendingCount === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                    {pendingCount}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t("pendingSync")}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Active Alerts Card (Static for now) */}
                <Card className="bg-red-50/50 border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">{t("activeAlerts")}</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700">0</div>
                        <p className="text-xs text-red-600 mt-1">{t("immediateAttention")}</p>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}