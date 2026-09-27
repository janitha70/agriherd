"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SettingsPage() {
    const { t } = useLanguage()
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-emerald-300">{t("settingsTitle")}</h1>
                <p className="text-gray-500 dark:text-muted-foreground mt-1">{t("settingsSubtitle")}</p>
            </div>

            {/* Sync Status - Crucial for offline-first */}
            <Card className="shadow-sm border-l-4 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <WifiOff className="h-5 w-5 text-amber-500" />
                        {t("syncStatusQueue")}
                    </CardTitle>
                    <CardDescription>{t("syncDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-amber-900 dark:text-amber-400">{t("offlineModeActive")}</p>
                            <p className="text-sm text-amber-700 dark:text-amber-500">{t("dataCached")}</p>
                        </div>
                        <Button variant="outline" className="bg-white dark:bg-transparent border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("forceSync")}
                        </Button>
                    </div>

                    <div className="space-y-2 mt-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-emerald-100">{t("pendingCachedActions")} (2)</h3>
                        <div className="border rounded-lg divide-y dark:divide-border text-sm">
                            <div className="p-3 flex justify-between items-center">
                                <span className="font-medium dark:text-emerald-100">Log Vitals (Tag B-7492)</span>
                                <span className="text-gray-500 dark:text-muted-foreground">10 mins ago</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="font-medium dark:text-emerald-100">New Registration (Tag pending)</span>
                                <span className="text-gray-500 dark:text-muted-foreground">1 hr ago</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Details */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">{t("accountDetails")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>{t("operatorName")}</Label>
                        <Input defaultValue="John H. Smith" disabled className="bg-gray-50 dark:bg-emerald-950/10" />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("clearanceLevel")}</Label>
                        <Input defaultValue="Level 4 - Manager" disabled className="bg-gray-50 dark:bg-emerald-950/10" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>{t("terminalId")}</Label>
                        <div className="flex gap-2">
                            <Input defaultValue="TERM-992-BETA" disabled className="bg-gray-50 dark:bg-emerald-950/10 font-mono" />
                            <Button variant="secondary">{t("copy")}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Preferences */}
            <Card className="shadow-sm mb-12">
                <CardHeader>
                    <CardTitle className="text-lg">{t("systemThresholds")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-emerald-950/20 transition-colors">
                        <Checkbox id="offline" defaultChecked />
                        <div className="space-y-1 leading-none">
                            <label htmlFor="offline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-emerald-100">
                                {t("forceOfflineMode")}
                            </label>
                            <p className="text-xs text-muted-foreground">{t("forceOfflineDesc")}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-emerald-950/20 transition-colors">
                        <Checkbox id="alerts" defaultChecked />
                        <div className="space-y-1 leading-none">
                            <label htmlFor="alerts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-emerald-100">
                                {t("criticalAlertsOnly")}
                            </label>
                            <p className="text-xs text-muted-foreground">{t("criticalAlertsDesc")}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}