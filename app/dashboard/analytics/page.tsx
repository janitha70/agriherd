'use client';

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db'; // Ensure this matches your Dexie setup path
import { Zap, Activity, Droplet, Wheat } from 'lucide-react';

// Shadcn UI Imports
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AnalyticsDashboard() {
    const { t } = useLanguage();
    // 1. Fetch live data from local IndexedDB
    const animals = useLiveQuery(() => db.animals.toArray()) || [];
    const metrics = useLiveQuery(() => db.healthMetrics.toArray()) || [];

    // 2. Compute Analytics locally (Zero network latency)
    const analytics = useMemo(() => {
        let totalYield = 0;
        let totalFeed = 0;
        const alerts: any[] = [];

        metrics.forEach((metric) => {
            totalYield += metric.yieldAmount || 0;
            totalFeed += metric.feedIntake || 0;

            // Smart Warning Logic: Flag high temperatures or low yield
            if (metric.temperature > 39.5 || metric.yieldAmount < 5) {
                const animal = animals.find(a => a.tagId === metric.animalTagId);
                alerts.push({
                    id: metric.id,
                    tagId: metric.animalTagId,
                    species: animal?.species || 'Unknown',
                    issue: metric.temperature > 39.5 ? `High Temp: ${metric.temperature}°C` : 'Low Yield Drop',
                    recordedAt: new Date(metric.recordedAt).toLocaleDateString()
                });
            }
        });

        return { totalYield, totalFeed, alerts };
    }, [metrics, animals]);

    return (
        <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen pb-24">
            <header className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight">{t("analyticsTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("analyticsSubtitle")}</p>
            </header>

            {/* --- SMART ALERTS SECTION --- */}
            {analytics.alerts.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("activeAlerts")}</h2>
                    <div className="space-y-3">
                        {analytics.alerts.map((alert) => (
                            <Alert key={alert.id} variant="destructive" className="bg-red-50 border-red-200">
                                <Zap className="h-5 w-5" />
                                <AlertTitle className="font-bold text-red-900">
                                    Tag: {alert.tagId} ({alert.species})
                                </AlertTitle>
                                <AlertDescription className="mt-1 flex flex-col gap-1 text-red-700">
                                    <span className="text-sm font-medium">{alert.issue}</span>
                                    <span className="text-xs opacity-80">{alert.recordedAt}</span>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                </section>
            )}

            {/* --- PERFORMANCE OVERVIEW SECTION --- */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("weeklyPerformance")}</h2>

                {/* Yield Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("totalYield7Days")}</p>
                            <p className="text-3xl font-bold">{analytics.totalYield.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">L</span></p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Droplet className="w-7 h-7 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Feed Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("totalFeedConsumed")}</p>
                            <p className="text-3xl font-bold">{analytics.totalFeed.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">kg</span></p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-full">
                            <Wheat className="w-7 h-7 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Active Herd Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("activeMonitoredHerd")}</p>
                            <p className="text-3xl font-bold">{animals.length} <span className="text-lg font-normal text-muted-foreground">{t("head")}</span></p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-full">
                            <Activity className="w-7 h-7 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}