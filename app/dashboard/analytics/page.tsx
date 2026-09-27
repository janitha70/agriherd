'use client';

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db'; // Ensure this matches your Dexie setup path
import { Zap, Activity, Droplet, Wheat, Beef, Bird, PiggyBank } from 'lucide-react';

// Shadcn UI Imports
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';

import { YieldTrendsChart } from '@/components/analytics/YieldTrendsChart';
import { ProfitabilityChart } from '@/components/analytics/ProfitabilityChart';
import { CostPerLitreChart } from '@/components/analytics/CostPerLitreChart';

export default function AnalyticsDashboard() {
    const { t } = useLanguage();
    // 1. Fetch live data from local IndexedDB
    const animals = useLiveQuery(() => db.animals.toArray()) || [];
    const metrics = useLiveQuery(() => db.healthMetrics.toArray()) || [];

    // 2. Compute Analytics locally (Zero network latency)
    const analytics = useMemo(() => {
        let totalYield = 0;
        let totalFeed = 0;
        let cattleCount = 0;
        let pigCount = 0;
        let poultryCount = 0;
        const alerts: any[] = [];

        animals.forEach(a => {
            if (a.species === "Bovine") cattleCount++;
            else if (a.species === "Porcine") pigCount++;
            else if (a.species === "Poultry") poultryCount += (a.flock_size || 1);
        });

        metrics.forEach((metric) => {
            totalYield += metric.yieldAmount || 0;
            totalFeed += metric.feedIntake || 0;

            const animal = animals.find(a => a.tagId === metric.animalTagId);
            const species = animal?.species || 'Unknown';
            
            // Smart Warning Logic: Flag high temperatures or low yield based on species
            let highTempThreshold = 39.5; // Default for Cattle and Pigs
            if (species === "Poultry") highTempThreshold = 42.0;

            if (metric.temperature > highTempThreshold || metric.yieldAmount < 5) {
                alerts.push({
                    id: metric.id,
                    tagId: metric.animalTagId,
                    species: species,
                    issue: metric.temperature > highTempThreshold ? `High Temp: ${metric.temperature}°C` : 'Low Yield Drop',
                    recordedAt: new Date(metric.recordedAt).toLocaleDateString()
                });
            }
        });

        return { totalYield, totalFeed, cattleCount, pigCount, poultryCount, alerts };
    }, [metrics, animals]);

    return (
        <div className="p-4 space-y-6 max-w-5xl mx-auto min-h-screen pb-24">
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
                            <Alert key={alert.id} variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/50">
                                <Zap className="h-5 w-5 dark:text-red-400" />
                                <AlertTitle className="font-bold text-red-900 dark:text-red-400">
                                    Tag: {alert.tagId} ({alert.species})
                                </AlertTitle>
                                <AlertDescription className="mt-1 flex flex-col gap-1 text-red-700 dark:text-red-300">
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
                <Card className="shadow-sm border-border">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("totalYield7Days")}</p>
                            <p className="text-3xl font-bold">{analytics.totalYield.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">L</span></p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full dark:bg-blue-900/30">
                            <Droplet className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                {/* Feed Card */}
                <Card className="shadow-sm border-border">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("totalFeedConsumed")}</p>
                            <p className="text-3xl font-bold">{analytics.totalFeed.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">kg</span></p>
                        </div>
                        <div className="bg-paddy/10 p-3 rounded-full dark:bg-emerald-900/30">
                            <Wheat className="w-7 h-7 text-paddy dark:text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>

                {/* Herd Breakdown */}
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-6">Active Herd Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card className="shadow-sm border-border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Cattle (Bovine)</p>
                                <p className="text-2xl font-bold">{analytics.cattleCount}</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded-full dark:bg-purple-900/30">
                                <Beef className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Pigs (Porcine)</p>
                                <p className="text-2xl font-bold">{analytics.pigCount}</p>
                            </div>
                            <div className="bg-pink-50 p-2 rounded-full dark:bg-pink-900/30">
                                <PiggyBank className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Poultry (Birds)</p>
                                <p className="text-2xl font-bold">{analytics.poultryCount}</p>
                            </div>
                            <div className="bg-turmeric/10 p-2 rounded-full dark:bg-yellow-900/30">
                                <Bird className="w-5 h-5 text-turmeric dark:text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* --- ADVANCED ANALYTICS SECTION --- */}
            <section className="space-y-4 pt-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Advanced Insights</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                        <YieldTrendsChart />
                    </div>
                    <ProfitabilityChart />
                    <CostPerLitreChart />
                </div>
            </section>
        </div>
    );
}