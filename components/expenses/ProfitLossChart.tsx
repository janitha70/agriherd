'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { LocalExpense, LocalFarmIncome } from '@/lib/types/expenses'
import { format, parseISO } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

interface ProfitLossChartProps {
  expenses: LocalExpense[]
  income: LocalFarmIncome[]
}

export function ProfitLossChart({ expenses, income }: ProfitLossChartProps) {
  const { t } = useLanguage()
  const { isDark } = useTheme()
  const tickColor = isDark ? '#E8DCC4' : '#64748b'
  const gridColor = isDark ? '#233930' : '#f0fdf4'
  const tooltipBg = isDark ? '#1F342B' : '#f1f5f9'

  // Group by month
  const dataMap = new Map<string, { month: string; expenses: number; income: number }>()

  expenses.forEach(e => {
    const month = format(parseISO(e.expense_date), 'MMM yyyy')
    const current = dataMap.get(month) || { month, expenses: 0, income: 0 }
    current.expenses += e.amount
    dataMap.set(month, current)
  })

  income.forEach(i => {
    const month = format(parseISO(i.income_date), 'MMM yyyy')
    const current = dataMap.get(month) || { month, expenses: 0, income: 0 }
    current.income += i.amount
    dataMap.set(month, current)
  })

  // Convert to array and sort chronologically (simplified sort assuming recent months)
  const data = Array.from(dataMap.values()).reverse()

  const formatLKR = (value: number) => {
    if (value >= 1000) return `Rs.${(value / 1000).toFixed(1)}k`
    return `Rs.${value}`
  }

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-emerald-100">{t('chartIncomeVsExpenses')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-muted-foreground">
              No data available to plot chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: tickColor }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatLKR}
                  tick={{ fontSize: 12, fill: tickColor }}
                />
                <Tooltip 
                  cursor={{ fill: gridColor, opacity: 0.2 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tickColor }}
                  formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: tickColor }} />
                <Bar dataKey="income" name={t('chartIncome')} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name={t('chartExpenses')} fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
