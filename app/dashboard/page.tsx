"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Droplets, HeartPulse, AlertCircle } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"

export default function DashboardOverview() {
    // Fetch live data directly from the local Dexie database
    const animals = useLiveQuery(() => db.animals.toArray())
    const healthMetrics = useLiveQuery(() => db.healthMetrics.toArray())

    // Dynamic Calculations
    const activeHerdCount = animals?.length || 0

    const totalDailyYield = healthMetrics?.reduce((sum, metric) => {
        // Add up the yieldAmount from every health log, defaulting to 0 if missing
        return sum + (metric.yieldAmount || 0)
    }, 0) || 0

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Real-time herd status and production metrics.</p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Dynamic Active Herd Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Herd</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {animals === undefined ? "..." : activeHerdCount}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total registered entities</p>
                    </CardContent>
                </Card>

                {/* Dynamic Daily Yield Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Daily Yield (Liters/Kg)</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {healthMetrics === undefined ? "..." : totalDailyYield.toFixed(1)}
                        </div>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Live local calculation</p>
                    </CardContent>
                </Card>

                {/* System Health Card (Static for now) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">System Health</CardTitle>
                        <HeartPulse className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">Stable</div>
                        <p className="text-xs text-gray-500 mt-1">Local database connected</p>
                    </CardContent>
                </Card>

                {/* Active Alerts Card (Static for now) */}
                <Card className="bg-red-50/50 border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Active Alerts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700">0</div>
                        <p className="text-xs text-red-600 mt-1">Units requiring immediate attention</p>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}