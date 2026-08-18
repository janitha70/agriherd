"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Zap, Clock } from "lucide-react"
import { db } from "@/lib/db"

export default function RecordsPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        entityId: "",
        temp: "",
        feed: "",
        yield: "",
        observations: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const newMetric = {
                animalTagId: formData.entityId,
                temperature: parseFloat(formData.temp),
                feedIntake: parseFloat(formData.feed),
                yieldAmount: parseFloat(formData.yield),
                observations: formData.observations,
                syncStatus: 'pending' as const,
                recordedAt: new Date().toISOString()
            }

            // Save locally
            const localId = await db.healthMetrics.add(newMetric)

            // Queue for cloud sync
            await db.syncQueue.add({
                actionType: 'LOG_VITALS',
                payload: { ...newMetric, localId },
                timestamp: new Date().toISOString()
            })

            // Reset form
            setFormData({ entityId: "", temp: "", feed: "", yield: "", observations: "" })
            alert("Vitals logged locally and queued for sync!")

        } catch (error) {
            console.error("Failed to log vitals:", error)
            alert("Error saving data.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">New Log Entry</h1>
                <p className="text-gray-500 mt-1">Record daily health and production metrics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="lg:col-span-2">
                    <Card className="shadow-sm">
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="entityId">Entity ID / Tag Number</Label>
                                <Input id="entityId" value={formData.entityId} onChange={handleChange} required placeholder="e.g. B-7492" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="temp">Body Temperature (°C)</Label>
                                    <Input id="temp" type="number" step="0.1" value={formData.temp} onChange={handleChange} required placeholder="38.5" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="feed">Feed Intake (kg)</Label>
                                    <Input id="feed" type="number" step="0.1" value={formData.feed} onChange={handleChange} required placeholder="12.0" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="yield">Daily Yield (Liters/Kg)</Label>
                                <Input id="yield" type="number" step="0.1" value={formData.yield} onChange={handleChange} required placeholder="24.5" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observations">Behavioral Observations</Label>
                                <textarea
                                    id="observations"
                                    value={formData.observations}
                                    onChange={handleChange}
                                    className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Note any lethargy, abnormal gait, or off-feed behavior..."
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t rounded-b-xl py-4">
                            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold">
                                {isSubmitting ? "Logging..." : "Submit Log"}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* Static Sidebar (We will make this dynamic later) */}
                <Card className="shadow-sm h-fit">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                            Recent Entries
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            <div className="p-4 bg-red-50/50">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-red-900">A-0021</span>
                                    <span className="text-xs text-red-400">2 hrs ago</span>
                                </div>
                                <div className="text-sm text-red-700 flex items-center gap-1">
                                    <Zap className="h-3 w-3 fill-red-600 animate-pulse" />
                                    Flagged: High Temp (40.2°C)
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}