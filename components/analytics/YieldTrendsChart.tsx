'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useTheme } from '@/contexts/ThemeContext'

export function YieldTrendsChart() {
  const { isDark } = useTheme()
  const tickColor = isDark ? '#E8DCC4' : '#2C2C2C'
  const gridColor = isDark ? '#233930' : '#E8DCC4'
  const tooltipBg = isDark ? '#1F342B' : '#FFF'

  const yields = useLiveQuery(() => db.production_yields.orderBy('collection_date').reverse().toArray()) || []

  const data = useMemo(() => {
    // Generate last 30 days map
    const dataMap = new Map<string, { dateStr: string; milk: number; eggs: number }>()
    for (let i = 29; i >= 0; i--) {
        const d = subDays(new Date(), i)
        const dateStr = format(d, 'MMM dd')
        dataMap.set(dateStr, { dateStr, milk: 0, eggs: 0 })
    }

    // Populate
    yields.forEach(y => {
        try {
            const dateStr = format(parseISO(y.collection_date), 'MMM dd')
            if (dataMap.has(dateStr)) {
                const current = dataMap.get(dateStr)!
                if (y.product_type === 'milk') {
                    current.milk += y.quantity
                } else if (y.product_type === 'eggs') {
                    current.eggs += y.quantity
                }
            }
        } catch (e) {
            // ignore invalid dates
        }
    })

    return Array.from(dataMap.values())
  }, [yields])

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ink dark:text-emerald-100">Yield Trends (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-ink/40 dark:text-emerald-100/40">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
                <XAxis 
                  dataKey="dateStr" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: tickColor, opacity: 0.7 }}
                  dy={10}
                  minTickGap={20}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: tickColor, opacity: 0.7 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: tickColor, opacity: 0.7 }}
                />
                <Tooltip 
                  cursor={{ stroke: gridColor, strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tickColor }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: tickColor }} />
                <Line yAxisId="left" type="monotone" dataKey="milk" name="Milk (L)" stroke="#1F4B3F" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="eggs" name="Eggs (Count)" stroke="#D9A05B" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
