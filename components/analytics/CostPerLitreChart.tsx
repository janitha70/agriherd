'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useTheme } from '@/contexts/ThemeContext'

export function CostPerLitreChart() {
  const { isDark } = useTheme()
  const tickColor = isDark ? '#E8DCC4' : '#2C2C2C'
  const gridColor = isDark ? '#233930' : '#E8DCC4'
  const tooltipBg = isDark ? '#1F342B' : '#FFF'

  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  const yields = useLiveQuery(() => db.production_yields.toArray()) || []

  const data = useMemo(() => {
    const dataMap = new Map<string, { month: string; milkLiters: number; totalExpenses: number; cpl: number }>()

    yields.forEach(y => {
        if (y.product_type !== 'milk') return
        try {
            const month = format(parseISO(y.collection_date), 'MMM yyyy')
            const current = dataMap.get(month) || { month, milkLiters: 0, totalExpenses: 0, cpl: 0 }
            current.milkLiters += y.quantity
            dataMap.set(month, current)
        } catch (e) {}
    })

    expenses.forEach(e => {
        try {
            const month = format(parseISO(e.expense_date), 'MMM yyyy')
            if (dataMap.has(month)) {
                const current = dataMap.get(month)!
                current.totalExpenses += e.amount
            }
        } catch (e) {}
    })

    const result = Array.from(dataMap.values()).map(d => {
        d.cpl = d.milkLiters > 0 ? Number((d.totalExpenses / d.milkLiters).toFixed(2)) : 0
        return d
    })

    return result.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [expenses, yields])

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ink dark:text-emerald-100">Cost Per Litre (CPL)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-ink/40 dark:text-emerald-100/40">
              Not enough data for CPL calculation.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: tickColor, opacity: 0.7 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `Rs.${v}`}
                  tick={{ fontSize: 12, fill: tickColor, opacity: 0.7 }}
                />
                <Tooltip 
                  cursor={{ fill: gridColor, opacity: 0.2 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tickColor }}
                  formatter={(value: any) => [`Rs. ${value}`, 'CPL']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: tickColor }} />
                <Bar dataKey="cpl" name="Cost Per Litre (Rs.)" fill="#D9A05B" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
