"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Droplets, Zap, AlertCircle, Loader2, Beef, Bird, PiggyBank } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useLanguage } from "@/contexts/LanguageContext"
import { SyncStatus } from "@/components/agriherd/SyncStatus"
import { LedgerRow } from "@/components/agriherd/LedgerRow"
import { AlertFlag } from "@/components/agriherd/AlertFlag"
import { TagBadge } from "@/components/agriherd/TagBadge"

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
    const animals = useLiveQuery(() => db.animals.toArray())
    const pendingCount = useLiveQuery(() => db.animals.where('syncStatus').equals('pending').count(), [], undefined)
    const healthMetrics = useLiveQuery(() => db.healthMetrics.toArray())
    const vaccinations = useLiveQuery(() => db.vaccinations.toArray())
    
    let cattleCount = 0;
    let pigCount = 0;
    let poultryCount = 0;
    let cattleTag = '';
    let pigTag = '';
    let poultryTag = '';
    let totalAnimalCount = 0;
    
    if (animals) {
        totalAnimalCount = animals.length;
        animals.forEach(a => {
            if (a.species === "Bovine") { cattleCount++; cattleTag = cattleTag || a.tagId; }
            else if (a.species === "Porcine") { pigCount++; pigTag = pigTag || a.tagId; }
            else if (a.species === "Poultry") { poultryCount += (a.flock_size || 1); poultryTag = poultryTag || a.tagId; }
        });
    }

    const alerts: any[] = [];
    if (healthMetrics) {
        healthMetrics.forEach((metric) => {
            const animal = animals?.find(a => a.tagId === metric.animalTagId);
            const species = animal?.species || 'Unknown';
            let highTempThreshold = species === "Poultry" ? 42.0 : 39.5;
            
            if (metric.temperature > highTempThreshold) {
                alerts.push({
                    id: `hm-${metric.id}`,
                    tagId: metric.animalTagId,
                    title: "High Fever Detected",
                    detail: `Temp: ${metric.temperature}°C`
                });
            }
        });
    }

    if (vaccinations) {
        vaccinations.forEach(v => {
            // Also checking if the date is passed
            const isOverdue = v.status === 'overdue' || new Date(v.next_due_date) < new Date();
            if (isOverdue) {
                alerts.push({
                    id: `v-${v.id}`,
                    tagId: v.animal_id,
                    title: "Overdue Treatment",
                    detail: `${v.name} (${v.type}) overdue`
                });
            }
        });
    }

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
                    <SyncStatus state={isOnline && pendingCount === 0 ? "synced" : "queued"} />
                </div>
            </div>

            {/* Active Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
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

            {/* Ledger Summary Strip */}
            <div className="bg-husk/20 rounded-md p-4 space-y-1">
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
                    valueClassName={pendingCount && pendingCount > 0 ? "text-laterite" : "text-paddy"}
                />
            </div>

            {/* Species Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-ink/70">Cattle</CardTitle>
                        <Beef className="h-4 w-4 text-laterite" />
                    </CardHeader>
                    <CardContent>
                        {animals === undefined ? (
                            <div className="flex items-center text-ink/50 mt-1">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-3xl font-bold font-mono text-ink">{cattleCount}</span>
                                {cattleTag && <div><TagBadge tagId={cattleTag} /></div>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-ink/70">Pigs</CardTitle>
                        <PiggyBank className="h-4 w-4 text-laterite" />
                    </CardHeader>
                    <CardContent>
                        {animals === undefined ? (
                            <div className="flex items-center text-ink/50 mt-1">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-3xl font-bold font-mono text-ink">{pigCount}</span>
                                {pigTag && <div><TagBadge tagId={pigTag} /></div>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-ink/70">Poultry</CardTitle>
                        <Bird className="h-4 w-4 text-laterite" />
                    </CardHeader>
                    <CardContent>
                        {animals === undefined ? (
                            <div className="flex items-center text-ink/50 mt-1">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-3xl font-bold font-mono text-ink">{poultryCount}</span>
                                {poultryTag && <div><TagBadge tagId={poultryTag} /></div>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}