"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Zap, Clock, CheckCircle2 } from "lucide-react"
import { db } from "@/lib/db"
import { useLanguage } from "@/contexts/LanguageContext"

export default function RecordsPage() {
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        entityId: "",
        temp: "",
        feed: "",
        yield: "",
        observations: ""
    })

    // 1. Fetch live animals for the dropdown (Zero network latency)
    const animals = useLiveQuery(() => db.animals.toArray()) || []

    // 2. Fetch the 5 most recent logs for the sidebar
    const recentLogs = useLiveQuery(() =>
        db.healthMetrics.orderBy('recordedAt').reverse().limit(5).toArray()
    ) || []

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

            // Offline Check & Form Reset
            if (!navigator.onLine) {
                alert(`✅ Offline Success! Vitals for ${formData.entityId} saved to local queue.`);
            } else {
                // If online, the global SyncProvider will automatically flush this!
                alert(`✅ Success! Vitals logged and syncing to cloud.`);
            }

            setFormData({ entityId: "", temp: "", feed: "", yield: "", observations: "" })

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
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("newLogEntry")}</h1>
                <p className="text-gray-500 mt-1">{t("logVitalsDesc")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="lg:col-span-2">
                    <Card className="shadow-sm border-gray-200">
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="entityId">{t("entityIdLabel")}</Label>
                                <select
                                    id="entityId"
                                    value={formData.entityId}
                                    onChange={handleChange}
                                    required
                                    className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>{t("selectAnimal")}</option>
                                    {animals.map((animal) => (
                                        <option key={animal.id} value={animal.tagId}>
                                            {animal.tagId} ({animal.species})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="temp">{t("bodyTemp")}</Label>
                                    <Input id="temp" type="number" step="0.1" value={formData.temp} onChange={handleChange} required placeholder="38.5" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="feed">{t("feedIntake")}</Label>
                                    <Input id="feed" type="number" step="0.1" value={formData.feed} onChange={handleChange} required placeholder="12.0" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="yield">{t("dailyYield")}</Label>
                                <Input id="yield" type="number" step="0.1" value={formData.yield} onChange={handleChange} required placeholder="24.5" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observations">{t("behavioralObs")}</Label>
                                <textarea
                                    id="observations"
                                    value={formData.observations}
                                    onChange={handleChange}
                                    className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder={t("obsPlaceholder")}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t rounded-b-xl py-4">
                            <Button type="submit" disabled={isSubmitting || animals.length === 0} className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold">
                                {isSubmitting ? t("logging") : t("submitLog")}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* DYNAMIC SIDEBAR */}
                <Card className="shadow-sm h-fit border-gray-200">
                    <CardHeader className="border-b pb-4 bg-gray-50/50 rounded-t-xl">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-500" />
                            {t("recentEntries")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentLogs.length === 0 ? (
                                <p className="p-6 text-sm text-center text-gray-500">{t("noVitals")}</p>
                            ) : (
                                recentLogs.map((log) => {
                                    const isAlert = log.temperature > 39.5 || log.yieldAmount < 5;
                                    return (
                                        <div key={log.id} className={`p-4 ${isAlert ? 'bg-red-50/50' : 'bg-white'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-bold ${isAlert ? 'text-red-900' : 'text-gray-900'}`}>
                                                    {log.animalTagId}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {isAlert ? (
                                                <div className="text-sm text-red-700 flex items-center gap-1">
                                                    <Zap className="h-3 w-3 fill-red-600" />
                                                    Flagged: {log.temperature > 39.5 ? `High Temp (${log.temperature}°C)` : 'Low Yield'}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                    Yield: {log.yieldAmount} | Temp: {log.temperature}°C
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}