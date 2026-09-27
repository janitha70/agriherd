'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useTheme } from '@/contexts/ThemeContext'

export function ProfitabilityChart() {
  const { isDark } = useTheme()
  const tickColor = isDark ? '#E8DCC4' : '#2C2C2C'
  const gridColor = isDark ? '#233930' : '#E8DCC4'
  const tooltipBg = isDark ? '#1F342B' : '#FFF'

  const animals = useLiveQuery(() => db.animals.toArray()) || []
  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  const yields = useLiveQuery(() => db.production_yields.toArray()) || []

  // Assumed price per liter for milk
  const MILK_PRICE_PER_LITER = 120
  const EGG_PRICE = 25

  const data = useMemo(() => {
    const animalMap = new Map<string, { tagId: string; species: string; expenses: number; income: number; profit: number }>()

    animals.forEach(a => {
        animalMap.set(a.tagId, { tagId: a.tagId, species: a.species, expenses: 0, income: 0, profit: 0 })
    })

    expenses.forEach(e => {
        if (e.animal_tag_id && animalMap.has(e.animal_tag_id)) {
            const a = animalMap.get(e.animal_tag_id)!
            a.expenses += e.amount
        }
    })

    yields.forEach(y => {
        if (y.animal_id && animalMap.has(y.animal_id)) {
            const a = animalMap.get(y.animal_id)!
            if (y.product_type === 'milk') {
                a.income += y.quantity * MILK_PRICE_PER_LITER
            } else if (y.product_type === 'eggs') {
                a.income += y.quantity * EGG_PRICE
            }
        }
    })

    const result = Array.from(animalMap.values())
        .filter(a => a.expenses > 0 || a.income > 0)
        .map(a => {
            a.profit = a.income - a.expenses
            return a
        })
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10) // top 10

    return result
  }, [animals, expenses, yields])

  const formatLKR = (value: number) => {
    if (Math.abs(value) >= 1000) return `Rs.${(value / 1000).toFixed(1)}k`
    return `Rs.${value}`
  }

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ink dark:text-emerald-100">Profitability by Animal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-ink/40 dark:text-emerald-100/40">
              Not enough data. Tag expenses/yields to animals.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
                <XAxis 
                  dataKey="tagId" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: tickColor, opacity: 0.7 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatLKR}
                  tick={{ fontSize: 12, fill: tickColor, opacity: 0.7 }}
                />
                <Tooltip 
                  cursor={{ fill: gridColor, opacity: 0.2 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tickColor }}
                  formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: tickColor }} />
                <Bar dataKey="income" name="Value (Rs.)" fill="#1F4B3F" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Cost (Rs.)" fill="#A6472B" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
