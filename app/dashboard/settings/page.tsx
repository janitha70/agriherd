import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile & Settings</h1>
                <p className="text-gray-500 mt-1">Manage account preferences and offline synchronization.</p>
            </div>

            {/* Sync Status - Crucial for offline-first */}
            <Card className="shadow-sm border-l-4 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <WifiOff className="h-5 w-5 text-amber-500" />
                        Sync Status & Queue
                    </CardTitle>
                    <CardDescription>Monitor network connectivity and manage cached actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-amber-50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-amber-900">Offline Mode Active</p>
                            <p className="text-sm text-amber-700">Data is safely cached locally.</p>
                        </div>
                        <Button variant="outline" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Force Sync
                        </Button>
                    </div>

                    <div className="space-y-2 mt-4">
                        <h3 className="text-sm font-bold text-gray-900">Pending Cached Actions (2)</h3>
                        <div className="border rounded-lg divide-y text-sm">
                            <div className="p-3 flex justify-between items-center">
                                <span className="font-medium">Log Vitals (Tag B-7492)</span>
                                <span className="text-gray-500">10 mins ago</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="font-medium">New Registration (Tag pending)</span>
                                <span className="text-gray-500">1 hr ago</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Details */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Operator Name</Label>
                        <Input defaultValue="John H. Smith" disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Clearance Level</Label>
                        <Input defaultValue="Level 4 - Manager" disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Terminal ID</Label>
                        <div className="flex gap-2">
                            <Input defaultValue="TERM-992-BETA" disabled className="bg-gray-50 font-mono" />
                            <Button variant="secondary">Copy</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Preferences */}
            <Card className="shadow-sm mb-12">
                <CardHeader>
                    <CardTitle className="text-lg">System Thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox id="offline" defaultChecked />
                        <div className="space-y-1 leading-none">
                            <label htmlFor="offline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Force Offline Mode
                            </label>
                            <p className="text-xs text-muted-foreground">Store data locally even when connection is restored.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox id="alerts" defaultChecked />
                        <div className="space-y-1 leading-none">
                            <label htmlFor="alerts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Critical Alerts Only
                            </label>
                            <p className="text-xs text-muted-foreground">Mute non-essential notifications in the field.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}