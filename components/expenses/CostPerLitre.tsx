'use client'

import React, { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Droplet, TrendingDown, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function CostPerLitre() {
  const { t } = useLanguage()
  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  const yields = useLiveQuery(() => db.production_yields.toArray()) || []

  const stats = useMemo(() => {
    // Current month filter
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    
    // Previous month filter
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonth = lastMonthDate.toISOString().slice(0, 7)

    const currentMonthExpenses = expenses.filter(e => e.expense_date.startsWith(currentMonth))
    const currentMonthYields = yields.filter(y => y.product_type === 'milk' && y.collection_date.startsWith(currentMonth))

    const lastMonthExpenses = expenses.filter(e => e.expense_date.startsWith(lastMonth))
    const lastMonthYields = yields.filter(y => y.product_type === 'milk' && y.collection_date.startsWith(lastMonth))

    const calcCPL = (exp: any[], yld: any[]) => {
      const totalExp = exp.reduce((sum, e) => sum + e.amount, 0)
      const totalYield = yld.reduce((sum, y) => sum + y.quantity, 0)
      return totalYield > 0 ? totalExp / totalYield : 0
    }

    const currentCPL = calcCPL(currentMonthExpenses, currentMonthYields)
    const lastCPL = calcCPL(lastMonthExpenses, lastMonthYields)

    const diff = lastCPL > 0 ? ((currentCPL - lastCPL) / lastCPL) * 100 : 0
    
    return {
      currentCPL,
      diff,
      totalYield: currentMonthYields.reduce((sum, y) => sum + y.quantity, 0)
    }
  }, [expenses, yields])

  if (stats.totalYield === 0) {
    return (
      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-border flex flex-col items-center justify-center text-center h-full">
        <Droplet className="w-8 h-8 text-gray-300 dark:text-muted-foreground/50 mb-2" />
        <p className="text-gray-500 dark:text-muted-foreground font-medium">{t('costPerLitre')}</p>
        <p className="text-sm text-gray-400 dark:text-muted-foreground/70 mt-1">{t('noMilkProduction')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-border flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-muted-foreground">
          <Droplet className="w-4 h-4" />
          <h3 className="font-semibold uppercase tracking-wider text-xs">{t('costPerLitre')}</h3>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 dark:text-emerald-100">
                Rs. {stats.currentCPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-gray-500 dark:text-muted-foreground text-sm font-medium">/ L</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm">
        {stats.diff < 0 ? (
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full font-medium">
            <TrendingDown className="w-3 h-3 mr-1" />
            {Math.abs(stats.diff).toFixed(1)}% {t('vsLastMonth')}
          </span>
        ) : stats.diff > 0 ? (
          <span className="flex items-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full font-medium">
            <TrendingUp className="w-3 h-3 mr-1" />
            {stats.diff.toFixed(1)}% {t('vsLastMonth')}
          </span>
        ) : (
          <span className="text-gray-500 dark:text-muted-foreground">{t('noChange')}</span>
        )}
      </div>
    </div>
  )
}
