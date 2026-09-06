'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ALL_CATEGORIES } from '@/lib/constants/categories'

interface CategoryPieChartProps {
  data: { category_id: string; amount: number }[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = data.map(d => {
    const category = ALL_CATEGORIES.find(c => c.id === d.category_id)
    return {
      name: category?.name || 'Unknown',
      value: d.amount,
      color: category?.color || '#94a3b8'
    }
  }).sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
        No expense data available for this period.
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, 'Amount']}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
