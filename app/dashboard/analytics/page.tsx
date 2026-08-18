import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, Zap } from "lucide-react"

export default function AnalyticsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Overview</h1>
                <p className="text-gray-500 mt-1">Real-time performance metrics and historical yield comparisons.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                            Weekly Performance <TrendingUp className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">94.2%</div>
                        <div className="text-xs text-emerald-600 mt-1 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">+3.4% vs last week</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                            Predicted Trends <Activity className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">Stable</div>
                        <div className="text-xs text-gray-500 mt-1">Yield projected to maintain current trajectory.</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-red-200 bg-red-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-red-700 uppercase flex items-center justify-between">
                            Active Alerts <Zap className="h-4 w-4 fill-red-600 animate-pulse" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700">2</div>
                        <div className="text-xs text-red-600 mt-1">Units requiring immediate attention.</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm min-h-[400px] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-lg">Yield Comparison vs Historical Data</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center bg-gray-50/50 m-6 rounded-lg border border-dashed">
                    <p className="text-gray-400 text-sm">Interactive Chart Component (e.g., Recharts) will render here.</p>
                </CardContent>
            </Card>
        </div>
    )
}