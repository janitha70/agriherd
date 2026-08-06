import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Beef, Droplets, Zap } from "lucide-react"

export default function DashboardOverview() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Real-time herd status and production metrics.</p>
            </div>

            {/* High-Level Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Herd</CardTitle>
                        <Beef className="h-4 w-4 text-emerald-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,284</div>
                        <p className="text-xs text-gray-400 mt-1">Total registered entities</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-emerald-600">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Daily Yield (Liters)</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4,520</div>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">+2.4% from yesterday</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">Stable</div>
                        <p className="text-xs text-gray-400 mt-1">All sensors responding</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-2 border-red-100 bg-red-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-red-700">Active Alerts</CardTitle>
                        <Zap className="h-5 w-5 text-red-500 fill-red-500 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">2</div>
                        <p className="text-xs text-red-600 mt-1">Units requiring immediate attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <Card className="lg:col-span-2 shadow-sm min-h-[300px] flex items-center justify-center bg-gray-50/50">
                    <p className="text-gray-400 text-sm">Yield Comparison Chart (Placeholder)</p>
                </Card>

                <Card className="shadow-sm flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Resource Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Feed</span>
                                <span className="text-gray-500">45%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-800 w-[45%]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Water</span>
                                <span className="text-gray-500">80%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[80%]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Medical</span>
                                <span className="text-gray-500">12%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 w-[12%]"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}