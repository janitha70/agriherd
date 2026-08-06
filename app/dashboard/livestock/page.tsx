import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Zap, Search, Plus } from "lucide-react"
import Link from "next/link"

export default function LivestockDirectory() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Livestock Directory</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor active herd status.</p>
                </div>
                <Link href="/dashboard/livestock/new">
                    <Button className="bg-emerald-900 hover:bg-emerald-800 text-white font-medium">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Animal
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search Tag ID, Species..." className="pl-9 bg-white" />
                </div>
                <select className="border-gray-200 rounded-md text-sm p-2 bg-white border outline-none focus:ring-2 focus:ring-emerald-900">
                    <option>All Species</option>
                    <option>Bovine (Ayrshire)</option>
                    <option>Poultry</option>
                </select>
                <select className="border-gray-200 rounded-md text-sm p-2 bg-white border outline-none focus:ring-2 focus:ring-emerald-900">
                    <option>All Status</option>
                    <option>Healthy</option>
                    <option>Flagged</option>
                </select>
            </div>

            {/* Livestock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">

                {/* Healthy Animal Card */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">TAG ID</p>
                            <CardTitle className="text-xl">#A-8842</CardTitle>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                            Healthy
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                                🐄
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Bovine (Ayrshire)</p>
                                <p className="text-xs text-gray-500">Age: 24 mos • Wgt: 1250 lbs</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                            <span>📍 Pasture 3</span>
                            <span className="text-emerald-700 font-medium">View Profile →</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Flagged Animal Card with Zap Alert */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200 bg-red-50/30">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">TAG ID</p>
                            <CardTitle className="text-xl">#O-1190</CardTitle>
                        </div>
                        <div className="flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                            <Zap className="h-3 w-3 fill-red-600 text-red-600 animate-pulse" />
                            Flagged
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                                🐄
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Bovine (Ayrshire)</p>
                                <p className="text-xs text-gray-500">Age: 19 mos • Wgt: 1145 lbs</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                            <span>📍 Barn B</span>
                            <span className="text-red-600 font-medium">Review Metrics →</span>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}